import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  runtime: service('chrome-runtime'),

  async model() {
    const runtime = this.get('runtime');
    const templates = await runtime.load('templates');
    return { templates };
  },
});
