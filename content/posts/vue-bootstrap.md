---
date: 2019-11-23
title: "Vue项目搭建"
description: "　　使用 Vue-CLI 3 进行 Vue 项目初始化；通过插件的形式引入 ElementUI 和 Axios 等所需的模块；Axios 的相关配置和封装；Webpack 打包配置；devServer 的代理配置以及 mock server 的配置......"
categories: ["Web"]
---

## 一、环境装备

　　装 Node.js、切换 npm 源、装 @vue/cli 啥的，就不写了

## 二、使用 Vue CLI 3.0 创建 Vue项目

```bash
vue create Project_Name
```

　　运行命令后，根据提示进行配置，配置完成后等待项目初始化完成即可。

## 三、添加插件

　　Vue CLI 使用了一套基于插件的架构，可以简单的使用 `vue add` 命令添加插件，也可以使用 `vue ui` 命令在图形界面上管理插件。我们可以通过插件的形式引入我们需要的模块或者库，许多库都有官方的或者第三方实现的插件。我常用的插件有 Element UI 和 axios。

### 引入 Element UI

```bash
vue add element
```

　　在项目目录下运行命令后，需要选择是按需引入还是全局引入，按需引入需要在 src/plugins/element.js 中手动添加你需要的组件，像这样：

```javascript
import Vue from 'vue'
import { Button, Table, TableColumn, Pagination } from 'element-ui'
import { Message, MessageBox } from 'element-ui';

Vue.use(Button);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Pagination);

Vue.prototype.$message = Message;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$prompt = MessageBox.prompt;
```

### 引入 Axios

```bash
vue add axios
```

　　运行命令安装插件，插件会安装 axios 并在 src/plugins 下生成一个 axios.js 文件，其作用是配置 axios（url、超时、跨域）、设置拦截器以及将配置好的 axios 实例挂到 Vue 原型下。

　　如果需要设置或修改 axios 的拦截器，就在 axios.js里改就好，比如需要添加一个 `401跳转到登录` 的拦截器：

```javascript
_axios.interceptors.response.use(
  function(response) {
    // Do something with response data
    return response;
  },
  function(error) {
    // Do something with response error
    if (error.response) {
      if (error.response.status === 401) {
        router.push({ name: 'login' });
      }
    }
    return Promise.reject(error);
  }
);
```

　　插件默认配置的 axios 通过 挂载到 Vue 原型 暴露出来。可以在 Vue 实例中可以通过 `this.axios` 或 `this.$axios` 来使用。如果喜欢其他别名（比如我习惯了 Angular 的 $http）也可以在 axios.js 里改：

```javascript
Plugin.install = function(Vue, options) {
  Vue.axios = _axios;
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return _axios;
      }
    },
    $axios: {
      get() {
        return _axios;
      }
    },
    $http: {
      get() {
        return _axios;
      }
    }
  });
};
```

　　插件还将 axios 添加到了 window 对象上，这种写法感觉不太优雅，而且写在 Plugin.install 里的 IDE 不知道执行顺序，虽然能用但是 IDE 会标红很不爽，所以我改成 export 了。

　　另外我喜欢用 async/await 处理异步，但是 axios 返回的是 Promise，需要 try/catch 处理异常，太丑了，所以我又封装了一个异常处理函数，采用类似 Golang风格的错误返回方式。

```javascript
// 封装异常处理 
function request(options) {
  return _axios(options)
      .then(resp => [null, resp])
      .catch(err => [err, null]);
}
export { _axios as axios, request};
```
　　接口请求就可以这么写

```javascript
// result.api.js
import { request } from '@/plugins/axios';
export default {
    list: (params) => request({
        method: 'get',
        url: `/api/result/`,
        params
    })
}
```
```javascript
// Result.vue
import resultApi from './result.api';
async getResult() {
    let params = {};
    let [err, resp] = await resultApi.list(params);
    if (!err) {
        // 请求成功
    } else {
        // 请求失败
    }
}
```
## 四、Webpack 和 devServer 配置

### vue.config.js

```javascript
const path = require('path');
const router = require(path.join(process.cwd(), 'router.config.js')); // 假数据配置
const proxy = require(path.join(process.cwd(), 'proxy.config.js'));  // 代理配置
const UglifyPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? '' : '/',
    outputDir: process.env.NODE_ENV === 'production' ? 'dist' : 'dev',
    lintOnSave: 'error',
    productionSourceMap: false,
    chainWebpack: config => {
        config.plugins.delete('progress');  // 打包进度，不想看
        config.plugins.delete('prefetch');
        config.plugins.delete('preload');
    },
    configureWebpack: config => {
        if (process.env.NODE_ENV === 'development') // 开发调试需要 source-map
            config.devtool = 'source-map';
        config.optimization = {
            minimize: process.env.NODE_ENV === 'production', // 生产环境开启压缩
            minimizer: [new UglifyPlugin({
                uglifyOptions: {
                    warnings: false,
                    compress: {
                        drop_console: true,
                        drop_debugger: false,
                        pure_funcs: ['console.log']  // 过滤掉 console.log
                    },
                    sourceMap: false,
                    parallel: true
                }
            })],
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: `vendor`,
                        priority: 10,
                        chunks: 'all'
                    }
                }
            }
        };
    },
    css: {
        extract: true,
        sourceMap: false,
        loaderOptions: {
            scss: {
                prependData: `@import "./src/styles.scss";`
            }
        },
        modules: false
    },
    parallel: require('os').cpus().length > 1,
    pwa: {},
    devServer: { // 开发服务器配置
        host: '127.0.0.1',
        port: 80,
        https: false,
        hot: true,
        hotOnly: false,
        proxy: JSON.stringify(proxy) === '{}' ? null : proxy,
        before: router,
        overlay: {
            warnings: true,
            errors: true
        },
        open: true
    },
    pluginOptions: {}
};
```

### 代理配置

　　开发服务器代理配置，可用于本地联调

　　[devServer代理配置](https://www.webpackjs.com/configuration/dev-server/#devserver-proxy)

　　[http-proxy-middleware用法](https://github.com/chimurai/http-proxy-middleware)

```javascript
// proxy.config.js
module.exports = {
    '/user': {
        secure: false,
        target: 'http://192.168.1.191:8080',
        logLevel: 'debug'
    }
};
```

### 使用 devServer 作 mock server

　　前端开发与自测时经常需要用到模拟数据或者假数据，可以用 mock.js 但是在 dev-tools 里看不到请求，还可以直接用 devServer 当 mock server。devServer 中的 before 配置类似自定义中间件，可以用来实现 mock server。

```javascript
// router.config.js
const bodyParser = require('body-parser');

module.exports = app => {
    const parseJson = bodyParser.json({type:'application/json'});

    // 解决部分post请求content length出错问题
    app.use((req, res, next) => {
        req.getBody = () => {
            return new Promise(resolve => {
                parseJson(req, res, error => {
                    resolve(req.body);
                });
            });
        };
        next();
    });

    app.use(bodyParser.urlencoded({extended: false}));

    app.use('/mock', require('./mock'));
};
```
　　上面的 mock 是项目根目录下的一个目录，里面存放假数据以及实现接口处理的 index.js，这里就不展开了。当某个接口要用到模拟数据进行测试时，只需要给接口 url 加上 `/mock` 前缀就好了。