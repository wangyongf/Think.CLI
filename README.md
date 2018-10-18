# Think.CLI

Think.CLI, a powerful cli for TeamZ.

## Features

- deploy.

## Setup

## Config

## CLI

### Usage

`deploy` 执行的是覆盖策略

1. `npm i -g teamz-think-cli`
2. `think deploy aliyun --config <YOUR_CONFIG_FILE_PATH>`

```
YOUR_CONFIG_FILE_PATH: 你配置文件的路径（绝对路径）
```

3. `deploy` 示例配置文件：

.thinkrc 配置文件如下所示，第二点的命令中，`deploy` 后面的 `aliyun` 是配置文件中所需要上传的服务器的名称，亦即 `remotefs-remote-aliyun` 这个节点，比如如果要连接 `test` 服务器，则输入的是 `test`。

配置文件中，`scheme` 选择 `sftp`；`host` 为主机的 IP 地址；`username` 为主机登录用户名；`password` 为主机密码；`localPath` 为要上传的本地路径，在 Windows 上的路径分隔符可能是**反斜杠**，这一点请注意；`remotePath` 为主机上的要上传的文件路径，因为主机一般为 Linux 系统，所以路径分隔符一般为**斜杠**。

如果命令执行完毕 `success`，说明上传成功，否则上传失败，请检查（比如网络问题？配置文件配置有误？），上传成功以后，应该到服务器检查一下，路径什么的，文件什么的，是否都在。

```json
{
  "remotefs": {
    "remote": {
      "aliyun": {
        "scheme": "sftp",
        "host": "121.42.59.52",
        "username": "yongf",
        "password": "yongf1996.",
        "localPath": "/Users/laoma/Anything/tmp/",
        "remotePath": "/var/www/html/tmp/"
      },
      "test": {
        "scheme": "ftp",
        "host": "host",
        "username": "username"
      },
      "projectX": {
        "scheme": "sftp",
        "host": "host",
        "username": "username",
        "privateKeyPath": "/Users/xx/.ssh/id_rsa",
        "rootPath": "/home/foo/some/projectx"
      }
    }
  }
}
```

### Example

## 站在巨人的肩膀上

- Typescript
- Prettier
- [mscdex/ssh2](https://github.com/mscdex/ssh2)
- [mityburner/sftp-client-promise](https://github.com/mityburner/sftp-client-promise)

## Donation

If this project help you reduce time to develop, you can donate me a cup of coffee :)

### Alipay

### WechatPay

### Paypal
