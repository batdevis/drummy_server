const cfg = require('./cfg.json');
//const server = require('./http_server.js');

const WebSocket = require('ws');
const ws = new WebSocket.Server({ port: cfg.port });

const channelWhitelist = [
  'getMidiInputList',
  'getFileTree',
  'getChannels',
  'setMidiImput',
  'setChannelFile'
];

ws.on('connection',(ws, req) => {
  const ip = req.connection.remoteAddress;
  console.log('[ws] connection ip', ip);
  const ee = require('./events.js');

  ws.send('hi', ip);

  ws.on('message', msg => {
    msg = JSON.parse(msg);
    console.log('[ws] received msg', msg);
    if(channelWhitelist.indexOf(msg.channel) > -1) {
      ee.emit(msg.channel, msg.data);
    } else {
      console.log(`[ws] channel ${msg.channel} unknown`);
    }
  });
  ws.on('close', function close() {
    console.log('[ws] close');
  });
/*
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
*/
});

module.exports = ws;
