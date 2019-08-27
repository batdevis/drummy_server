const EventEmitter = require('events');
const ws = require('./ws.js');
const midiStore =require('./midi_store_creator.js');
const mixer = require('./mixer.js');
const fileBank = require('./file_bank.js');

class EEmitter extends EventEmitter {}

const ee = new EEmitter();

function ws_emit(ch, data) {
  const msg = {
    ch: ch,
    data: data
  };
  ws.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

ee.on('event', () => {
  console.log('an event occurred!');
});

ee.on('getMidiInputList', () => {
  console.log('[event] getMidiInputList', data);
  const rtn = midiStore.midiInputList();
  console.log('[ws] send midiInputList', rtn);
  ws_emit('midiInputList', rtn);
});

ee.on('getFileTree', () => {
  console.log('[event] getFileTree');
  fileBank.reload();
  const rtn = {
    tree: fileBank.tree
  }
  console.log('[event] send fileTree', rtn);
  ws_emit('fileTree', rtn);
});

ee.on('getChannels', () => {
  console.log('[event] getChannels');
  const rtn = {
    channels: mixer.channels
  }
  console.log('[event] send channels', rtn);
  ws_emit('channels', rtn);
});

ee.on('setMidiInput', data => {
  console.log('[event] req setMidiInput', data);
  //TODO promise
  midiStore.midiInputActivate(data.device);
  ee.emit(getMidiInputList);
});

// data = {channelId: '01', filePath: 'A/A1.wav'}
emitter.on('setChannelFile', data => {
  console.log('[event] req setChannelFile', data);
  //TODO promise
  mixer.setChannelFile(data.channelId, data.filePath);
  ee.emit(getChannels);
});

module.exports = emitter;
