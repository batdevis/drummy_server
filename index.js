const interface = 'USB Midi Controller:USB Midi Controller MIDI 1 24:0';
const easymidi = require('easymidi');
const input = new easymidi.Input(interface);
input.on('cc', handle_cc);

function handle_cc(msg) {
  console.log('cc', msg);
});


