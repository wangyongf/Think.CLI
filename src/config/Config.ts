import * as Path from 'path';
import * as Fs from 'fs';

const CONFIG_FILE_NAME = '.thinkrc';

export const DEBUG = false;

const defaultConfig = {
  rootPath: '/',
  connectTimeout: 1000 * 10,
};

/**
 * 开始读取配置文件
 */
export function config(target: string) {
  console.log('start load config');
  console.log('target = ' + target);

  const pwd = process.env.PWD;
  const configPath = Path.join(pwd, './', CONFIG_FILE_NAME);
  const hasConfig = Fs.existsSync(configPath);
  if (hasConfig) {
    const content = Fs.readFileSync(configPath, 'utf8');
    const targetConfig = _findRemoteByName(target, content);
    return targetConfig;
  }
  return undefined;
}

function _findRemoteByName(name: string, content: string) {
  const remoteList = _getRemoteList(content);
  return remoteList.find(remote => remote.name === name);
}

/**
 * 设置端口号等
 * @param name 配置名
 * @param remote 配置列表
 */
function _withDefault(name, remote) {
  const copy = Object.assign({}, defaultConfig, remote);
  copy.name = name.toLowerCase();
  copy.scheme = copy.scheme.toLowerCase();

  // tslint:disable-next-line triple-equals
  if (copy.port == undefined) {
    switch (copy.scheme) {
      case 'sftp':
        copy.port = 22;
        break;
      case 'ftp':
        copy.port = 21;
        break;
      default:
        break;
    }
  }

  return copy;
}

function _getRemoteList(content: string) {
  const userConfig = JSON.parse(content);
  const remote = userConfig.remotefs.remote;
  return Object.keys(remote).map(name => _withDefault(name, remote[name]));
}
