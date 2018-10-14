/**
 * demo configuration
 */
const demo = {
  remote: {
    aliyun: {
      scheme: 'sftp',
      host: '121.42.59.52',
      username: 'yongf',
      password: 'yongf1996.',
    },
    test: {
      scheme: 'ftp',
      host: 'host',
      username: 'username',
    },
    projectX: {
      scheme: 'sftp',
      host: 'host',
      username: 'username',
      privateKeyPath: '/Users/xx/.ssh/id_rsa',
      rootPath: '/home/foo/some/projectx',
    },
  },
};

/**
 * 默认配置
 */
const defaultConfig = {
  rootPath: '/',
  connectTimeout: 1000 * 10,
};

/**
 * TODO: 获取用户配置信息
 */
export function getUserSettings() {
  return demo;
}

function withDefault(name, remote) {
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

export function getRemoteList() {
  const userConfig = getUserSettings();
  const remote = userConfig.remote;
  return Object.keys(remote).map(name => withDefault(name, remote[name]));
}
