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
        const tempPromise = conn.sftp('createWriteStream', {
          path: temp.remote,
          data: Fs.createReadStream(temp.local),
        });
        allPromise.push(tempPromise);
      }

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
