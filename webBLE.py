from pyscript import window, document, display
import asyncio
from pyscript.js_modules import ble

class BLE:
    """
    Pythonic wrapper for serial JS file.
    """
    def __init__(self, name):
        
        self.name = name
        self.ble = ble.newBLE()
        print(self.ble.connected)
        self.connected = False

    async def ask(self, event):
        if await self.ble.ask(self.name):
            print('name ',self.name)
            await self.connect()
            print('connected ',self.connected)

    async def connect(self):
        self.connected = await self.ble.connect()
        
    def is_any(self):
        return self.ble.length()

    async def read(self, timeout = 5):
        if not self.connected: return None
        to = timeout
        while not self.is_any() and to > 0:
            await asyncio.sleep(0.1)
            to -= 0.1
        return self.ble.read() if to>=0 else None

    async def disconnect(self):
        self.connected = await self.ble.disconnect()

    async def send(self, data, eol=False):
        if self.connected:
            if eol:
                data = data + '\r\n'
            await self.ble.write(data)
            
    async def grab(self):
        last = await self.read(1)
        if not last: last = []
        return list(last)

    async def waitForConnection(self):
        while not self.connected:
            await asyncio.sleep(0.5)

    async def send_read(self, cmd, timeout = 10):
        old = await self.grab()
        await self.send(cmd)
        ans = await self.grab()
        if ans:
            if ans[2] != cmd[2]: ans = []  #check IDs
        time, step = 0, 0.02
        while (not ans) and (time < timeout):
            await asyncio.sleep(step)
            time += step
            ans = await self.grab()
            if ans:
                if ans[2] != cmd[2]: ans = []  #check IDs
        #display(str(cmd) + '-' + str(old) + '-' + str(ans))
        return ans