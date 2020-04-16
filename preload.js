const fs = require('fs');
const { zeroPad } = require('./src/utils/others');
const { ipcRenderer } = require('electron');

ipcRenderer.on('serverListening', (e, host, port) => {
  alert(`Логи доступну по адресу ${host}:${port}`);
  console.log(`Логи доступну по адресу ${host}:${port}`)
});

window.onload = () => {
  document.getElementById('version').innerText = JSON.parse(
    fs.readFileSync('./package.json')
  ).version;
  document.getElementById('id').innerText = zeroPad(
    JSON.parse(fs.readFileSync('./settings.json')).id,
    3
  );
};
