const context = { };

function observe({ url }) {
  console.log('queue:', context.queue);
  return context.port.postMessage({ url });
}

function connected(port) {
  console.log('content script connected');
  context.port = port;
  port.postMessage({ initial: true });
  chrome.webNavigation.onHistoryStateUpdated.addListener(observe);
}

console.log('listening for connections');
chrome.runtime.onConnect.addListener(connected);
