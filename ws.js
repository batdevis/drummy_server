const cfg = require('./cfg.json');
//const server = require('./http_server.js');

const WebSocket = require('ws');
const ws = new WebSocket.Server({ port: cfg.port });

ws.on('connection',(ws, req) => {
  const ip = req.connection.remoteAddress;
  console.log('[ws] connection ip', ip);

  ws.send('hi', ip);

  ws.on('message', message => {
    console.log('[ws] received', message);
  });

  ws.on('close', function close() {
    console.log('[ws] close');
  });
  
  ws.on('getMidiInputList', () => {
    ee.emit('getMidiInputList');
  });

  ws.on('getFileTree', () => {
    ee.emit('getFileTree');
  });

  ws.on('getChannels', () => {
    ee.emit('getChannels');
  });

  ws.on('setMidiInput', (data) => {
    ee.emit('setMidiInput', data);
  });
  
  ws.on('setChannelFile', (data) => {
    ee.emit('setChannelFile', data);
  });
});

module.exports = ws;
