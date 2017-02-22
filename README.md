<h1 align="center">
<img width="241" src ="media/wix-node-build_logo-sm.png" />
<br>
yoshi
</h1>

> A tool for common tasks in Javascript projects.

## Features

* Transpile to ES6/Typescript
* Support React/Angular 1.x (2.0 will be supported soon)
* Browser tests using protractor / Selenium Webdriver
* Unit tests using Jest/Mocha/karma
* ESlint/TSlint
* CSS Modules
* Sass
* Local dev environment running node server / cdn server
* [Wallaby](https://wallabyjs.com/)
* async/await (`babel-polyfill` needed)
* Minify/Uglify
* Bundle JS/CSS using Webpack
* External/Inline css


## Install

```bash
npm install --save-dev yoshi
```

## Sample usage

In your `package.json`:

```js
{
  "scripts": {
    "start": "yoshi start",
    "test": "yoshi test",
    "build": "yoshi lint && yoshi build",
    "release": "yoshi release" //only needed if you publish to npm
    ...
  }
}
```

Or within the command-line:

```console
yoshi [command] [options]
```

---

## CLI

The following sections describe the available tasks in `yoshi`. You can always use the `--help` flag for every task to see its usage.

### start

Flag | Short Flag | Description | Default Value
---- | ---------- | ----------- | --------------
--entry-point | -e | Entry point for the app. | `./dist/index.js`
--watch | -w | Watches project files, rebuilds and restarts on change. | `false`

This will run the specified (server) `entryPoint` file and mount a CDN server.

The following are the default values for the CDN server's port and the mount directory. You can change them in your `package.json`:

```json
"wix": {
  "servers": {
    "cdn": {
      "port": 3200,
      "dir": "dist/statics"
    }
  }
}
```

### build

Flag | Short Flag | Description | Default Value
---- | ---------- | ----------- | ------------
--dirs <dirs,...> | | Transpile the files inside the specified directories (comma-separated list). This option will also copy the `assets/` folder in those directories. | `app,src,test`
--output <dir> | | The output directory for static assets. | `statics`
--context <dir> | | The directory used for resolving entries. More info [here](https://webpack.github.io/docs/configuration.html#context). | `src`

This task will perform the following:

1. Compile using `TypeScript` (`*.ts`) or `babel` (`*.js`) files into `dist/`. In case you do not want to transpile server (node), you can remove `.babelrc`/`tsconfig`/package json's `babel` key. If you still need those (for transpiling client code), please use `wix.runIndividualTranspiler`.
2. Copy assets to `dist` folder (ejs/html/images...). Files located in `${dirs}/assets` will be copied to the output directory specified in flag.
3. Bundle the entry points using Webpack and compile `sass` files when `--bundle` flag is on.

You can specify multiple entry points in your `package.json` file. This gives the ability build multiple bundles at once. More info about Webpack entries can be found [here](http://webpack.github.io/docs/configuration.html#entry).

```json
"wix": {
  "entry": {
    "a": "./a",
    "b": "./b",
    "c": ["./c", "./d"]
  }
}
```

**Note:** the decision whether to use `TypeScript` or `babel` is done by searching `tsconfig.json` inside the root directory.

### css

- By default, your `require`d css will bundled to a separate `app.css` bundle. You can leave your css in main js bundle by adding the following to your `package.json`:

  ```json
  "wix": {
    "separateCss": false
  }
  ```

- We use [css modules](https://github.com/css-modules/css-modules) as default. You can disable this option any time by adding the following to wix section inside your `package.json`:

  ```json
  "wix": {
    "cssModules": false
  }
  ```

  Using css modules inside your component is easy:

  ```js
  import s from './Counter.scss';//import css/scss

  <p className={s.mainColor}>{counterValue}</p>
  ```

  Using css when css modules are turned off:

  ```js
  import s from './Counter.scss';//import css/scss

  <p className="mainColor">{counterValue}</p>
  ```

### test

Flag | Description
---- | -----------
--mocha | Run unit tests with Mocha - this is the default
--jasmine | Run unit tests with Jasmine
--karma | Run tests with Karma (browser)
--jest | Run tests with Jest
--protractor | Run e2e tests with Protractor (e2e)

By default, this task executes both unit test (using `mocha` as default) and e2e test using `protractor`.
Default unit test glob is `{test,app,src}/**/*.spec.+(js|ts)`. You can change this by adding the following to your package.json:

```js
wix: {
  specs: {
    node: 'my-crazy-tests-glob-here'
  }
}
```

* Note that when specifying multiple flags, only the first one will be considered, so you can't compose test runners (for now).

* Mocha tests setup:

  You can add a `test/mocha-setup.js` file, with mocha tests specific setup. Mocha will `require` this file, if exists.
  Example for such `test/mocha-setup.js`:

  ```js
  import 'babel-polyfill';
  import 'isomorphic-fetch';
  import sinonChai from 'sinon-chai';
  import chaiAsPromised from 'chai-as-promised';
  import chai from 'chai';

  chai.use(sinonChai);
  chai.use(chaiAsPromised);
  ```

#### Karma

When running tests using Karma, make sure you have the right configurations in your `package.json` as described in [`wix.specs`](#wixspecs) section. In addition, if you have a `karma.conf.js` file, the configurations will be merged with our [built-in configurations](config/karma.conf.js).

### lint

Flag | Short Flag | Description
---- | ---------- | -----------
--client | -c | Runs linters for client only (`stylelint`).

Executes `TSLint` or `ESLint` (depending on the type of the project) over all matched files. An '.eslintrc' / `tslint.json` file with proper configurations is required.

### release

Bump `package.json` version and publish to npm using `wnpm-release`.

---

## Configurations

Configurations are meant to be inside `package.json` under `wix` section or by passing flags to common tasks.

#### Flags

See above sections.

#### Configurations in `package.json`

##### `wix.separateCss`

Explanation is in [cli/build](#build) section.

##### `wix.entry`

Explanation is in [cli/build](#build) section.

##### `wix.servers.cdn`

Explanation is in [cli/start](#start) section.

##### `wix.translationModuleName`

For angular project, this will be the name of the angular module containing the processed trasnlation files. If not specified, the name `${wix.clientProjectName}Translations` will be used if available, otherwise, the project name will be taken from the `package.json` name property. 

##### `wix.specs`

Specs globs are configurable. `browser` is for karma, `node` is for mocha and jasmine.

```json
{
  "wix": {
    "specs": {
      "browser": "dist/custom/globs/**/*.spec.js",
      "node": "dist/custom/globs/**/*.spec.js"
    }
  }
}
```

For example:

```json
{
  "wix": {
    "specs": {
      "browser": "dist/src/client/**/*.spec.js",
      "node": "dist/src/server/**/*.spec.js"
    }
  }
}
```

##### `wix.runIndividualTranspiler`

In case you don't want to transpile your server (node) code, and you still need `.babelrc`/`tsconfig`, you can add `runIndividualTranspiler` flag to skip server transpiling.

##### `wix.externalUnprocessedModules`

You can explicitly ask build process to transpile some node modules in case those modules do not contain transpiled code.
Note that this is not a recommended workflow. It can be very error prone:
 1. It might be for example that your app babel config and the node module babel config will be conflicting.
 2. Any babel plugin that is used by your dependencies will need to be installed by your app as well.
 3. You'll need to also add nested dependencies that need transpiling into array, which can be confusing.

Anyway, if you don't have a better alternative you can pass array with module names in this property.

##### `wix.exports`

If set, export the bundle as library. `wix.exports` is the name.

Use this if you are writing a library and want to publish it as single file. Library will be exported with `UMD` format.

##Examples

1. [React Fullstack Seed](https://github.com/wix/react-fullstack-seed)
2. [React Universal Seed](https://github.com/wix/react-universal-seed)

##FAQ

- [How to add external assets to my client part of the project?](docs/faq/ASSETS.md)
- [How do I setup Enzyme test environment?](docs/faq/SETUP-TESTING-WITH-ENZYME.md)
- [How to disable css modules in specific places](docs/faq/DISABLE-SPECIFIC-CSS-MODULES.md)
- [How to I analyze my webpack bundle contents](docs/faq/WEBPACK-ANALYZE.md)
