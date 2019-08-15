const fs = require('fs');
const cfg = {
  port: 8002,
  midi_interface: 'USB Midi Controller MIDI 1'
  //midi_interface: 'USB Midi Controller:USB Midi Controller MIDI 1 24:0';
}

// --- MIDI
const easymidi = require('easymidi');
let midiInput;
let pedalboards;

loadDevice();
//TODO loadPedalboards() from inside midiInputList()
loadPedalboards();

function midiInputs(){
  return easymidi.getInputs();
}

function handleCc(msg) {
  console.log('cc', msg);
  wsSend(msg);
}

function midiInputActivate(device, save = true){
  midiInput = device;
  const input = new easymidi.Input(device);
  if(save){
    saveDevice(device);
  }
  input.on('cc', handleCc);
}

function midiInputList() {
  //loadPedalboards();
  let pedalboard = pedalboards[midiInput] || null;
  let rtn = {
    inputs: midiInputs(),
    active: {
      name: midiInput,
      pedalboard: pedalboard
    }
  };
  console.log('[midiInputList]', rtn);
  return rtn;
}

function loadDevice(){
  let path = './data/device.json';
  fs.access(path, fs.F_OK, (err) => {
    if (err) {
      console.error('[loadDevice]', err);
      return;
    }
    //file exists
    fs.readFile(path, (err, content) => {
      let device = JSON.parse(content).device;
      if(midiInputs().indexOf(device) > -1){
        console.log('[loadDevice] loading device', device);
        midiInputActivate(device, false);
      } else {
        console.log('[loadDevice] device not found', device);
      }
    });
  });
}

function saveDevice(device){
  json = JSON.stringify(
    {
      device: device
    }
  );
  fs.writeFile('./data/device.json', json, (err) => {
    if (err) {
      console.error('[saveDevice]', err);
      return;
    };
    console.log('[saveDevice] file written for device', device);
  });
}

function loadPedalboards(){
  console.log('[loadPedalboards]');
  let path = './data/pedalboards.json';
  fs.access(path, fs.F_OK, (err) => {
    if (err) {
      console.error('[loadPedalboards]', err);
      return;
    }
    //file exists
    fs.readFile(path, (err, content) => {
      pedalboards = JSON.parse(content);
      console.log('[loadPedalboards] loading pedalboards', pedalboards);
    });
  });
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

  socket.on('setMidiInput', function (data) {
    console.log('[ws] req setMidiInput', data);
    //TODO promise
    midiInputActivate(data.device);
    const rtn = midiInputList();
    socket.emit('midiInputList', rtn);
  });
});

