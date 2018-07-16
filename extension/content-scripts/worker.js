const port = chrome.runtime.connect({ name: 'steward:content-scripts' });

function listen(message) {
  const identifier = message.identifier;
  const form = document.getElementById('new_pull_request');
  const input = form ? form.querySelector('[name="pull_request[body]"]') : null;

  if (!input) {
    console.log('message received on uninteresting page, exiting');
    return null;
  }

  if (identifier === 'CHECK_FOR_INPUT' || identifier === 'INITIALIZE') {
    console.log('found input, requesting default PR template');
    port.postMessage({ identifier: 'LOAD_DEFAULT_TEMPLATE' });
    return;
  }

  if (identifier === 'RECEIVE_DEFAULT_TEMPLATE' && message.template) {
    const { content } = message.template;
    console.log('received template', message.template);
    console.log(input, content);
    input.value = content;
    return
  }

  console.log('found new PR input, message identifier: ', identifier);
}


console.log('listening for messages');
port.onMessage.addListener(listen);
