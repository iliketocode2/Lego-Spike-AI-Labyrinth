code = f'''
from BLE_CEEO import Yell, Listen
import hub, utime, runloop, sys, time, motor
from hub import port, motion_sensor, uart

#define uart(port, baudrate, timeout)
#port 0-5 = A-F
U = uart.init(2,115200,100)
# Define motor ports (make sure to change these for your setup)
motorY = port.B
motorX = port.F

def peripheral(name): 
    # zero motors
    while (motor.absolute_position(motorX)) != 0:
        motor.run_to_absolute_position(motorX, 0, 100)
    motor.reset_relative_position(motorX)
    while (motor.absolute_position(motorY)) != 0:
        motor.run_to_absolute_position(motorY, 0, 100)
    motor.reset_relative_position(motorY)

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

        pos1 = motor.absolute_position(motorY)
        pos2 = motor.relative_position(motorX)
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
    leftBound = -8
    rightBound = 8

    if a == '2': #if no arrow keys pressed, go to limits or stop in place
        if motor.absolute_position(motorY) > rightBound:
            motor.run_to_absolute_position(motorY, rightBound - 1, 0 - speed)
        elif motor.absolute_position(motorY) < leftBound:
            motor.run_to_absolute_position(motorY, leftBound + 1, speed)
        else:
            # motor.stop(motorY)
            motor.run_to_absolute_position(motorY, motor.absolute_position(motorY), 0 - speed)  

        if motor.absolute_position(motorX) > rightBound:
            motor.run_to_absolute_position(motorX, rightBound - 1, 0 - speed)
        elif motor.absolute_position(motorX) < leftBound:
            motor.run_to_absolute_position(motorX, leftBound + 1, speed)
        else:
            motor.run_to_absolute_position(motorX, motor.absolute_position(motorX), 0 - speed)  
        
    elif a == '1': #up down
        if motor.absolute_position(motorY) > leftBound - 1 and motor.absolute_position(motorY) < rightBound + 1:
            if b == '1':
                motor.run(motorY, speed)
            elif b == '-1':
                motor.run(motorY, 0 - speed)
        else:
            motor.stop(motorY)
    elif a == '0': #right left
        if motor.absolute_position(motorX) > leftBound - 1 and motor.absolute_position(motorX) < rightBound + 1:
            if b == '1':
                motor.run(motorX, speed)
            elif b == '-1':
                motor.run(motorX, 0 - speed)   
        else:
            motor.stop(motorX)
    else:
        print('invalid input')

peripheral('Spike')
'''