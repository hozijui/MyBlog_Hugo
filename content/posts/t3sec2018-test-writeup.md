---
date: 2018-03-16
title: "2018铁人三项报名测评WriteUp"
categories: ["WriteUp"]
---

### 1.http://ctf4.shiyanbar.com/web/root/index.php

　　上来就看源码，发现注释有password.txt，提示的很明显

　　下载字典，burp爆破，得密码Nsf0cuS

　　密码输入限制了maxlength，F12改之

　　登陆后显示flag不在这里

　　查看headers，发现Cookie中有个newpage，疑似base64

![](/images/t3sec2018-test-writeup/1.png)

　　解码后是一个php文件名，访问之

![](/images/t3sec2018-test-writeup/2.png)

　　要求以管理员身份留言，抓个包

　　Cookie中有IsLogin，Post参数中有userlevel

![](/images/t3sec2018-test-writeup/3.png)

　　分别改成IsLogin=1，userlevel=root

　　成功，Cookie中发现flag `flag{C0ngratulati0n}`

![](/images/t3sec2018-test-writeup/4.png)

### 2.http://ctf4.shiyanbar.com/web/IOS/index.php

　　一看就是改User-Agent，注意iOS有特定的UA格式
```bash
Mozilla/5.0 (iPhone; CPU iPhone OS 99 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1
```

　　改UA后，在Response Headers中发现flag `flag{LMvBi8w9$m1TrgK4}`

![](/images/t3sec2018-test-writeup/5.png)

### 3.http://ctf4.shiyanbar.com/web/copy/index.php

![](/images/t3sec2018-test-writeup/6.png)

　　需求清晰，让服务器认为你是第1234567890个访问者，抓包

![](/images/t3sec2018-test-writeup/7.png)

　　又一个base64，解码后内容为`2699:0415740eaa4d9decbc8da001d3fd805f`

　　2699恰好是当前的访问人次，将2699改为1234567890，base64编码，改包

　　然而页面警告“Haking Attemp!”，怀疑冒号后面的32位字符串有验证作用，猜测是MD5

　　MD5解密后发现也是2699，问题解决

　　按需求进行MD5加密后，再base64编码，改包 `flag{T4mmL9GhpaKWunPE}`

![](/images/t3sec2018-test-writeup/8.png)

### 4.http://ctf4.shiyanbar.com/ste/gpg/john.tar.gz.gpg

　　GPG key: GhairfAvvewvukDetolicDer-OcNayd#

　　用GPG4win解密，得到一个pcap包

　　先用wireshark和科来分析了很久都找不到flag，有毒

　　然后猜测是图片隐写，用NetworkMiner提取复原包中的所有图片

　　用StegSolve测试，在logo.png中找到隐写的flag，有毒 `flag{J0hn_th3_Sn1ff3r}`

![](/images/t3sec2018-test-writeup/9.png)

### 5.http://ctf4.shiyanbar.com/misc/123/123.exe

　　尝试运行，“此应用无法运行”

　　binwalk一下，仍然没有东西

　　用winhex查看，发现是base64编码的png图片

![](/images/t3sec2018-test-writeup/10.png)

　　百度在线解码，得到一个二维码

![](/images/t3sec2018-test-writeup/11.png)

　　微信扫一扫，得flag `flag{you are beautiful}`

### 6.http://ctf4.shiyanbar.com/re/shellcode/shellcode.txt

　　改成html文件，将内容alert出来，发现又是base64（出题人真的很喜欢base64），解码得flag

![](/images/t3sec2018-test-writeup/12.png)

`flag{SHEllcode_IS_so_Cool}`