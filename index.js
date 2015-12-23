var util = require('util');
var color = require('ansi-color').set;

module.exports = function(backend) {
  backend.use('receive', function(request, next) {
    onReceive(request.agent, request.data);
    next();
  });
  backend.on('send', onSend);
};

function log(value) {
  process.stdout.write(value + ' ');
}

function clientName(agent) {
  return (agent.stream.isServer) ? 'Server Client' : 'Remote Client';
}

function onReceive(agent, message) {
  logHeader(color(clientName(agent) + ' -> Backend ' + agent.clientId, 'magenta'));
  var dataColor = 'green';
  onMessage(message, dataColor);
}
function onSend(agent, message) {
  logHeader(color('Backend -> ' + clientName(agent) + ' ' + agent.clientId, 'blue'));
  var dataColor = 'white';
  onMessage(message, dataColor);
}

function onMessage(message, dataColor) {
  switch (message.a) {
    case 'qf':
      logAction('query fetch ' + message.id);
      logQuery(message);
      break;
    case 'qs':
      logAction('query subscribe ' + message.id);
      logQuery(message);
      break;
    case 'qu':
      logAction('query unsubscribe ' + message.id);
      break;
    case 'bf':
    case 'f':
      logAction('doc fetch');
      logDocs(message);
      break;
    case 'bs':
    case 's':
      logAction('doc subscribe');
      logDocs(message);
      break;
    case 'bu':
    case 'u':
      logAction('doc unsubscribe');
      logDocs(message);
      break;
    case 'op':
      logAction('op');
      logOp(message, dataColor);
      break;
    case 'init':
      logAction('init');
      break;
  }
  logDiff(message, dataColor);
  logError(message);
  process.stdout.write('\n');
}

function logHeader(value) {
  var time = new Date().toISOString().replace('T', ' ').slice(0, 19) + 'Z';
  log(color(time, 'white'));
  log(value);
}
function logAction(value) {
  log(color(value, 'yellow'));
}
function logQuery(message) {
  if (message.q == null) return;
  var query = util.inspect(message.q, {depth: null});
  log(color(message.c + ' ' + query, 'cyan'));
}
function logDocs(message) {
  var docs;
  if (message.b) {
    if (Array.isArray(message.b)) {
      docs = message.b.join(',');
    } else {
      docs = Object.keys(message.b).join(',');
    }
  } else {
    docs = message.d;
  }
  log(color(message.c + ' ' + docs, 'cyan'));
}
function logOp(message, dataColor) {
  var op = util.inspect(message, {depth: null});
  log(color(op, dataColor));
}
function logDiff(message, dataColor) {
  if (!message.diff) return;
  var diff = util.inspect(message.diff, {depth: 2});
  log(color(diff, dataColor));
}
function logError(message) {
  if (!message.error) return;
  var error = util.inspect(message.error, {depth: null});
  log(color('Error: ' + error, 'red'));
}
