import { DEBUG } from './../config/Config';
import * as Fs from 'fs';
import * as Path from 'path';
import * as SftpClient from 'sftp-client-promise';
// import { Observable, Subject, ReplaySubject, from, of, range } from 'rxjs';
import * as Rx from 'rxjs';
import { map, filter, switchMap } from 'rxjs/operators';
import * as ora from 'ora';

interface ConnectConfig {
  scheme: string;
  host: string;
  connectTimeout?: number;
  username: string;
  password?: string;
  name: string;
  port: number;
  privateKeyPath?: string;
  remotePath: string;
  localPath: string;
}

export function connect(config: ConnectConfig) {
  console.log('connecting...');

  // _testUpload();

  _connect(config);
}

function _testUpload() {
  const conn = new SftpClient();
  conn
    .connect({
      host: '121.42.59.52',
      port: '22',
      username: 'yongf',
      password: 'yongf1996.',
    })
    .then(() => {
      conn.sftp('mkdir', { path: '/var/www/html/tmp/random/' });
    })
    .then(() => {
      conn.sftp('createWriteStream', {
        path: '/var/www/html/tmp/random/charles.jar',
        data: Fs.createReadStream('/Users/laoma/Anything/tmp/charles.jar'),
      });
    })
    .then(() => {
      console.log('upload success');
      conn.end();
    })
    .catch(err => {
      console.log('upload failed');
      console.log(err);
      conn.end();
    });
}

interface FileMap {
  local: string;
  remote: string;
}

const fileMap: Array<FileMap> = [];
const remoteDirectory: Array<string> = [];

function _connect(config: ConnectConfig) {
  const localPath = Path.resolve(config.localPath);
  const remotePath = Path.resolve(config.remotePath);

  _readdirSync(localPath, remotePath, 0);
  _performUpload(config);
}

/**
 * 顺序执行 Promise
 * @param tasks 任务们
 */
function sequenceTasks(tasks) {
  function recordValue(results, value) {
    results.push(value);
    return results;
  }
  const pushValue = recordValue.bind(null, []);
  return tasks.reduce((promise, task) => {
    return promise.then(task).then(pushValue);
  }, Promise.resolve());
}

/**
 * 1. 连接服务器
 * 2. 创建所有文件夹
 * 3. 上传所有文件
 * @param config 服务器配置
 */
function _performUpload(config: ConnectConfig) {
  const spinner = ora('prepare to upload').start();
  spinner.color = 'yellow';

  const ftpConfig = {
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
  };

  const conn = new SftpClient();
  conn
    .connect(ftpConfig) // 1. 连接服务器
    .then(() => {
      // 2. 创建所有文件夹
      const allPromise = [];
      for (const remote of remoteDirectory) {
        const tempPromise = conn
          .sftp('exists', { path: remote })
          .then(dirExist => {
            if (!dirExist) {
              return conn.sftp('mkdir', { path: remote });
            }
          });
        allPromise.push(tempPromise);
      }
      return Promise.all(allPromise);
    })
    .then(() => {
      spinner.succeed('mkdir success');
      spinner.start('uploading files');

      // 3. 上传所有文件
      const allPromise = [];
      for (const temp of fileMap) {
        // const tempPromise = () =>
        //   conn.sftp('exists', { path: temp.remote }).then(fileExist => {
        //     if (fileExist) {
        //       // return conn.sftp('delete', { path: temp.remote }).then(() => {
        //       //   return conn.sftp('createWriteStream', {
        //       //     path: temp.remote,
        //       //     data: Fs.createReadStream(temp.local),
        //       //   });
        //       // });
        //       const deleteAction = () => {
        //         return conn.sftp('delete', { path: temp.remote });
        //       };
        //       const uploadAction = () => {
        //         return conn.sftp('createWriteStream', {
        //           path: temp.remote,
        //           data: Fs.createReadStream(temp.local),
        //         });
        //       };
        //       return sequenceTasks([deleteAction, uploadAction]);
        //     } else {
        //       const uploadAction = () => {
        //         conn.sftp('createWriteStream', {
        //           path: temp.remote,
        //           data: Fs.createReadStream(temp.local),
        //         });
        //       };
        //       return sequenceTasks([uploadAction]);
        //     }
        //   });

        const tempPromise = conn.sftp('createWriteStream', {
          path: temp.remote,
          data: Fs.createReadStream(temp.local),
        });
        allPromise.push(tempPromise);
      }

      // return sequenceTasks(allPromise);
      return Promise.all(allPromise);
    })
    .then(() => {
      spinner.succeed('upload success');
      conn.end();
      spinner.stop();
    })
    .catch(err => {
      spinner.fail('upload failed');
      console.error(err);
      conn.end();
      spinner.stop();
    });
}

