import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('index', { path: '/index.html' });
  this.route('template', { path: 'template/:id' });
  this.route('not-found', { path: '*' });
});

export default Router;
