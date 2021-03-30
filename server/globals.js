const path = require('path');

const IS_RPI = process.platform === 'linux' && process.arch == 'arm';

exports.isPi = IS_RPI;

exports.PORT = {
  name: IS_RPI ? '/dev/ttyS0' : 'COM5',
  baudRate: 230400,
};

exports.CONFIG_PATH = path.join(__dirname, '..', 'config');

const SEPARATORS = Buffer.alloc(4);
SEPARATORS.writeUInt16BE(7589);
SEPARATORS.writeUInt16BE(3333, 2);

exports.SEPARATORS = SEPARATORS;
