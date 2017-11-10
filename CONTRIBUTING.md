# contributing to yoshi

## before you start

 - for a simple fix - write a failing test, fix it, do a PR;
 - for an extension/change - open issue to discuss it with maintainers first;

# set-up

yoshi is a mono-repo that uses [lerna](https://github.com/lerna/lerna) and [lerna-script](https://github.com/wix/lerna-script) 
to manage modules within. Once you clone the repo, you should:

```bash
nvm install && yarn install --no-lockfile
```

to set-up project, meaning install dependencies for all modules. Once you done that, did your change and want to push a PR, 
it's recommended to run tests for all modules (as change might break a downstream module/dependency) which you can do with:

```bash
npm test
```

`npm test` command is change-aware, meaning that next run will execute only for modules with changes from last run.

Have fun!

# other useful commands

 - `npm run clean` - removes `node_modules`, `target` and similar files for all modules;
 - `npm run idea` - generates intellij idea project for all modules;
 - `npm run fixup` - resets `yarn.lock` files, fixes `package.json`s, etc.

 Oh, and have fun:)
