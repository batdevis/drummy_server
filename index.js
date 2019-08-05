const interface = 'USB Midi Controller:USB Midi Controller MIDI 1 24:0';
const easymidi = require('easymidi');
const input = new easymidi.Input(interface);
const cfg = {
  port: 8002
}

input.on('cc', handle_cc);

function handle_cc(msg) {
  console.log('cc', msg);
  ws_send(msg);
}

const WebSocketServer = require('websocket').server;
const http = require('http');
const server = http.createServer(function(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});
server.listen(cfg.port, function() {
  console.log((new Date()) + ` Server is listening on port ${cfg.port}`);
});

wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

const connections = [];
wsServer.on('request', function(request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }

  let connection = request.accept('echo-protocol', request.origin);
  connections.push(connection);
  console.log((new Date()) + ' Connection accepted.');

  connection.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    connections.delete(connection);
  });
});

function ws_send(msg) {
  for(let i=0; i < connections.length; i++){
    connections[i].sendUTF(msg);
  }
}
