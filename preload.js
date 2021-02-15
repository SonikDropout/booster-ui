const { zeroPad } = require('./src/utils/helpers');
const { CONFIG_PATH } = require('./src/constants');

window.onload = () => {
  document.getElementById('id').innerText = zeroPad(require(CONFIG_PATH + '/settings.json').id, 3);
};
