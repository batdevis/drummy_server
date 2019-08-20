const cfg = require('./cfg.json');

// --- SERVER
const server = require('http').createServer(httpHandler);
server.listen(cfg.port, function() {
  console.log((new Date()) + ` Server is listening on port ${cfg.port}`);
});

function httpHandler(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.writeHead(404);
  response.end();
}

module.exports = server;
