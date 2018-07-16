import Service from '@ember/service';
import { defer } from 'rsvp';

export default class Runtime extends Service {
  constructor(options) {
    super();
    const port = chrome.runtime.connect({ name: 'steward:popup' });
    this.set('port', port);
  }

  async load() {
    const { promise, resolve, reject } = defer();
    const port = this.port;

    function receive(message) {
      const { identifier } = message;

      if (message.identifier !== 'RECEIVE_TEMPLATES') {
        return;
      }

      resolve(message.data);
      port.onMessage.removeListener(receive);
    }

    port.onMessage.addListener(receive);
    port.postMessage({ identifier: 'LOAD_TEMPLATES' });
    return promise;
  }
};
