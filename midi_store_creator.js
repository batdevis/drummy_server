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

module.exports = midiStore;
