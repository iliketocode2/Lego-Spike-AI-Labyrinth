code = f'''
from BLE_CEEO import Yell, Listen
import hub, utime, runloop, sys, time, motor
from hub import port, motion_sensor, uart

#define uart(port, baudrate, timeout)
#port 0-5 = A-F
U = uart.init(2,115200,100)
# Define motor ports (make sure to change these for your setup)
motorY = port.B #geared motor
motorX = port.F

def peripheral(name): 
    # zero motors
    print('Zeroing motors...')
    while (motor.absolute_position(motorX)) != -100:
        motor.run_to_absolute_position(motorX, -100, 100)
    motor.reset_relative_position(motorX)
    while (motor.absolute_position(motorY)) != -125:
        motor.run_to_absolute_position(motorY, -125, 100)
    motor.reset_relative_position(motorY)
    print('Motors zeroed')

    #connect up
    try:
        p = Yell(name, verbose = True)
        if p.connect_up():
            runConnected(p)
    except Exception as e:
        print(e)
    finally:
        p.disconnect()
        print('closing up')
        
def runConnected(me):
    print('ble connected')
    utime.sleep(2)

    while (True):
    # for i in range(1000):
    
        payload = ''

        if U.any():
            b = U.any()
            message = U.read(b)
            payload += str(message)

        payload += "**"

        payload += str(motion_sensor.tilt_angles())

        payload += "**"

        pos1 = motor.absolute_position(motorX)
        pos2 = motor.absolute_position(motorY)
        payload += "(mX: "
        payload += str(pos1)
        payload += ", mY: "
        payload += str(pos2)
        payload += ")"

        name = 0
        direc = 0

        if me.is_any:
            print('Received incoming')
            incoming = me.read()
            if "!!" in incoming: #if running along path
                print('Running along path')
                parts = incoming.split("!!")
                if len(parts) > 0:
                    p1 = parts[0] 
                    p2 = parts[1]

                    AIMotorControl(int(p1), int(p2))

                
            else: #if arrow keys pressed
                print('Running using arrow keys')
                parts = incoming.split("**")
                if len(parts) > 0:
                    name = parts[0] 
                    direc = parts[1]

                print('NAME:', name, 'DIREC:', direc)
                manualMotorControl(name, direc)

        me.send(payload)

        if not me.is_connected:
            print('lost connection')
            break
            
        utime.sleep(0.1)               

# def AIMotorControl(w, s):
#     speed = 50
#     for i in range(100):
#         motor.run_to_absolute_position(motorX, int(w), speed)
#         motor.run_to_absolute_position(motorY, int(s), speed)

def AIMotorControl(x_pos, y_pos):
    speed = 50

    while abs(motor.absolute_position(motorX) - x_pos) > 5 or abs(motor.absolute_position(motorY) - y_pos) > 5:
        if abs(motor.absolute_position(motorX) - x_pos) <= 5:
            motor.stop(motorX)
        else:
            if x_pos > motor.absolute_position(motorX):
                motor.run(motorX, speed)
            else:
                motor.run(motorX, -speed)

        if abs(motor.absolute_position(motorY) - y_pos) <= 5:
            motor.stop(motorY)
        else:
            if y_pos > motor.absolute_position(motorY):
                motor.run(motorY, speed)
            else:
                motor.run(motorY, -speed)

        time.sleep(0.1)
        
def manualMotorControl(a, b):
    speed = 100

    leftBound = -140
    rightBound = -35

    leftBound2 = -140
    rightBound2 = -110

    if a == '2': #if no arrow keys pressed stop in place
        motor.stop(motorX)
        motor.stop(motorY)
        
    elif a == '1': #up down
        if motor.absolute_position(motorY) < leftBound2:
            motor.run_to_absolute_position(motorY, leftBound2 + 1, 0 - speed)
        elif motor.absolute_position(motorY) > rightBound2:
            motor.run_to_absolute_position(motorY, rightBound2 - 1, speed)
        else:
            if b == '1':
                motor.run(motorY, 0 - speed)
            elif b == '-1':
                motor.run(motorY, speed)

    elif a == '0': #right left
        if motor.absolute_position(motorX) < leftBound:
            motor.run_to_absolute_position(motorX, leftBound + 1, speed)
        elif motor.absolute_position(motorX) > rightBound:
            motor.run_to_absolute_position(motorX, rightBound - 1, 0 - speed)
        else:
            if b == '1':
                if motor.absolute_position(motorX) < rightBound:
                    motor.run(motorX, 0 - speed)
            elif b == '-1':
                if motor.absolute_position(motorX) > leftBound:
                    motor.run(motorX, speed)

    else:
        print('invalid input')

peripheral('Spike')
'''