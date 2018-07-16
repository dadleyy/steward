import defer from './defer';

const idb = window['indexedDB'];

function initialize() {
  const { resolve, promise, reject } = defer();
  const connection = idb ? idb.open('steward', 3) : null;

  if (!connection) {
    throw new Error('indexedDB not supported');
  }

  connection.onerror = reject;

  connection.onupgradeneeded = function(event) {
    const database = event.target.result;

    if (database.objectStoreNames.contains('templates')) {
      console.log('template database store already exists, skipping');
      return
    }

    console.log('creating template data store + index');
    const store = database.createObjectStore('templates', { autoIncrement: true, keyPath: 'identifier' });
    store.createIndex('identifier', 'identifier', { unique: true });
    store.createIndex('index', 'index', { unique: true });
    store.createIndex('content', 'content', { unique: false });
  }

  connection.onsuccess = function(event) {
    const database = event.target.result;

    database.onversionchange = function(event) {
      console.log('version changed');
      database.close();
    };

    const initial = database.transaction('templates', 'readwrite').objectStore('templates');
    const seek = initial.get('initial-template');

    seek.onsuccess = function(event) {
      const result = event.target.result;

      if (result) {
        console.log('initialized datbase schema + initial data');
        resolve(database);
        return;
      }

      const request = initial.add({
        identifier: 'initial-template',
        content: 'hello world',
        automated: true,
        index: 0,
      });

      request.onerror = reject;
      request.onsuccess = function() {
        console.log('initialized database successfully');
        resolve(database);
      }
    };

    seek.onerror = reject;
  };

  return promise;
}


export default { initialize };
