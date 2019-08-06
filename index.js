const cfg = {
  port: 8002,
  midi_interface: 'USB Midi Controller MIDI 1'
  //midi_interface: 'USB Midi Controller:USB Midi Controller MIDI 1 24:0';
}
const easymidi = require('easymidi');
const inputs = easymidi.getInputs();
//const input = new easymidi.Input(cfg.midi_interface);
const input = new easymidi.Input(inputs[inputs.length - 1]);

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

  //TODO check protocol here and avoid "throw new Error('Specified protocol was not requested by the client.');" error
  let connection = request.accept('echo-protocol', request.origin);
  connections.push(connection);
  console.log((new Date()) + ' Connection accepted.');

  connection.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    const index = connections.indexOf(connection);
    connections.splice(connections, 1);
  });
});

function ws_send(msg) {
  for(let i=0; i < connections.length; i++){
    connections[i].sendUTF(JSON.stringify(msg));
  }
}
