#!/usr/bin/env node

if (!process.env.HASTE) {
  const haste = require('haste-core');
  const presetPath = require.resolve('haste-preset-all');
  const run = haste(presetPath);
  const preset = require(presetPath);
  const cmd = process.argv[2];
  const command = preset[cmd];

  return run(command, [process.argv])
    .then(runner => {
      if (!runner.persistent) {
        process.exit(0);
      }
    })
    .catch(error => {
      if (error.name !== 'WorkerError') {
        console.log(error);
      }

      process.exit(1);
    });
}

const program = require('commander');

program
  .arguments('<process>')
  .command('start [entryPoint]', 'start the application')
  .command('release', 'bump package.json')
  .command('build', 'build the application')
  .command('test', 'test the application')
  .command('lint', 'lints the code')
  .parse(process.argv);
