const cfg = {
  port: 8002,
  midi_interface: 'USB Midi Controller MIDI 1'
  //midi_interface: 'USB Midi Controller:USB Midi Controller MIDI 1 24:0';
}

// --- MIDI
const easymidi = require('easymidi');
let midiInput;

function midiInputs(){
  return easymidi.getInputs();
}

function handleCc(msg) {
  console.log('cc', msg);
  wsSend(msg);
}

function midiInputActivate(device){
  const device = new easymidi.Input(device);
  midiInput = device;
  device.on('cc', handleCc);
}

// --- SERVER
const server = require('http').createServer(httpHandler);
const io = require('socket.io')(server);
//io.set('origins', 'http://localhost:8001');
//io.set('origins', '*');
io.origins((origin, callback) => {
  if (origin !== 'http://localhost:8001') {
    console.log(`[ws] origin ${origin} not allowed`);
    return callback('origin not allowed', false);
  } else {
    console.log(`[ws] origin ${origin} allowed`);
  }
  callback(null, true);
});

server.listen(cfg.port, function() {
  console.log((new Date()) + ` Server is listening on port ${cfg.port}`);
});

function httpHandler(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.writeHead(404);
  response.end();
}

function midiInputList() {
  return {
    inputs: midiInputs(),
    active: midiInput
  };
}

// --- WEBSOCKET
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
    const rtn = midiInputList();
    console.log('[ws] send midiInputList', rtn);
    socket.emit('midiInputList', rtn);
  });

  socket.on('midiInputActivate', function (data) {
    console.log('[ws] req midiInputActivate', data);
    //TODO promise
    midiInputActivate(data.device);
    const rtn = midiInputList();
    socket.emit('midiInputList', rtn);
  });
});

