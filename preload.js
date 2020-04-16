const fs = require('fs');
const { zeroPad } = require('./src/utils/others');

window.onload = () => {
  document.getElementById('version').innerText = JSON.parse(
    fs.readFileSync('./package.json')
  ).version;
  document.getElementById('id').innerText = zeroPad(
    JSON.parse(fs.readFileSync('./settings.json')).id,
    3
  );
};
