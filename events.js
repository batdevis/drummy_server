const EventEmitter = require('events');
const WebSocket = require('ws');

const Pedalboard = require('./pedalboard');
const MidiStore = require('./midi_store.js');
const Mixer = require('./mixer.js');
const ws = require('./ws.js');
const fileBank = require('./file_bank.js');

const ee = new EventEmitter()

Promise.all([
  loadMidiStore(), 
  loadMixer()
])
.then(resources => eeSetup(ee, resources));

function loadMidiStore() {
  return Pedalboard.load()
    .then(data => {
      const pedalboard = new Pedalboard(data[0], data[1].device);
      return new MidiStore(pedalboard);
    })
    .catch(e => console.error(e));
}

function loadMixer() {
  return Mixer.load()
    .then(data => {
      console.log('[loadMixer] data', data);
      return new Mixer(data);
    })
    .catch(e => console.error(e));
}
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

function eeSetup(ee, resources) {
  const midiStore = resources[0];
  const mixer = resources[1];

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
    const rtn = {channels: []};
    if(mixer) {
      rtn.channels = mixer.channels;
      console.log('[event] send channels', rtn);
    } else {
      rtn.channels = [];
      console.error('[event] send channels: mixer is', mixer);
    }
    wsEmit('channels', rtn);
  });

  ee.on('setMidiInput', data => {
    console.log('[event] req setMidiInput', data);
    //TODO promise
    midiStore.midiInputActivate(data.device);
    ee.emit('getMidiInputList');
  });

  // data = {channelId: '01', filePath: 'A/A1.wav'}
  ee.on('setChannelFile', data => {
    console.log('[event] req setChannelFile', data);
    //TODO promise
    mixer.setChannelFile(data.channelId, data.filePath);
    ee.emit('getChannels');
  });
}

module.exports = ee;
