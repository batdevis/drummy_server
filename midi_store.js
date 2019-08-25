const fs = require('fs');
//const io = require('./ws.js');
// --- MIDI
const easymidi = require('easymidi');
const Pedalboard = require('./pedalboard');
const pedalboard = new Pedalboard();

class MidiStore {

  constructor(io) {
    console.log('[midiStore] io', io);
    this.io = io;
    /*
    this.loadPedalboards();
    this.loadPedalboard();
    */
    this.midiInputActivate(pedalboard.active, false);
  }
  
  midiInputs() {
    return easymidi.getInputs();
  }
/*  
  loadDevice() {
    let path = './data/device.json';
    let rtn;
    fs.access(path, fs.F_OK, (err) => {
      if (err) {
        console.error('[MidiStore.loadDevice]', err);
        return;
      }
      //file exists
      fs.readFile(path, (err, content) => {
        let device = JSON.parse(content).device;
        if(this.midiInputs().indexOf(device) > -1){
          console.log('[MidiStore.loadDevice] loading device', device);
          this.midiInputActivate(device, false);
          rtn = device;
        } else {
          console.error('[MidiStore.loadDevice] device not found', device);
          rtn = null;
        }
        return rtn;
      });
    });
  }
*/  
  midiInputActivate(device, save = true){
    console.log('[MidiStore.midiInputActivate] device', device);
    if (typeof(device) === 'undefined') {
      console.error('[MidiStore.midiInputActivate] device is undefined');
      return;
    }
    const input = new easymidi.Input(device);
    if(save){
      pedalboard.saveActive(device);
    }
    this.midiInput = device;
    input.on('cc', this.handleCc);
    return device;
  }

  saveDevice(device) {
    pedalboard.saveActive(device);
/*  
    const json = JSON.stringify(
      {
        device: device
      }
    );
    fs.writeFile('./data/device.json', json, (err) => {
      if (err) {
        console.error('[saveDevice]', err);
        return;
      };
      console.log('[saveDevice] file written for device', device);
    });
*/
  }
/*
  loadPedalboards(){
    console.log('[loadPedalboards]');
    let path = './data/pedalboards.json';
    let rtn;
    fs.access(path, fs.F_OK, (err) => {
      if (err) {
        console.error('[loadPedalboards]', err);
        return;
      }
      //file exists
      fs.readFile(path, (err, content) => {
        const rtn = JSON.parse(content);
        this.pedalboards = rtn;
        console.log('[loadPedalboards] loading pedalboards', rtn);
      });
    });
    return rtn;
  }

  loadPedalboard() {
    const rtn = this.pedalboards ? this.pedalboards[this.midiInput] : null;
    this.pedalboard = rtn;
    return rtn;
  }
*/
  midiInputList() {
    let rtn = {
      inputs: this.midiInputs(),
      active: {
        name: this.midiInput,
        pedalboard: this.pedalboard
      }
    };
    console.log('[midiInputList]', rtn);
    return rtn;
  }

  handleCc(msg) {
    console.log('cc', msg);
    console.log('----------------------------------------------------');
    console.log('[handleCc] this', this);
    console.log('----------------------------------------------------');
    return;
    io.emit('cc', msg);

    if (pedalboard.active) {
      const mappings = pedalboard.all[pedalboard.active].mappings;
      const key = Object.keys(mappings).find(k => {
        (
          (mappings[k].message_type === 'cc') &&
          (mappings[k].channel === msg.channel) &&
          (mappings[k].value === msg.value)
        )
      })
      const cmd = {
        cmd: key
      };
      console.log('cmd', cmd);
      io.emit('cmd', cmd);
    } else {
      console.error('[MidiStore] handleCc no pedalboard active');
    }
  }

}

//module.exports = new MidiStore(io);
module.exports = MidiStore;
