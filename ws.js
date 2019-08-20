// --- SERVER
const server = require('./http_server.js');
// --- MIDI
const midiStore = require('./midi_store.js');
const fileBank = require('./file_bank.js');

// --- WEBSOCKET
const io = require('socket.io')(server);

io.origins((origin, callback) => {
  if (origin !== 'http://localhost:8001') {
    console.log(`[ws] origin ${origin} not allowed`);
    return callback('origin not allowed', false);
  } else {
    console.log(`[ws] origin ${origin} allowed`);
  }
  callback(null, true);
});

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });

  socket.on('disconnect', function () {
    //io.emit('client disconnected');
    console.log('[ws] client disconnected');
  });
  
  socket.on('connect', function () {
    //io.emit('client connected');
    console.log('[ws] client connected');
  });

  socket.on('getMidiInputList', function (data) {
    console.log('[ws] getMidiInputList', data);
    const rtn = midiStore.midiInputList();
    console.log('[ws] send midiInputList', rtn);
    socket.emit('midiInputList', rtn);
  });

  socket.on('getFileTree', function (data) {
    console.log('[ws] getFileTree', data);
    const rtn = fileBank.tree();
    console.log('[ws] send fileTree', rtn);
    socket.emit('fileTree', rtn);
  });

  socket.on('setMidiInput', function (data) {
    console.log('[ws] req setMidiInput', data);
    //TODO promise
    midiStore.midiInputActivate(data.device);
    const rtn = midiStore.midiInputList();
    socket.emit('midiInputList', rtn);
  });
});

module.exports = io;
