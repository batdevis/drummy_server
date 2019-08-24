const fs = require('fs');
const io = require('./ws.js');
// --- MIDI
const easymidi = require('easymidi');

class MidiStore {

  constructor() {
    this.midiInput = this.loadDevice();
    this.pedalboards = this.loadPedalboards();
  }
  
  midiInputs() {
    return easymidi.getInputs();
  }
  
  loadDevice() {
    let path = './data/device.json';
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
        } else {
          console.error('[MidiStore.loadDevice] device not found', device);
        }
      });
    });
  }
  
  midiInputActivate(device, save = true){
    console.log('[MidiStore.midiInputActivate] device', device);
    const input = new easymidi.Input(device);
    if(save){
      this.saveDevice(device);
    }
    this.midiInput = device;
    input.on('cc', this.handleCc);
  }

  saveDevice(device) {
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
  }
  
  loadPedalboards(){
    console.log('[loadPedalboards]');
    let path = './data/pedalboards.json';
    fs.access(path, fs.F_OK, (err) => {
      if (err) {
        console.error('[loadPedalboards]', err);
        return;
      }
      //file exists
      fs.readFile(path, (err, content) => {
        this.pedalboards = JSON.parse(content);
        console.log('[loadPedalboards] loading pedalboards', this.pedalboards);
      });
    });
  }

  pedalboard() {
    return this.pedalboards[this.midiInput] || null;
  }

  midiInputList() {
    let rtn = {
      inputs: this.midiInputs(),
      active: {
        name: this.midiInput,
        pedalboard: this.pedalboard()
      }
    };
    console.log('[midiInputList]', rtn);
    return rtn;
  }

  handleCc(msg) {
    console.log('cc', msg);
    io.emit('cc', msg);

    const mappings = this.pedalboard().mappings;
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
  }

}

module.exports = new MidiStore();
