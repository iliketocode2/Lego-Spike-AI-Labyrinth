from pyscript.js_modules import ble_library

global ble, x, y, path, followPathOrNot
ble = ble_library.newBLE()
x = 0
y = 0
followPathOrNot = False