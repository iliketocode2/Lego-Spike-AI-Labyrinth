code = f'''
from BLE_CEEO import Yell, Listen
import hub, utime, runloop, sys, time, motor
from hub import port, motion_sensor, uart

U = uart.init(0,115200,100)
# Define motor ports (make sure to change these for your setup)
motor_b = port.B
motor_e = port.E

def peripheral(name): 
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

        pos1 = motor.absolute_position(motor_b)
        pos2 = motor.relative_position(motor_e)
        payload += "(B: "
        payload += str(pos1)
        payload += ", E: "
        payload += str(pos2)
        payload += ")"

        me.send(payload)

        name = 0
        direc = 0

        if me.is_any:
            print('received')
            parts = me.read().split("**")
            if len(parts) > 0:
                name = parts[0] 
                direc = parts[1]

            print('NAME:', name, 'DIREC:', direc)
            manualMotorControl(name, direc)

        if not me.is_connected:
            print('lost connection')
            break
            
        utime.sleep(0.1)               

def manualMotorControl(a, b):
    speed = 50
    if a == '2' and b == '2': #if no arrow keys pressed, return to positions
        if motor.absolute_position(motor_b) > 13:
                motor.run_to_absolute_position(motor_b, 11, 0 - speed)
        elif motor.absolute_position(motor_b) < -3:
                motor.run_to_absolute_position(motor_b, -1, speed)
        else:
            motor.stop(motor_b)

        if motor.absolute_position(motor_e) > -170:
                motor.run_to_absolute_position(motor_e, -172, 0 - speed)
        elif motor.absolute_position(motor_e) < -182:
                motor.run_to_absolute_position(motor_e, -180, speed)
        else:
            motor.stop(motor_e)
    else:
        if a == '1' and b == '1':
            if motor.absolute_position(motor_b) > 13:
                motor.run_to_absolute_position(motor_b, 11, 0 - speed)
                utime.sleep(0.1)
            else:
                motor.run(motor_b, speed)

        elif a == '1' and b == '-1':
            if motor.absolute_position(motor_b) < -3:
                motor.run_to_absolute_position(motor_b, -1, speed)
                utime.sleep(0.1)
            else:
                motor.run(motor_b, 0 - speed)

        if a == '0' and b == '1':
            if motor.absolute_position(motor_e) > -170:
                motor.run_to_absolute_position(motor_e, -172, 0 - speed)
                utime.sleep(0.1)
            else:
                motor.run(motor_e, speed)

        elif a == '0' and b == '-1':
            if motor.absolute_position(motor_e) < -182:
                motor.run_to_absolute_position(motor_e, -180, speed)
                utime.sleep(0.1)
            else:
                motor.run(motor_e, 0 - speed)   

peripheral('Spike')
'''