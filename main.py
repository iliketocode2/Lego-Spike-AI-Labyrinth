from pyscript import window, document, display
from webBLE import BLE
import asyncio, struct

fred = BLE('Maria')
s = document.getElementById('text')
s.innerText = 'connecting up'

async def connectIt(event):
    success = await fred.ask(None)
            
async def disconnectIt(event):
    print('disconnecting')
    success = await fred.disconnect()

async def readIt(event):
    payload = await fred.read()
    s.innerText = ' up'
    if payload:
        s.innerText = ' up ' + str(len(payload))
        print(payload)
        acc = []
        t = []
        for i in range(0, len(payload), 4):
            print(i)
            #t.append(payload[i]*255+payload[i+1])
            #acc.append(payload[i+2]*255+payload[i+3])
        #display(t)
            
        '''array=[int(c) for c in payload]
        print(array)    

        time, acc = struct.unpack('>hh',payload)
        print(time, acceleration)
        #s.innerText = numbers'''


        