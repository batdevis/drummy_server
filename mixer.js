const fs = require('fs');

class Mixer{
  constructor(){
    this.load();
  }

  load() {
    const channels = require('./data/channels');
    this.channels = channels;
    return channels;
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
  
  reload() {
    this.load();
  }
}

module.exports = new Mixer();
