const server = require('./http_server.js');

const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

const areaWhitelist = [
  'getMidiInputList',
  'getFileTree',
  'getChannels',
  'setMidiImput',
  'setChannelFile'
];

wss.on('connection',(ws, req) => {
  const ee = require('./events.js');

  wsSend({area: 'greetings'}, ws);

  ws.on('message', msg => {
    msg = JSON.parse(msg);
    console.log('[ws] received msg', msg);
    if(areaWhitelist.indexOf(msg.area) > -1) {
      ee.emit(msg.area, msg.content);
    } else {
      console.log('[ws] area unknown', msg.area);
    }
  });

  ws.on('close', () => {
    console.log('[ws] close');
  });
});

function wsSend(msg, ws) {
  ws.send(JSON.stringify(msg));
}

module.exports = wss;
