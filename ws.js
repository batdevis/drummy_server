// --- SERVER
const server = require('./http_server.js');

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


module.exports = io;
