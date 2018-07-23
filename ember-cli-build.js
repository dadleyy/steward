'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const Funnel = require('broccoli-funnel');
const debug = require('broccoli-debug').buildDebugCallback('steward');
const concat = require('broccoli-concat');
const Merge = require('broccoli-merge-trees');

const LOADER_SOURCE = './node_modules/loader.js/dist/loader';

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    sassOptions: {
      extension: 'sass',
    },
    babel: {
      plugins: ['transform-object-rest-spread'],
    },
  });

  let babel = app.project.findAddonByName('ember-cli-babel');
  let extensions = [];

  for (const subdir of ['content-scripts', 'background-scripts']) {
    let scripts = debug(new Funnel(`extension/${subdir}`, { destDir: subdir }), `funnel-${subdir}`);
    let transpiled = debug(babel.transpileTree(scripts), `transpiled-${subdir}`);
    let loader = debug(new Funnel(LOADER_SOURCE, { destDir: 'loader' }), `loader-copy-${subdir}`);
    let merged = debug(new Merge([transpiled, loader]), `merged-${subdir}`);

    let bundle = debug(concat(merged, {
      headerFiles: ['loader/loader.js'],
      inputFiles: [`**/${subdir}/*.js`, `**/${subdir}/**/*.js`],
      outputFile: `${subdir}/worker.js`,
      footer: `;(function() { require("${subdir}/worker"); })();`,
    }), 'bundle');

    extensions.push(bundle);
  }

  return app.toTree(extensions);
};
