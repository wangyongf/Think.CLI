import * as think from 'commander';

think
  .version('1.0.0', '-v, --version')
  .option('-i, --init', 'init something')
  .option('-g, --generate', 'generate something')
  .option('-r, --remove', 'remove something');

think
  .command('test')
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

think.command('init').action(() => {
  console.log('init something');
});

think.command('generate').action(() => {
  console.log('generate something');
});

think.command('remove').action(() => {
  console.log('remove something');
});

think.parse(process.argv);
