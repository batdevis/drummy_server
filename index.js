const cfg = {
  port: 8002,
  midi_interface: 'USB Midi Controller MIDI 1'
  //midi_interface: 'USB Midi Controller:USB Midi Controller MIDI 1 24:0';
}

// --- MIDI
const easymidi = require('easymidi');

function midiInputs(){
  return easymidi.getInputs();
}

function handleCc(msg) {
  console.log('cc', msg);
  wsSend(msg);
}

function midiInputActivate(device){
  const midiInput = new easymidi.Input(device);
  midiInput.on('cc', handleCc);
}

// --- SERVER
const http = require('http');

const server = require('http').createServer(handler)
const io = require('socket.io')(http);
//io.set('origins', 'http://localhost:8001');
//io.set('origins', '*');
io.origins((origin, callback) => {
  console.log('[ws] origin', origin);
  if (origin !== 'http://localhost:8001') {
    return callback('origin not allowed', false);
  }
  callback(null, true);
});

server.listen(cfg.port, function() {
  console.log((new Date()) + ` Server is listening on port ${cfg.port}`);
});

function handler(request, response){
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
}

// --- WEBSOCKET
io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });

  socket.on('disconnect', function () {
    io.emit('client disconnected');
  });
  
  socket.on('connect', function () {
    io.emit('client connected');
  });

  socket.on('midiInputList', function (data) {
    console.log('[ws] req midiInputList', data);
    const rtn = midiInputs();
    console.log('[ws] send midiInputList', rtn);
    socket.emit('midiInputList', rtn);
  });

  socket.on('midiInputActivate', function (data) {
    midiInputActivate(data.device);
  });
});