function _testLoading() {
  const spinner = ora('Loading config').start();
  spinner.color = 'yellow';

  console.log('directory list: ' + remoteDirectory);
  console.log();
  setTimeout(() => {
    spinner.succeed('Loading success, enjoy it!');
  }, 3000);
  for (const temp of fileMap) {
    console.log('local: ' + temp.local);
    console.log('remote: ' + temp.remote);
  }
  setTimeout(() => {
    spinner.stop();
  }, 5000);
}

function _testRx() {
  const observable = Rx.Observable.create(observer => {
    observer.next('hi');
    observer.next('world');
    setTimeout(() => {
      observer.next('这是一段一步操作');
    }, 30);
    observer.complete();
  }).pipe(map((value: string) => value.repeat(2)));
  console.log('start');
  const subscription = observable.subscribe(value => {
    console.log(value);
  });
  console.log('end');
  setTimeout(() => {
    subscription.unsubscribe();
  }, 5000);
}

function _readdirAsync(path: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    Fs.readdir(path, (err, files) => {
      if (err) {
        reject(err);
      }
      resolve(files);
    });
  });
}

function _statAsync(path: string): Promise<Fs.Stats> {
  return new Promise<Fs.Stats>((resolve, reject) => {
    Fs.stat(path, (err, stats) => {
      if (err) {
        reject(err);
      }
      resolve(stats);
    });
  });
}

function _readdirSync(local: string, remote: string, depth: number) {
  // TODO: add try-catch here?
  const files: string[] = Fs.readdirSync(local);
  files.forEach((file, index) => {
    // 获取当前文件的绝对路径
    const localDir = Path.join(local, file);
    // 获取远程当前文件的绝对路径
    const remoteDir = Path.join(remote, file);
    const info: Fs.Stats = Fs.statSync(localDir);
    if (info.isDirectory()) {
      remoteDirectory.push(remoteDir);
      _readdirSync(localDir, remoteDir, depth + 1);
    }
    if (info.isFile()) {
      fileMap.push({
        local: localDir,
        remote: remoteDir,
      });
    }
  });
}

async function _recursiveReaddir(local: string, remote: string, depth: number) {
  // 根据文件路径读取文件，返回文件列表
  Fs.readdir(local, (err, files) => {
    if (err) {
      console.warn(err);
    } else {
      // 遍历读取到的文件
      files.forEach(filename => {
        // 获取当前文件的绝对路径
        const localDir = Path.join(local, filename);
        // 获取远程当前文件的绝对路径
        const remoteDir = Path.join(remote, filename);
        // 根据文件路径获取文件信息
        Fs.stat(localDir, (error, stats) => {
          if (error) {
            console.warn('stats failed');
          } else {
            if (stats.isFile()) {
              console.log(_getTab(depth), localDir);
              fileMap.push({
                local: localDir,
                remote: remoteDir,
              });

              // const readable = Fs.createReadStream(localDir);
              // const writable = Fs.createWriteStream(remoteDir);
              // readable.pipe(writable);
            }
            if (stats.isDirectory()) {
              // Fs.exists(remoteDir, exists => {
              //   if (exists) {
              //     _recursiveReaddir(localDir, remoteDir, depth + 1);
              //   } else {
              //     Fs.mkdir(remoteDir, () => {
              //       _recursiveReaddir(localDir, remoteDir, depth + 1); // 开始递归
              //     });
              //   }
              // });
              _recursiveReaddir(localDir, remoteDir, depth + 1);
            }
          }
        });
      });
    }
  });
}

function _getTab(count: number) {
  return '    '.repeat(count);
}
