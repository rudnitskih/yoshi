'use strict';

const sass = require('node-sass');
const {tryRequire, getMochaReporter} = require('../lib/utils');
const {wixCssModulesRequireHook} = require('yoshi-runtime');

//Private wix applitools key
//skip wix' key for applitools
//In case you want to use applitools & eyes.it (https://github.com/wix/eyes.it)
//in your project, please use your own key
tryRequire('../private/node_modules/wix-eyes-env');

// Private Wix environment config for screenshot reporter
// Read how to set your own params (if needed) here: https://github.com/wix/screenshot-reporter#usage
tryRequire('../private/node_modules/screenshot-reporter-env');


require('../lib/require-hooks');
const path = require('path');
const ld = require('lodash');
const exists = require('../lib/utils').exists;
const inTeamCity = require('../lib/utils').inTeamCity;
const {start} = require('../lib/server-api');
const globs = require('../lib/globs');

const userConfPath = path.resolve('protractor.conf.js');
const userConf = exists(userConfPath) ? require(userConfPath).config : null;

const shouldUseProtractorBrowserLogs = process.env.PROTRACTOR_BROWSER_LOGS === 'true';

const beforeLaunch = (userConf && userConf.beforeLaunch) || ld.noop;
const onPrepare = (userConf && userConf.onPrepare) || ld.noop;
const afterLaunch = (userConf && userConf.afterLaunch) || ld.noop;

let cdnServer;

const merged = ld.mergeWith({
  framework: 'jasmine',
  specs: [globs.e2e()],
  directConnect: true,

  beforeLaunch: () => {
    const rootDir = './src';
    wixCssModulesRequireHook(rootDir, {
      preprocessCss: (data, file) => sass.renderSync({
        data,
        file,
        includePaths: ['node_modules', 'node_modules/compass-mixins/lib']
      }).css
    });

    require('../lib/require-hooks');

    return start({host: 'localhost'}).then(server => {
      cdnServer = server;
      return beforeLaunch.call(merged);
    });
  },
  onPrepare: () => {
    if (shouldUseProtractorBrowserLogs) {
      setupProtractorLogs();
    }

    if (merged.framework === 'jasmine' && inTeamCity()) {
      const TeamCityReporter = require('jasmine-reporters').TeamCityReporter;
      jasmine.getEnv().addReporter(new TeamCityReporter());
    }

    try {
      const ScreenshotReporter = require('screenshot-reporter');
      jasmine.getEnv().addReporter(new ScreenshotReporter());
    } catch (e) {}

    return onPrepare.call(merged);
  },
  afterLaunch: () => {
    if (cdnServer) {
      cdnServer.close();
    }
    return afterLaunch.call(merged);
  },
  mochaOpts: {
    timeout: 30000
  }
}, userConf, a => typeof a === 'function' ? a : undefined);

if (merged.framework === 'mocha') {
  merged.mochaOpts.reporter = getMochaReporter();
}

function normaliseSpecs(config) {
  const specs = [].concat(config.specs || []);
  return Object.assign({}, config, {specs: specs.map(spec => path.resolve(spec))});
}

function setupProtractorLogs() {
  const browserLogs = require('protractor-browser-logs');
  const logs = global.logs = browserLogs(browser);

  beforeEach(() => {
    logs.reset();

    logs.ignore(logs.DEBUG);
    logs.ignore(logs.INFO);
    logs.ignore(logs.LOG);

    logs.ignore('favicon.ico');
    logs.ignore('cast_sender.js');
  });

  afterEach(logs.verify);
}

module.exports.config = normaliseSpecs(merged);
