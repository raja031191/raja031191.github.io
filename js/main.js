var item1 = document.getElementById('container1');
var item2 = document.getElementById('container2');

item2.style.display = 'none';


var connection = function(){
  var bluetoothDevice;
    if (!('bluetooth' in navigator)) {
        alert("Bluetooth not available")
        return;
      }
      navigator.bluetooth.requestDevice({ filters: [
        //   { services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] } 
          { name: 'M583' }
        ] })
      .then(device => {
        bluetoothDevice = device;
        // Set up event listener for when device gets disconnected.
        device.addEventListener('gattserverdisconnected', onDisconnected);
      
        // Attempts to connect to remote GATT Server.
        return device.gatt.connect();
      })
      .then(server => {
        // Getting Battery Service...
        return server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
      })
      .then(service => {
        // Getting Battery Level Characteristic...
        return service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
      })
      .then(characteristic => characteristic.startNotifications())
      .then(characteristic => {

        // Reading Battery Level...
        characteristic.addEventListener('characteristicvaluechanged',
                                  handleBatteryLevelChanged);

         // Writing 1 is the signal to reset energy expended.
       
        let encoder = new TextEncoder('utf-8');
        let userDescription = encoder.encode('$cA*;');
        characteristic.writeValue(userDescription);
        return characteristic.readValue();
      })
      .then(value => {
        console.log('Read ' + value.getUint8(0));
      })
      .catch(error => { console.log(error); });

      function handleBatteryLevelChanged(event) {
        let decoder = new TextDecoder('utf-8')
        let batteryLevel = decoder.decode( event.target.value);
       console.log("response",batteryLevel);
        if(batteryLevel === '1' || batteryLevel === '112'){
          onDisconnectButtonClick();
        }
        else if(batteryLevel === '111'){
          alert("Please Place another Helmet");
        }
        else{
          alert(batteryLevel);
        }
        console.log('Read ' + batteryLevel);
      }

      function onDisconnected(event) {
        let device = event.target;
        console.log('Device ' + device.name + ' is disconnected.');
        item1.style.display = 'none';
        item2.style.display = 'block';
      }

      function onDisconnectButtonClick() {
        if (!bluetoothDevice) {
          return;
        }
        console.log('Disconnecting from Bluetooth Device...');
        if (bluetoothDevice.gatt.connected) {
          bluetoothDevice.gatt.disconnect();
        } else {
          console.log('> Bluetooth Device is already disconnected');
        }
      }
}

var btn = document.getElementById('enable');
btn.addEventListener('click',connection);