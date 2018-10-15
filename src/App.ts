import * as Think from 'commander';
import * as Config from './config/Config';
import * as RemoteFS from './core/RemoteFS';

Think.version('1.0.0', '-v, --version')
  .option('-i, --init', 'init something')
  .option('-g, --generate', 'generate something')
  .option('-r, --remove', 'remove something');

Think.command('test')
  .option('--w', 'just a test')
  .alias('t')
  .description('just An test')
  .action(option => {
    const isWatch = option.w ? true : false;
    if (isWatch) {
      console.log('isWatch');
    } else {
      console.log('not isWatched');
    }
  });

Think.command('deploy <target>')
  .description('deploy project with the specific config')
  .action((target, option) => {
    const targetConfig = Config.config(target);
    if (targetConfig === undefined) {
      console.log('target not configged, please check your config first');
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
