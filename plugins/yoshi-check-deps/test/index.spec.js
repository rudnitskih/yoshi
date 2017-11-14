'use strict';

const {expect} = require('chai');
const shmock = require('shmock');
const stripAnsi = require('strip-ansi');
const tp = require('test-phases');
const deps = require('../index');


describe('yoshi-deps', () => {
  let test, task;
  const port = 3333;
  const npmServer = shmock(port);

  beforeEach(() => {
    test = tp.create();
    process.chdir(test.tmp);
    task = deps({log: a => a});
  });

  afterEach(() => {
    test.teardown();
    npmServer.clean();
  });

  after(() => npmServer.close());

  it('should show a warning when yoshi & wix-style-react is at least 1 patch version behind', () => {
    // TODO: use more complex version, like installed - 1.5.2, latest - 1.6.0
    setupProject();
    mockMeta('yoshi', ['1.0.0', '1.0.1']);
    mockMeta('wix-style-react', ['1.0.0', '1.0.2']);

    const message = [
      'WARNING: some dependencies are a bit behind:',
      'yoshi@1.0.0 should be @1.0.1',
      'wix-style-react@1.0.0 should be @1.0.2'
    ].join('\n');

    return task().then(warning =>
      expect(stripAnsi(warning)).to.equal(message));
  });

  it('should show a warning when yoshi & wix-style-react is at least 1 version behind', () => {
    setupProject();
    mockMeta('yoshi', ['1.0.0', '2.0.0']);
    mockMeta('wix-style-react', ['1.0.0', '1.1.0']);

    const message = [
      'WARNING: some dependencies are a bit behind:',
      'yoshi@1.0.0 should be @2.0.0',
      'wix-style-react@1.0.0 should be @1.1.0'
    ].join('\n');

    return task().then(warning =>
      expect(stripAnsi(warning)).to.equal(message));
  });

  it('should throw an error when yoshi is 2 major versions behind', () => {
    setupProject();
    mockMeta('yoshi', ['1.0.0', '2.0.0', '3.0.0', '4.0.0']);

    const message = [
      'ERROR: the following dependencies must be updated:',
      'yoshi@1.0.0 must be at least @3.0.0'
    ].join('\n');

    return invertPromise(task()).then(error =>
      expect(stripAnsi(error)).to.equal(message));
  });

  it.skip('should throw an error when wix-style-react is 5 minor versions behind', () => {
    setupProject();
    mockMeta('wix-style-react', ['1.0.0', '1.1.0', '2.0.0', '2.1.0', '2.3.0', '2.5.0']);

    const message = [
      'ERROR: the following dependencies must be updated:',
      'wix-style-react@1.0.0 must be at least @1.1.0'
    ].join('\n');

    return invertPromise(task())
      .then(error => expect(stripAnsi(error)).to.equal(message));
  });

  it('should show nothing if yoshi & wix-style-react is up to date', () => {
    setupProject();
    mockMeta('yoshi', '1.0.0');
    mockMeta('wix-style-react', '1.0.0');

    return task().then(message =>
      expect(message).to.be.undefined);
  });

  function setupProject() {
    return test.setup({
      '.npmrc': `registry=http://localhost:${port}/`,
      'package.json': '{"devDependencies": {"yoshi": "1.0.0"}, "dependencies": {"wix-style-react": "1.0.0"}}',
      'node_modules/yoshi/package.json': '{"name": "yoshi", "version": "1.0.0"}',
      'node_modules/wix-style-react/package.json': '{"name": "wix-style-react", "version": "1.0.0"}'
    });
  }

  function mockMeta(name, versions) {
    versions = [].concat(versions);
    npmServer.get(`/${name}`).reply(200, {
      _id: name,
      name,
      'dist-tags': {latest: versions.slice().pop()},
      versions: versions.reduce((acc, ver) => {
        acc[ver] = {};
        return acc;
      }, {})
    });
  }

  function invertPromise(promise) {
    return new Promise((resolve, reject) =>
      promise.then(reject, resolve));
  }
});
