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
    this.channels = data;
  }

  static load() {
    const readFile = util.promisify(fs.readFile);
    let channels;
    return readFile('./data/channels.json', 'utf-8', (err, data) => {
      if (err) {
        console.error('[Mixer] load error'); 
      }
      channels = JSON.parse(data)
      console.log('[Mixer] loaded channels', channels);
      return channels;
    })
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
