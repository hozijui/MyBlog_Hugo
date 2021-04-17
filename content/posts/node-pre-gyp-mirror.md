---
date: 2021-04-17
title: "node-pre-gyp 镜像设置"
description: "　　用 node-pre-gyp 下载的预编译文件不会随着包的源码发布到 npm 仓库，而是由包的开发者指定下载地址，可能因为网络原因无法下载预编译文件进行安装，可以通过本地编译或设置 host 的镜像解决......"
categories: ["Web"]
---


## 一、问题

　　npm 采用源码分发，如果某些 npm 包包含原生 C++ 模块时，需要在安装时使用 node-gyp 根据所处平台编译生成原生模块。 有些包会提供预编译的文件直接下载安装，node-pre-gyp 就是用于下载可用的预编译文件进行安装，如果文件不存在或下载失败时才使用 node-gyp 进行本地编译。 

　　预编译文件不会随着包的源码发布到 npm 仓库，而是由包的开发者指定下载地址，所以在安装这些包的时候可能因为众所周知的原因无法下载预编译文件安装。

　　以 bcrypt 为例，其预编译文件发布在 github release 上，安装时下载预编译文件失败，然后就用 node-gyp 编译，接着就可能会遇到其他各种各样的问题（Xcode 说的就是你）

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/node-pre-gyp-mirror/1.png)

## 二、解决方法

　　以 bcrypt 为例，首先在 package.json 里找到它的 node-pre-gyp 配置（binary 对象）

```json
{
  ...,
  "binary": {
    "module_name": "bcrypt_lib",
    "module_path": "./lib/binding/napi-v{napi_build_version}",
    "package_name": "{module_name}-v{version}-napi-v{napi_build_version}-{platform}-{arch}-{libc}.tar.gz",
    "host": "https://github.com",
    "remote_path": "kelektiv/node.bcrypt.js/releases/download/v{version}",
    "napi_versions": [
      3
    ]
  }
}
```

　　根据 host 和 package_name 看看有没有符合你开发平台的预编译文件，没有就只能乖乖本地编译了。

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/node-pre-gyp-mirror/2.png)

　　如果有对应的文件，但是因为网络问题下载不了，这时候可以通过设置 host 的镜像解决。

　　在安装时使用 `--{module_name}_binary_host_mirror` 参数设置 host 镜像，bcrypt 的 host 是 github，所以 host 镜像要设置为 github 镜像。

```shell
npm i -S bcrypt --bcrypt_lib_binary_host_mirror=https://github.com.cnpmjs.org/
```

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/node-pre-gyp-mirror/3.png)



## Reference

[GitHub - mapbox/node-pre-gyp: Node.js tool for easy binary deployment of C++ addons](https://github.com/mapbox/node-pre-gyp)
