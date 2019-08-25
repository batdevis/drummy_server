const server = require('./http_server.js');
const io = require('./ws.js');
const MidiStore = require('./midi_store.js');
const midiStore = new MidiStore(io);
const mixer = require('./mixer.js');
const fileBank = require('./file_bank.js');
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
    if (midiStore) {
      const rtn = midiStore.midiInputList();
      console.log('[ws] send midiInputList', rtn);
      socket.emit('midiInputList', rtn);
    } else {
      console.log('midiStore is', midiStore);
    }
  });

  socket.on('getFileTree', function (data) {
    console.log('[ws] getFileTree', data);
    fileBank.reload();
    const rtn = {
      tree: fileBank.tree
    }
    console.log('[ws] send fileTree', rtn);
    socket.emit('fileTree', rtn);
  });

  socket.on('getChannels', function (data) {
    console.log('[ws] getChannels', data);
    const rtn = {
      channels: mixer.channels
    }
    console.log('[ws] send channels', rtn);
    socket.emit('channels', rtn);
  });

  socket.on('setMidiInput', function (data) {
    console.log('[ws] req setMidiInput', data);
    //TODO promise
    if (midiStore) {
      midiStore.midiInputActivate(data.device);
      const rtn = midiStore.midiInputList();
      socket.emit('midiInputList', rtn);
    } else {
      console.log('midiStore is', midiStore);
    }
  });

  // data = {channelId: '01', filePath: 'A/A1.wav'}
  socket.on('setChannelFile', function (data) {
    console.log('[ws] req setChannelFile', data);
    //TODO promise
    mixer.setChannelFile(data.channelId, data.filePath);
    const rtn = {
      channels: mixer.channels
    }
    console.log('[ws] send channels', rtn);
    socket.emit('channels', rtn);
  });
});
