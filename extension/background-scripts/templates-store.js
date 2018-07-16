import defer from './defer';

export default class Store {
  constructor(database) {
    this.database = database;
  }


  all() {
    const { resolve, reject, promise } = defer();
    const request = this.database.transaction('templates').objectStore('templates').getAll();

    request.onerror = reject;
    request.onsuccess = function(event) {
      const { result } = event.target;
      resolve(result);
    };

    return promise;
  }

  default() {
    const { resolve, reject, promise } = defer();
    const range = IDBKeyRange.only(0);
    const request = this.database.transaction('templates').objectStore('templates').index('index').get(range);

    request.onsuccess = function(event) {
      const { result } = event.target;
      resolve(result);
    };

    request.onerror = reject;

    return promise;
  }
}
