import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import debugLogger from 'ember-debug-logger';

export default Route.extend({
  runtime: service('chrome-runtime'),
  debug: debugLogger(),

  async model() {
    const runtime = this.get('runtime');
    const templates = await runtime.load('templates');
    this.debug('loading templates');
    return { templates };
  },
});
