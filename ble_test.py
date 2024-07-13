code = '''
from BLE_CEEO import Yell, Listen
import hub, utime, runloop, sys
from hub import port, motion_sensor

def peripheral(name): 
    try:
        p = Yell(name, verbose = True)
        if p.connect_up():
            print('P connected')
            utime.sleep(2)
            payload = ''  
            #parce data here, then put it in the payload motion_sensor.tilt_angles()
            for i in range(1000):
                payload = str(motion_sensor.tilt_angles())
                p.send(payload)
                if p.is_any:
                    print(p.read())
                if not p.is_connected:
                    print('lost connection')
                    break
                utime.sleep(1)
    except Exception as e:
        print(e)
    finally:
        p.disconnect()
        print('closing up')
        
                
def central(name):   
    try:   
        L = Listen(name, verbose = True)
        if L.connect_up():
            print('L connected')
            while L.is_connected:
                utime.sleep(4)
                if L.is_any:
                    reply = L.read()
                    print(reply) #seems to stop at 80 characteres
                    L.send(reply[:20])  #seems to stop around 20 characters
    except Exception as e:
        print(e)
    finally:
        L.disconnect()
        print('closing up')

peripheral('Spike')
#central('Spike')
'''