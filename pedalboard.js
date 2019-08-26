const fs = require('fs');
const util = require('util');

/*
 * USAGE:
 * const Pedalboard = require('./pedalboard.js');
 * let pedalboard;
 * Pedalboard.load().then(data => {pedalboard = new Pedalboard(data.pedalboards, data.device);})
 */
class Pedalboard {
  constructor(pedalboards, device) {
    console.log('[Pedalboard] new (pedalboards, device)', pedalboards, device);
    this.all = pedalboards;
    if(Object.keys(this.all).indexOf(device) > -1){
      console.log('[Pedalboard] loading device', device);
      this.active = device;
    } else {
      console.error('[Pedalboard] device not found', device);
    }
  }

  static load() {
    const data = {
      pedalboards: {
        source: './data/pedalboards.json',
        values: null
      },
      device: {
        source: './data/device.json',
        values: null
      }
    };
    const readFile = util.promisify(fs.readFile);
    let result;

    return Promise.all([
      readFile(data['pedalboards'].source, 'utf8'),
      readFile(data['device'].source, 'utf8')
    ])
    .then(r => {
      result = r.map(content => JSON.parse(content));
      return result;
    })
    .catch(e => console.error(e));
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

  activeMappings() {
    return this.all[this.active].mappings;
  }
}

module.exports = Pedalboard;
