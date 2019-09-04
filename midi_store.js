const ws = require('./ws.js');
const easymidi = require('easymidi');

class MidiStore {
  constructor(pedalboard, device) {
    console.log('[midiStore] pedalboard', pedalboard);
    this.ws = ws;
    this.pedalboard = pedalboard;
    this.midiInputActivate(device, false);
  }
  
  midiInputs() {
    return easymidi.getInputs();
  }
  
  midiInputActivate(device, save = true){
    console.log('[MidiStore.midiInputActivate] device', device);
    if (typeof(device) === 'undefined') {
      console.error('[MidiStore.midiInputActivate] device is undefined');
      return;
    }
    if(this.midiInputs().indexOf(device) == -1) {
      console.error(`[MidiStore.midiInputActivate] device ${device} not present`);
      return;
    }
    const input = new easymidi.Input(device);
    if(save){
      this.saveDevice(device);
    }
    this.midiInput = device;
    input.on('cc', this.handleCc.bind(this));
    return device;
  }

  saveDevice(device) {
    this.pedalboard.saveActive(device);
  }
  
  midiInputList() {
    let rtn = {
      inputs: this.midiInputs()
    };
    if(this.midiInput) {
      rtn.active = {
        name: this.midiInput,
        pedalboard: this.pedalboard.find(this.midiInput)
      };
    }
    console.log('[midiInputList]', rtn);
    return rtn;
  }

  activePedalboard() {
    return this.pedalboard.find(this.midiInput);
  }

  handleCc(msg) {
    //msg = { channel: 0, controller: 100, value: 127, _type: 'cc' }
    console.log('cc', msg);
    //TODO use event emitter
    this.ws.emit('cc', msg);

    if (this.activePedalboard) {
      const mappings = this.activePedalboard.mappings;
      const key = Object.keys(mappings).find(k => {
        return (
          (mappings[k].message_type === 'cc') &&
          (mappings[k].channel === msg.channel) &&
          (mappings[k].controller === msg.controller) &&
          (mappings[k].value === msg.value)
        );
      });
      if (key) { 
        const cmd = {
          cmd: key
        };
        console.log('cmd', cmd);
        //TODO use event emitter
        this.ws.emit('cmd', cmd);
      }
    } else {
      console.error('[MidiStore] handleCc no pedalboard active');
    }
  }

}

module.exports = MidiStore;
