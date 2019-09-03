const fs = require('fs');
const util = require('util');

/*
 * USAGE:
 * const Mixer = require('./mixer.js');
 * let mixer;
 * Mixer.load().then(data => {mixer = new Mixer(data);})
 */
class Mixer{
  constructor(data) {
    console.log('[Mixer] constructor', data);
    this.channels = data.channels;
  }

  static load() {
    const data = {
      channels: {
        source: './data/channels.json',
        values: null
      }
    };
    const readFile = util.promisify(fs.readFile);
    let result;

    return Promise.all([
      readFile(data['channels'].source, 'utf8')
    ])
    .then(r => {
      result = r.map(content => JSON.parse(content));
      return result;
    })
    .catch(e => console.error(e));
  }

  setChannelFile(channelId, file) {
    const channel = this.channels.find( ch => ch.id === channelId);
    if (channel) {
      channel.file = file;
      const json = JSON.stringify(this.channels);
      fs.writeFile('./data/channels.json', json, (err) => {
        if (err) {
          console.error('[setChannelFile]', err);
          return;
        };
        console.log('[setChannelFile] file written for channel', channel);
      });
    } else {
      console.log('[setChannelFile] channel not found', channelId);
    }
  }
}

module.exports = Mixer;
