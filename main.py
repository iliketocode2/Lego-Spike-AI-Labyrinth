from pyscript import document, window, when
import andrea_terminal, restapi, file_transfer, file_os
from ble_test import code as test_code
import json


# tilt_angles()

ARDUINO_NANO = 128
SPIKE = 256
path = "https://raw.githubusercontent.com/chrisbuerginrogers/SPIKE_Prime/main/BLE/BLE_CEEO.py"

def on_connect(event):
    if terminal.connected:
        connect.innerText = 'Connect the Spike'
        await terminal.board.disconnect()
    else:
        await terminal.board.connect('repl')
        if terminal.connected:
            connect.innerText = 'Disconnect'
            document.getElementById('library').classList.toggle("inactive")
            await terminal.eval('\x03', True)
    for b in btns:
        b.disabled = not terminal.connected

def on_disconnect():
    connect.innerText = 'Connect the Spike'
    terminal.update(0)

async def on_load(event):
    if terminal.connected:
        name = path.split('/')[-1]
        print('path, name: ',path,name)
        reply = await restapi.get(path)
        status = await terminal.download(name,reply)

        if terminal.connected:
            await terminal.eval('\x05' + test_code + '\x04') #run code 
            terminal.focus()
            document.getElementById('ble_connect').classList.toggle("inactive")
            # return False
        else:
            print('terminal not connected')
            # return True

        if not status: 
            window.alert(f"Failed to load {name}")  
    else:
        window.alert('connect to a processor first')

path = "https://raw.githubusercontent.com/micropython/micropython-lib/master/micropython/umqtt.simple/umqtt/simple.py"

connect      = document.getElementById('connect')
library      = document.getElementById('library')
progress_bar = document.getElementById('progress')

connect.onclick = on_connect
library.onclick = on_load

#terminal = andrea_terminal.Terminal()
terminal = file_transfer.Ampy(ARDUINO_NANO, progress_bar)
terminal.disconnect_callback = on_disconnect

btns = [library]
for b in btns:
    b.disabled = not terminal.connected


#--------------------------- all BLE control --------------------------------
from pyscript.js_modules import ble_library

ble_info = document.getElementById("ble_info")

def received_ble(data):
    document.getElementById("ble_answer").innerHTML = 'received: '+data
        
ble = ble_library.newBLE()
ble.callback = received_ble

connected = False
@when("click", "#ble_connect")
async def ask(event):
    global connected
    if connected:
        await ble.disconnect()
        document.getElementById("ble_connect").innerHTML = 'Connect via BLE'
        document.querySelector(".ble_info").style.display = 'none'
        print('disconnected')
        connected = False
    else:
        name = document.getElementById("ble_name").value
        if await ble.ask(name):
            print('name ',name)
            document.getElementById("ble_connect").innerHTML = 'Connecting...'
            await ble.connect() 
            print('connected!')
            document.querySelector(".ble_info").style.display = 'block'
            document.getElementById("ble_connect").innerHTML = 'Disconnect'
            connected = True

@when("click", "#send_ble")
def on_send_ble(event):
    print(ble_info.value)
    ble.write(ble_info.value)