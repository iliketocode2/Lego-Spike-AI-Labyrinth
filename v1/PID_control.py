import time
import my_globals
from pyscript import document, window, when
import js
import asyncio

class PIDController:
    def __init__(self, kp, ki, kd, windup_limit=100):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.windup_limit = windup_limit
        self.previous_error = 0
        self.integral = 0
        self.previous_measurement = 0

    def compute(self, setpoint, measurement, dt):
        error = setpoint - measurement
        self.integral += error * dt
        self.integral = max(-self.windup_limit, min(self.windup_limit, self.integral))
        derivative = (measurement - self.previous_measurement) / dt
        output = self.kp * error + self.ki * self.integral - self.kd * derivative
        self.previous_error = error
        self.previous_measurement = measurement
        return output

class BallBalancer:
    def __init__(self, path):
        self.path = path
        self.current_target = 0
        self.pid_x = PIDController(kp=1, ki=0.1, kd=0.05)
        self.pid_y = PIDController(kp=1, ki=0.1, kd=0.05)
        self.motorX_min = -135
        self.motorX_max = -40
        self.motorY_min = -140
        self.motorY_max = -110

    def get_ball_position(self):
        return my_globals.x, my_globals.y

    def scale_output(self, output, motor_min, motor_max):
        pid_max = 100  # Example max PID output, adjust if necessary
        scaled_output = max(motor_min, min(motor_max, (output / pid_max) * (motor_max - motor_min) + motor_min))
        return int(scaled_output)

    async def move_to_next_square(self):
        while self.current_target < len(self.path):
            target = self.path[self.current_target]
            grid_x, grid_y = map(int, target.split(','))
            target_x, target_y = grid_to_pixel(grid_x, grid_y)

            reached_target = False
            attempts = 0
            max_attempts = 100
            stuck_count = 0
            last_position = None

            while not reached_target and attempts < max_attempts:
                ball_x, ball_y = self.get_ball_position()
                
                # Check if the ball is stuck
                if last_position is not None and abs(ball_x - last_position[0]) < 1 and abs(ball_y - last_position[1]) < 1:
                    stuck_count += 1
                else:
                    stuck_count = 0
                last_position = (ball_x, ball_y)

                # If the ball is stuck for x consecutive attempts, send wiggle command
                if stuck_count >= 10:
                    print("Ball appears to be stuck. Sending wiggle command.")
                    my_globals.ble.write("-9000!!-9000")  # Special wiggle command
                    await asyncio.sleep(0.5)  # Wait for wiggle to complete
                    stuck_count = 0
                    continue

                dt = 0.5  # Time step, adjust as needed
                output_x = self.pid_x.compute(target_x, ball_x, dt)
                output_y = self.pid_y.compute(target_y, ball_y, dt)

                # Scale PID outputs to motor commands
                motorX_command = self.scale_output(output_x, self.motorX_min, self.motorX_max)
                motorY_command = self.scale_output(output_y, self.motorY_min, self.motorY_max)

                print(f"Motor to position: {motorX_command}, {motorY_command}. bTarget: {target_x}, {target_y}. bPos: {ball_x}, {ball_y}")
                my_globals.ble.write(f"{motorX_command}!!{motorY_command}")
                await asyncio.sleep(dt)

                attempts += 1

                if abs(target_x - ball_x) < 5 and abs(target_y - ball_y) < 5:  # Tolerance
                    reached_target = True
                    break

            if reached_target:
                print(f"Reached target {self.current_target + 1} of {len(self.path)}")
                self.current_target += 1
            else:
                print(f"Failed to reach target {self.current_target + 1} after {max_attempts} attempts")
                break

        if self.current_target == len(self.path):
            print("Reached the final destination!")
            my_globals.followPathOrNot = False
        else:
            print("Path following incomplete")
            my_globals.followPathOrNot = False

    async def run(self):
        for _ in range(len(self.path)):
            await self.move_to_next_square()
            self.current_target += 1
            if self.current_target >= len(self.path):
                break


def grid_to_pixel(grid_x, grid_y):
    # Define the boundaries of the maze
    left = 77
    right = 267
    top = 210
    bottom = 22
    
    # Calculate the width and height of each grid cell
    cell_width = (right - left) / 5
    cell_height = (top - bottom) / 5
    
    # Calculate the center of the specified grid cell
    pixel_x = left + (grid_x + 0.5) * cell_width
    pixel_y = bottom + (4 - grid_y + 0.5) * cell_height  # Invert y-axis
    
    return int(pixel_x), int(pixel_y)

def runSpikeToEndPos():
    my_globals.followPathOrNot = True
    print("Running Spike along projected path")
    optimal_path = list(js.window.path) # Use the path generated by pathCalc.js
    balancer = BallBalancer(optimal_path)
    asyncio.create_task(balancer.run())

window.runSpikeToEndPos = runSpikeToEndPos