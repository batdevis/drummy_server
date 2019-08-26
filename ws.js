// --- SERVER
const server = require('./http_server.js');

// --- WEBSOCKET
const SocketIo = require('socket.io');
const io = SocketIo(server, {wsEngine: 'ws'});

io.origins((origin, callback) => {
  if (origin !== 'http://localhost:8001') {
    console.log(`[ws] origin ${origin} not allowed`);
    return callback('origin not allowed', false);
  } else {
    console.log(`[ws] origin ${origin} allowed`);
  }
  callback(null, true);
});


module.exports = io;
