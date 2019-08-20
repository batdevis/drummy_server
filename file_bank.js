const fs = require('fs');
const cfg = require('./cfg.json');
/* dir structure
 * bank01/*wav
 * bank02/*.wav
 * */

class FileBank{
  constructor(){
    this.load();
  }

  load() {
    const banks = fs.readdirSync(cfg.audio_folder);
    const tree = [];
    banks.forEach(bank => {
      console.log("bank", bank);
      tree.push({
        name: bank,
        files: fs.readdirSync(`${cfg.audio_folder}/${bank}`)
      });
    })
    this.tree = tree;
    return tree;
  }
}

const fileBank = new FileBank();
module.exports = fileBank;
