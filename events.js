// ----------------- midiStore --------------------
//const midiStore = require('./midi_store_creator.js');
const MidiStore = require('./midi_store.js');
let midiStore;

const Pedalboard = require('./pedalboard');
let pedalboard;
Pedalboard.load()
  .then(data => {
    console.log('-- data --', data);
    pedalboard = new Pedalboard(data[0], data[1].device);
    midiStore = new MidiStore(pedalboard);
  })
  .catch(e => console.error(e));
//-----------------------------------------------

const EventEmitter = require('events');
const WebSocket = require('ws');
const ws = require('./ws.js');
const mixer = require('./mixer.js');
const fileBank = require('./file_bank.js');

const ee = new EventEmitter()

function wsEmit(area, content) {
  const msg = JSON.stringify({
    area: area,
    content: content
  });
  ws.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

ee.on('getMidiInputList', () => {
  console.log('[event] getMidiInputList');
  const rtn = midiStore.midiInputList();
  console.log('[ws] send midiInputList', rtn);
  wsEmit('midiInputList', rtn);
});

ee.on('getFileTree', () => {
  console.log('[event] getFileTree');
  fileBank.reload();
  const rtn = {
    tree: fileBank.tree
  }
  console.log('[event] send fileTree', rtn);
  wsEmit('fileTree', rtn);
});

ee.on('getChannels', () => {
  console.log('[event] getChannels');
  const rtn = {
    channels: mixer.channels
  }
  console.log('[event] send channels', rtn);
  wsEmit('channels', rtn);
});

ee.on('setMidiInput', data => {
  console.log('[event] req setMidiInput', data);
  //TODO promise
  midiStore.midiInputActivate(data.device);
  ee.emit(getMidiInputList);
});

// data = {channelId: '01', filePath: 'A/A1.wav'}
ee.on('setChannelFile', data => {
  console.log('[event] req setChannelFile', data);
  //TODO promise
  mixer.setChannelFile(data.channelId, data.filePath);
  ee.emit(getChannels);
});

module.exports = ee;
