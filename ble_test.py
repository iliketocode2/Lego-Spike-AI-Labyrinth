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
    #for i in range(100):
    
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
            parts = me.read().split("**")
            if len(parts) > 0:
                name = parts[0] 
                direc = parts[1]

            print('NAME:', name, 'DIREC:', direc)
            motorControl(name, direc)

        if not me.is_connected:
            print('lost connection')
            break
            
        utime.sleep(0.1)               

def motorControl(a, b):
    print('A:', a, 'B:', b)
    if a == '1' and b == '1':
        motor.run_for_degrees(motor_b, 2, 720)
    elif a == '1' and b == '-1':
        motor.run_for_degrees(motor_b, -2, 720)
    elif a == '0' and b == '1':
        motor.run_for_degrees(motor_e, 2, 720)
    elif a == '0' and b == '-1':
        motor.run_for_degrees(motor_e, -2, 720)
    else:
        print('Invalid motor name or direction')        

peripheral('Spike')
'''