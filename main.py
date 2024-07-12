from pyscript import document, window, when
import andrea_terminal, restapi, file_transfer, file_os
from ble_test import code as test_code
import json

ARDUINO_NANO = 128
SPIKE = 256
path = "https://raw.githubusercontent.com/chrisbuerginrogers/SPIKE_Prime/main/BLE/BLE_CEEO.py"

def on_connect(event):
    if terminal.connected:
        connect.innerText = 'connect up'
        await terminal.board.disconnect()
    else:
        await terminal.board.connect('repl')
        if terminal.connected:
            connect.innerText = 'disconnect'
            await file_os.getList(terminal, list)
            await terminal.eval('\x03', True)
    for b in btns:
        b.disabled = not terminal.connected

def on_disconnect():
    connect.innerText = 'connect up'
    python.code = ''
    list.options.length = 0
    terminal.update(0)

async def on_load(event):
    if terminal.connected:
        name = path.split('/')[-1]
        print('path, name: ',path,name)
        reply = await restapi.get(path)
        status = await terminal.download(name,reply)
        if not status: 
            window.alert(f"Failed to load {name}")  
    else:
        window.alert('connect to a processor first')

def handle_board(event):
    code = event.code
    if terminal.connected:
        await terminal.paste(code)
        terminal.focus()
        return False  # return False to avoid executing on browser
    else:
        return True

def on_select(event):
    python.code = await file_os.read_code(terminal, list)

def on_clear(event):
    terminal.board.terminal.clear()

@when("click", "#test")
def on_test(event):
    python.code = test_code

@when("click", "#CtrlC")
def send_CtrlC(event):
    await terminal.board.write('\x03')

path = "https://raw.githubusercontent.com/micropython/micropython-lib/master/micropython/umqtt.simple/umqtt/simple.py"

@when("click","#library2")
async def load_umqtt(event):
    if terminal.connected:
        data = await restapi.get(path)
        status = await terminal.download('mqtt.py',data)
        if not status: 
            window.alert(f"Failed to load {name}")  
    else:
        window.alert('connect to a processor first')


connect      = document.getElementById('connect')
library      = document.getElementById('library')
library2     = document.getElementById('library2')
progress_bar = document.getElementById('progress')
list         = document.getElementById('files')
python       = document.getElementById('mpCode')
remote       = document.getElementById('upload')
clear        = document.getElementById('clear')
ctrlC        = document.getElementById('CtrlC')

connect.onclick = on_connect
library.onclick = on_load
#list.onchange = on_select
remote.onclick = on_select
clear.onclick = on_clear
python.handleEvent = handle_board

#terminal = andrea_terminal.Terminal()
terminal = file_transfer.Ampy(ARDUINO_NANO, progress_bar)
terminal.disconnect_callback = on_disconnect

btns = [library, library2, remote, clear, ctrlC]
for b in btns:
    b.disabled = not terminal.connected

#--------------------------- all BLE control --------------------------------
from pyscript.js_modules import ble_library

ble_info = document.getElementById("ble_info")
ble_connected = document.getElementById("ble_connected")

def received_ble(data):
    document.getElementById("ble_answer").innerHTML = 'received: '+data
        
ble = ble_library.newBLE()
ble.callback = received_ble

@when("click", "#ble_connect")
async def ask(event):
    name = document.getElementById("ble_name").value
    if await ble.ask(name):
        print('name ',name)
        await ble.connect() 
        print('connected!')
        ble_connected.innerHTML = 'connected'
        
@when("click", "#ble_disconnect")
async def on_disconnect(event):
    await ble.disconnect()
    print('disconnected')

@when("click", "#send_ble")
def on_send_ble(event):
    print(ble_info.value)
    ble.write(ble_info.value)