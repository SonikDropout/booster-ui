const usbDetect = require('usb-detection');
const driveList = require('drivelist');
const EventEmitter = require('events');

const usbPort = new EventEmitter();
let connectedDevice, timeout;

function delay(fn, ms) {
  return (...args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(fn, ms, ...args);
  };
}

Object.defineProperty(usbPort, 'isDeviceConnected', {
  get: function() {
    return !!connectedDevice;
  },
});

usbDetect.startMonitoring();
usbDetect.on('add', delay(findDrive, 300));
usbDetect.on('remove', handleRemove);

function findDrive() {
  driveList.list().then((drives) => {
    const drive = drives.find(isSuitableDrive);
    if (drive) {
      connectedDevice = drive.device;
      usbPort.emit('add', drive.mountpoints[0].path);
    }
  });
}

function isSuitableDrive(drive) {
  return !drive.isSystem && drive.isUSB;
}

function handleRemove() {
  driveList.list().then((drives) => {
    if (!drives.find((drive) => drive.device === connectedDevice)) {
      usbPort.emit('remove');
    }
  });
}

usbPort.init = findDrive;

module.exports = usbPort;
