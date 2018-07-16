'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const Funnel = require('broccoli-funnel');
const debug = require('broccoli-debug').buildDebugCallback('steward');
const concat = require('broccoli-concat');
const Merge = require('broccoli-merge-trees');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
  });

  let babel = app.project.findAddonByName('ember-cli-babel');
  let scripts = debug(new Funnel('content-scripts', { destDir: 'content-scripts' }), 'funnel');
  let transpiled = debug(babel.transpileTree(scripts), 'transpiled');
  let merged = debug(new Merge([
    transpiled,
    debug(new Funnel('./node_modules/loader.js/dist/loader', { destDir: 'loader' }), 'loader-copy'),
  ]), 'merged');
  let bundle = debug(concat(merged, {
    headerFiles: ['loader/loader.js'],
    inputFiles: ['**/content-scripts/*.js', '**/content-scripts/**/*.js'],
    outputFile: 'content-scripts/worker.js',
    footer: ';(function() { require("content-scripts/worker"); })();',
  }), 'bundle');

  return app.toTree([bundle]);
};
