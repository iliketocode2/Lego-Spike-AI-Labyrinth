class BLE {
  constructor() {
    this.device = null;
    this.server = null;
    this.uartService = null;
    this.txCharacteristic = null;
    this.rxCharacteristic = null;

    this.connected = false;
    this.LastLine = '';
    this.stack = [];
  }
    ask = async (name) => {
      try {
        var filters
        if (name == '') {filters =[{services: ['6E400001-B5A3-F393-E0A9-E50E24DCCA9E']}]}
        else {filters = [{ name: name }]};
        console.log(filters);
        this.device = await navigator.bluetooth.requestDevice({filters: filters, 
                        optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e']});
        return true;
          
      } catch (error) {
        console.error('Error scanning for devices:', error);
        return false;
      }
    };
    
    connect = async () => {
      try {
        this.server = await this.device.gatt.connect();
        this.uartService = await this.server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
        this.txCharacteristic = await this.uartService.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e');
        this.rxCharacteristic = await this.uartService.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');

        const encoder = new TextEncoder('utf-8');
        const dataToSend = encoder.encode('Hello, BLE!'); // Convert string to Uint8Array
        const dataBuffer = dataToSend.buffer;
    
        await this.txCharacteristic.writeValue(dataBuffer);
        this.connected = true;
    
        // Add the event listener after initializing rxCharacteristic
        this.rxCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
          let fred = new Uint8Array(event.target.value.buffer);
          this.stack.push(fred)
          //console.log(fred)
        });
    
        // Start notifications for the rxCharacteristic
        this.rxCharacteristic.startNotifications()
          .then(() => {
            console.log('Notifications enabled for rxCharacteristic');
          })
          .catch(error => {
            console.error('Error enabling notifications:', error);
          });
        return true;
      } catch (error) {
        console.error('Error connecting to the device:', error);
        return false;
      }
      this.connected = connected;
    };
    
    disconnect = async () => {
          try {
            if (this.device && this.device.gatt.connected) {
              this.device.gatt.disconnect();
              this.connected = false;
            }
          } catch (error) {
            console.error('Error disconnecting from the device:', error);
          }
    };
    
    write = async function sendIt (data) {
        const dataToSend = new Uint8Array(data);
        //console.log(dataToSend)
        const dataBuffer = dataToSend.buffer;
        await this.txCharacteristic.writeValue(dataToSend);
    }
    
    length = function () {
        return this.stack.length;
    }

    read = function readMessage() {
        var payload = this.stack.pop();
        if (payload) {
            return(payload);
        } else {return ''};
    }
};

export function newBLE() {
    return new BLE();
}
