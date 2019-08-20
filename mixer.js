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

  reload() {
    this.load();
  }
}

module.exports = new Mixer();
