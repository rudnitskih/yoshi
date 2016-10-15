#!/usr/bin/env node
'use strict';

const _ = require('lodash');
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const program = require('commander');

program
  .option('--duringwatch', 'during watch (run only unit tests)')
  .option('-m --mocha', 'run unit tests on mocha')
  .option('--jasmine', 'run unit tests on jasmine')
  .option('--karma', 'run unit tests on karma')
  .option('--protractor', 'run e2e on protractor')
  .option('--watch', 'watch for changes')
  .parse(process.argv);

require('./lib/tasks/aggregators/test')(gulp, plugins, program);

const options = ['mocha', 'jasmine', 'karma', 'protractor', 'duringwatch'];
const command = _.find(options, option => program[option]);

command ?
  gulp.start(`test:${command}`) :
  gulp.start('test');