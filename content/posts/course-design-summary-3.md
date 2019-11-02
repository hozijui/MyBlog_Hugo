---
date: 2018-11-27T18:00:00
title: "综合课设Ⅲ 总结"
description: "　　基于S3C2440平台的基本嵌入式课程设计第三期总结，主要任务是完善和增强嵌入式Linux的网络服务程序功能，以及配置和制作嵌入式Linux操作系统和文件系统的镜像文件。"
categories: ["嵌入式"]
---

　　终于到了最后一次课设，基本任务前面都完成了。中期只做了一半，所以先对课设中期做的Web做下总结。

## 一、EzWeb

  课设Ⅱ随便撸了个Py来实现板子的网络控制，用的还是UDP。这次课设要求对其增强和完善，所以索性重写了一个Web服务，写报告还能凑字数😝

### 1.环境选择

  板子上只能用C和Python。Java移植是不可能移植的，这辈子不可能移植的，写Web C又~~不~~会写，只能用Python才能维持得了生活的样子，py标准模块都有，所以......(ಡωಡ)

### 2.前端

- 每次访问网页时都要请求获取当前LED亮灭状态，并据此初始化要显示的按键和LED状态
- 当点击某个开关按钮时，请求设置LED状态，并根据返回的json更改按钮和LED的状态
- 获取和设置LED状态的请求都采用POST方法，请求参数中用action指明操作类型（get或set），设置LED时用id指明要设置的LED编号
- 设置定时器，每2.5秒获取LED状态，确保多用户操作的同步。

```javascript
var stat = [0, 0, 0, 0];
var png = ["pic/off.png", "pic/on.png"];
var left = ["0", "20%"];

//设置显示的LED状态
function SetLed(status) {
        stat = status;
        for (var i = 0; i < 4; i++) {
            $(".point").eq(i).attr("src", png[stat[i]]);
            $('.slider').eq(i).css("left", left[stat[i]]);
        }
}

//获取板上LED状态，调用SetLed()
function GetLed() {
        $.post("Led.json", JSON.stringify({action: "get"}),
           function (data) {
               SetLed(data.status);
           }, "json");
}

//按钮按下时，发送请求，返回操作后的板上LED状态，调用SetLed()
function SwitchLed(i) {
       $.post("Led.json", JSON.stringify({action: "set", id: i}),
           function (data) {
               SetLed(data.status);
           }, "json");
}

$(function () {
       GetLed();
       setInterval(GetLed, 2500);
});
```

### 3.后端

- 服务器启动时对LED进行初始化（全灭）
- 对于GET请求，如果请求的文件存在，那么响应文件内容以及相应的Content-Type，否则404
- 对于POST请求，如果请求的是Led.json，解析json
    - 如果action=set，改变id对应的板上LED状态再返回所有LED状态
    - 如果action=get，直接返回所有LED状态
- 提供访问日志，详细记录客户端IP、访问时间、请求链接以及响应的HTTP状态码

```python
# -*- coding: UTF-8 -*-
import os
import json
import fcntl
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer

MIME = {'html': 'text/html',
        'js': 'application/javascript',
        'css': 'text/css',
        'png': 'jpeg/png',
        'json': 'application/json'
        }

class MyHandler(BaseHTTPRequestHandler):
	
        # 重写log_message，将访问日志写入access_log
        def log_message(self, format, *args):
            open("access_log", "a").write("%s - - [%s] %s\n" %
                                         (self.client_address[0],
                                          self.log_date_time_string(),
                                          format % args))

        # 处理http响应头
        def _set_headers(self):
            suffix = os.path.splitext(self.path)[-1][1:]
            self.send_response(200)
            self.send_header('Content-type', MIME[suffix])
            self.end_headers()

        # 处理URI
        def _set_path(self):
            if self.path.find('?') >= 0:
                self.path = self.path[:self.path.find('?')]
            if self.path == '/' or self.path == '/index':
                self.path = '/index.html'
            self.path = 'templates' + self.path

        # 处理GET请求
        def do_GET(self):
            try:
                self._set_path()
                f = open(self.path, "rb")
                self._set_headers()
                self.wfile.write(f.read())
                f.close()
            except IOError:
                self.send_error(404, 'Page Not Found')

        # 处理POST请求
        def do_POST(self):
            self._set_path()
            if self.path == 'templates/Led.json':
                # 获取参数
                self.data_string = self.rfile.read(int(self.headers['Content-Length']))
                # 解析JSON
                data = json.loads(self.data_string)
                self._set_headers()

                if data['action'] == 'set':
                    id = data['id']
                    fcntl.ioctl(fd, stat[id] ^ 1, id)
                    stat[id] = stat[id] ^ 1

                # 返回所有LED的状态
                self.wfile.write(json.dumps({'status': stat}))
            else:
                self.send_error(404, 'Page Not Found')


def run(server_class=HTTPServer, handler_class=MyHandler, port=8080):
        server_address = ('', port)
        httpd = server_class(server_address, handler_class)
        print 'Starting httpd...'
        httpd.serve_forever()


if __name__ == "__main__":
        from sys import argv

stat = [0, 0, 0, 0]
# 初始化板上LED
print 'Initializing LED Device...',
fd = open("/dev/myleds", "r")
for i in range(4):
        fcntl.ioctl(fd, stat[i], i)
print 'OK'

if len(argv) == 2:
        run(port=int(argv[1]))
else:
        run()
```


### 4.存在的问题
  LED属于系统临界资源，当多个客户同时访问并控制LED时，需要互斥访问。现在的解决方案是，定期询问并更新页面显示的LED状态。该方案存在的主要缺陷有：LED状态同步存在较大时延；频繁的发送请求，当客户连接增多时，服务器载荷会大大增加；没有实现互斥访问，多个客户端同时控制LED会产生冲突。

　　可以考虑的改进方案是在Web后端使用互斥锁。当前端发送控制某一LED的请求时，后端检查该LED的互斥锁状态。如果互斥量被释放，那么改变LED状态并返回控制结果；如果互斥量已被加锁，则返回该LED正在被访问的信息，告知用户请稍后再试，或间隔一定时间后由前端重发请求。

## 二、ssh反向代理

  课设中期还做了用ssh反向代理做端口转发。板子在校园网内，没有公网IP，要实现外网访问，就要做端口转发。首先在板子上执行如下命令。其中```-N```为不执行远程命令，```-R```表示远程转发。其作用是ssh主动连接到外网服务器，并且所有通过服务器8090端口的数据都通过ssh转发到板子的8080端口。

```bash
ssh -N -R 8090:127.0.0.1:8080 root@服务器公网ip
```

  然后在外网服务器上用Nginx设置代理转发。新建一个vhost配置文件s3c2440.conf，配置内容如下。其作用是让Nginx监听8000端口，并设置代理转发，所有通过该端口的数据将被转发至服务器的8090端口。配置完成后重启Nginx。

```c
server{
        listen 8000;
        location / {
           proxy_pass http://127.0.0.1:8090;
        }
        access_log off;
}
```

  设置完成后，所有对服务器8000端口的访问就相当于对板子上8080端口的访问了。

## 三、文件系统映像

#### 未完待续......

## 四、参考

- [BaseHTTPServer — Python 2.7.15 Documentation](https://docs.python.org/2/library/basehttpserver.html)