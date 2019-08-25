const fs = require('fs');

class Pedalboard {
  constructor() {
    this.all = this.loadAll();
  }

  loadAll() {
    console.log('[Pedalboard] loadAll');
    const path = './data/pedalboards.json';
    let rtn;
    fs.access(path, fs.F_OK, (err) => {
      if (err) {
        console.error('[Pedalboard] loadAll', err);
        return;
      }
      //file exists
      fs.readFile(path, (err, content) => {
        const rtn = JSON.parse(content);
        this.all = rtn;
        console.log('[Pedalboard] loading pedalboards', rtn);
        this.loadActive();
      });
    });
    this.all = rtn;
    return rtn;
  }

  loadActive() {
    if (typeof(this.all) === 'undefined') {
      console.error('[Pedalboard] loadActive this.all is undefined');
      return;
    }
    console.log('this.all', this.all);
    const path = './data/device.json';
    let rtn;
    fs.access(path, fs.F_OK, (err) => {
      if (err) {
        console.error('[Pedalboard] loadActive', err);
        return;
      }
      //file exists
      fs.readFile(path, (err, content) => {
        let device = JSON.parse(content).device;
        if(Object.keys(this.all).indexOf(device) > -1){
          console.log('[Pedalboard] loadActive] loading device', device);
          this.active = device;
          rtn = device;
        } else {
          console.error('[Pedalboard] loadActive] device not found', device);
          rtn = null;
        }
        return rtn;
      });
    });
  }

  saveActive(device) {
    const json = JSON.stringify(
      {
        device: device
      }
    );
    fs.writeFile('./data/device.json', json, (err) => {
      if (err) {
        console.error('[Pedalboard] saveDevice', err);
        return;
      };
      console.log('[Pedalboar] saveDevice: file written for device', device);
    });
  }

  one(device) {
    if (typeof(this.all) === 'undefined') {
      this.loadAll();
    }
    const rtn = this.all ? this.all[device] : null;
    return rtn;
  }
}

module.exports = Pedalboard;
