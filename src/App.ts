#!/usr/bin/env node

import * as Think from 'commander';
import * as Config from './config/Config';
import * as RemoteFS from './core/RemoteFS';
import { ip } from './core/IPProvider';

Think.version('1.0.0', '-v, --version')
  .option('-i, --init', 'init something')
  .option('-g, --generate', 'generate something')
  .option('-r, --remove', 'remove something');

Think.command('test')
  .option('-w, --watch <value>', 'just a test')
  .alias('t')
  .description('just An test')
  .action(option => {
    console.log(option.watch);
  });

Think.command('show <option>')
  .description('show what you want, eg: your IP')
  .action((option, target) => {
    if ('ip' === option) {
      // show your IP
      ip();
    }
  });

Think.command('deploy <target>')
  .description('deploy project with the specific config')
  .option('-c, --config <value>', 'with the specific configuration')
  .action((target, option) => {
    const targetConfig = Config.config(target, option.config);
    if (targetConfig === undefined) {
      console.log('target not config, please check your config first');
      return;
    }

    RemoteFS.connect(targetConfig);
  });

Think.command('pwd').action(() => {
  console.log(process.env.PWD);
  console.log('wangyongf');
});

Think.command('init').action(() => {
  console.log('init something');
});

Think.command('generate').action(() => {
  console.log('generate something');
});

Think.command('remove').action(() => {
  console.log('remove something');
});

Think.parse(process.argv);
