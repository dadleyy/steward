import db from './database';
import TemplateStore from './templates-store';

const connections = new Map();

function observe(event) {
  const ports = connections.get('steward:content-scripts');

  if (!ports || !ports.length) {
    console.log('observed change to navigation but no ports open');
    return;
  }

  const match = ports.find(({ tab }) => tab === event.tabId);

  if (!match) {
    console.log('unable to find matching port for event', event);
    return
  }

  console.log('found matching port, sending message');
  match.port.postMessage({ identifier: 'CHECK_FOR_INPUT' });
}

function remove() {
  const { name, tab } = this;
  const list = connections.get(name);
  const filtered = list.filter(({ tab: t }) => t !== tab);
  console.log(`removed connection. before[${list.length}] after[${filtered.length}]`);
  connections.set(name, filtered);
}


async function handler(message, port) {
  const name = port.name;
  const outbound = connections.get(name) || [];
  const match = outbound.find(({ tab }) => tab === (port.sender.tab || { }).id);

  if (!match && port.sender.id !== chrome.runtime.id) {
    console.log('received message from unknown sender', port);
    return;
  }

  if (message.identifier === 'LOAD_DEFAULT_TEMPLATE') {
    const database = connections.get('-database');
    const templates = new TemplateStore(database);
    console.log('received request for default template');
    const template = await templates.default();
    console.log('loaded default template', template);
    match.port.postMessage({ identifier: 'RECEIVE_DEFAULT_TEMPLATE', template });
    return;
  }

  if (message.identifier === 'LOAD_TEMPLATES' && name === 'steward:popup') {
    const database = connections.get('-database');
    const templates = new TemplateStore(database);
    const data = await templates.all();
    console.log('sending msg');
    port.postMessage({ identifier: 'RECEIVE_TEMPLATES', data });
  }

  console.log(`received message on ${name} port: ${message.identifier}`);
}

function connected(port) {
  const name = port.name;
  const list = connections.get(name) || [];
  const tab = port && port.sender && port.sender.tab ? port.sender.tab.id : 'popup';

  if (port.sender.id !== chrome.runtime.id) {
    console.warn('unable to determine origin of connection', port);
    return;
  }

  if (name === 'steward:popup' && connections.get(name) && connections.get(name).length) {
    throw new Error('multiple popup instances');
  }

  console.log('client connected from tab ', tab);
  // Add the new connection to the store, sending the tab id along too.
  list.push({ port, tab });
  connections.set(name, list);

  // Send an initial message to the connected client.
  port.postMessage({ identifier: 'INITIALIZE' });

  // Listen to the clients.
  port.onMessage.addListener(handler);

  // Listen for disconnect and remove from our internally managed store of connections.
  const rm = remove.bind({ name, tab });
  port.onDisconnect.addListener(rm);
}

db.initialize().then(function(database) {
  connections.set('-database', database);
  console.log('listening for connections');
  chrome.runtime.onConnect.addListener(connected);
  chrome.webNavigation.onHistoryStateUpdated.addListener(observe);
});
