---
date: 2019-11-02
title: "使用 Caddy 和 Github 实现博客的自动部署"
description: "　　Caddy是一款由 Go 编写的，快速、易用的生产型开源 Web 服务器，默认启动 HTTPS 和 HTTP/2，支持虚拟主机与多站点，还有可扩展插件等特点。使用 Caddy 和 Github Webhook 可以实现 Hugo 静态博客的自动部署和更新，其原理很简单，就是当成功 push 到 Github 仓库时，Github 会向钩子 URL 发送请求，服务器收到请求后重新拉取仓库代码实现自动更新部署......"
categories: ["Web"]
---

　　之前说了生成博客，接下来就要部署到服务器上了。这次我选用的 Web Server 是 Caddy，它同样是由 Go 编写，是一款快速、易用的生产型开源 Web 服务器，默认启动 HTTPS 和 HTTP/2，支持虚拟主机与多站点，还有可扩展插件等特点。

　　使用 Caddy 和 Github Webhook 可以实现 Hugo 静态博客的自动部署和更新。

## 一、准备事项

- 确认服务器安装了 curl、Git 和 Hugo

- 为博客创建仓库，并 push 到 Github

## 二、安装与使用 Caddy

　　Caddy 2 已经有 beta 测试版了，但是这里还是用 Caddy 1

### 1.下载 Caddy

　　使用下面的命令下载安装 Caddy，其中 http.git 是必须的插件，后面要用到，如果还需要其他插件也可以加上。

```bash
curl https://getcaddy.com | bash -s personal http.git
```

### 2.添加 caddy.service

　　我们使用 www-data 用户运行 caddy。首先确认 caddy 在 /usr/local/bin 下，用户/用户组/权限 为 root/root/755；然后用下面的命令让 caddy 能够以非root用户绑定到特权端口（例如80、443）

```bash
setcap 'cap_net_bind_service=+ep' /usr/local/bin/caddy
```

　　接着设置要用到的目录及其权限：

```bash
# 配置文件目录
mkdir /etc/caddy
chown -R root:root /etc/caddy

# ssl证书目录
mkdir /etc/ssl/caddy
chown -R root:www-data /etc/ssl/caddy
chmod 0770 /etc/ssl/caddy

# 日志文件目录
mkdir /var/log/caddy
chown -R root:www-data /var/log/caddy
chmod 0770 /etc/ssl/caddy

# 站点文件目录
mkdir /var/www
chown www-data:www-data /var/www
chmod 755 /var/www
```

　　最后安装 systemd 服务配置文件，重新加载 systemd 配置，设置 caddy 服务开机自启：

```bash
wget https://raw.githubusercontent.com/caddyserver/caddy/master/dist/init/linux-systemd/caddy.service
cp caddy.service /etc/systemd/system/
chown root:root /etc/systemd/system/caddy.service
chmod 644 /etc/systemd/system/caddy.service
systemctl daemon-reload
systemctl enable caddy.service
```

　　现在就可以使用 `systemctl` 命令管理 caddy 服务了

### 3.使用 Caddyfile 配置服务器

　　开启 caddy 服务之前还要写个配置文件 /etc/caddy/Caddyfile：

```Caddyfile
# 站点域名或ip，可以指定端口
example.com {
    gzip  # 开启gzip压缩
    root /var/www/MyBlog_Hugo/public  # 站点文件根目录 
    log /var/log/caddy/access.log     # 访问日志
    errors /var/log/caddy/errors.log  # 错误日志
}
```

　　将站点文件放到设置的目录下，就可以启动 caddy 服务了

## 三、使用 Github WebHook 实现自动部署

　　使用 Webhook 实现自动部署的原理很简单，就是当成功 push 到 Github 仓库时，Github 会向钩子 URL 发送请求，服务器收到请求后重新拉取仓库代码实现自动更新部署。Hugo 生成静态页面的步骤也交给服务器自动完成。

![](/images/caddy-auto-deployment/1.png)

### 1.在 Github 仓库中添加 Webhook

　　在仓库 Settings > Webhooks 中添加 Webhook，其中Payload URL 就是钩子 URL，Secret是校验签名。

![](/images/caddy-auto-deployment/2.png)

### 2.配置 caddy http.git 插件

　　在 Caddyfile 中添加下面的内容

```Caddyfile
example.com {
    ......
    git {
        repo https://github.com/hozijui/MyBlog_Hugo.git
        path /var/www/MyBlog_Hugo
        clone_args --recursive
        pull_args --recurse-submodules
        key /path/to/id_rsa
        hook /subscribe hook_secret
        then hugo --destination=/var/www/MyBlog_Hugo/public
        hook_type github
    }
}
```

- `repo`：github 仓库地址，当前版本（v1.0.3）的插件处理 ssh 地址有点问题，可以参考这个 [issuse](https://github.com/abiosoft/caddy-git/issues/106) 里的办法解决，也可以用 https。如果是私密仓库，需要加上用户名和密码。

- `path`：本地仓库目录

- `clone_args`：git clone 参数，–recursive 遍历所有的文件夹

- `pull_args`：git pull 参数，–recurse-submodules 包括子模块

- `key`：访问 Github SSH 的私钥

- `hook`：有两个参数，第一个是钩子 URL，第二个是 Secret，必须与上面设置的保持一致

- `then`：git pull 之后要执行的命令，这里执行 hugo 生成新的静态页面

- `hook_type`：托管源文件的平台，就是 Github

## 四、参考

- [Caddy Documentation](https://caddyserver.com/v1/docs)

- [Github Webhooks](https://developer.github.com/webhooks/)
