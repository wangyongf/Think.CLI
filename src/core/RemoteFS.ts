import * as Fs from 'fs';
import * as Ftp from 'jsftp';

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

  _connect(config);
}

function _connect(config: ConnectConfig) {
  const ftpConfig = {
    host: config.host,
    port: config.port,
    user: config.username,
    pass: config.password,
  };
  const ftp = new Ftp(ftpConfig);

  // 0. 确认本地文件存在
  // 1. 列出所有本地文件
  // 2. 上传所有文件到指定目录
  // 3. 策略是循环时跑到一个文件就上报一个文件
  // TODO
}
