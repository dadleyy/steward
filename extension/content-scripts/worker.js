const port = chrome.runtime.connect({ name: "steward:content-scripts" });

function listen(message) {
  const input = document.querySelectorAll('[name="pull_request[body]"]');

  if (!input || !input.length) {
    return null;
  }

  console.log('found pr body input', input);
}

port.onMessage.addListener(listen);
