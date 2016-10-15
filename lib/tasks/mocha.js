'use strict';

const utils = require('../utils');
const projectConfig = require('../../config/project');
const globs = require('../globs');
const inTeamCity = require('../utils').inTeamCity;
const path = require('path');

module.exports = (gulp, plugins, {watch}) => {
  gulp.task('mocha', watch ? ['mocha:watch'] : ['_mocha']);

  gulp.task('mocha:watch', ['_mocha'], () => {
    gulp.watch(`${globs.base()}/**/*`, ['_mocha']);
  });

  gulp.task('_mocha', () => {
    plugins.util.log('Testing with Mocha');

    const mochaGlobs = projectConfig.specs.node() || globs.specs();
    const ignoreExtensions = path.join(__dirname, '..', 'ignore-extensions');
    const setupDom = path.join(__dirname, '..', 'setup-dom');
    const runtimeHook = utils.isTypescriptProject() ?
      'ts-node/register' :
      'babel-register';

    return gulp.src(mochaGlobs, {read: false})
      .pipe(plugins.spawnMocha({
        env: {NODE_ENV: 'test', SRC_PATH: './src'},
        reporter: inTeamCity() ? 'mocha-teamcity-reporter' : 'progress',
        timeout: 30000,
        require: [runtimeHook, ignoreExtensions, setupDom]
      }))
      .on('error', handleErrors);

    function handleErrors(err) {
      // gulp-spawn-mocha does not emits error on AssertionError, but just display them
      // if there's an AssertionError, it emits an error at the end of the stream
      if (!watch) {
        throw err;
      }

      this.emit('end');
    }
  });
};