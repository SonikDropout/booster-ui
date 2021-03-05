const W3CWebSocket = require('websocket').w3cwebsocket;

const client = new W3CWebSocket(`ws://${window.location.host}:${window.location.port}/`);

module.exports = client;

