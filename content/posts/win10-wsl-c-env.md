---
date: 2018-11-04
title: "Win10下搭建Linux C/C++开发环境"
description: "　　最近换了笔记本的散热风扇，然而在坑爹的Ubuntu下风扇完全不工作，估计是ACPI的问题，暂时无法解决，有段时间不能用Linux了。但是这学期的嵌网编程和综合课设都需要用到Linux，为了解决这个问题（至少能够进行Linux C/C++开发），试试在Win10下搭建一个精简的Linux环境。主要用到的是WSL（Windows Subsystem for Linux）和CLion。"
categories: ["杂记"]
---

  最近换了笔记本的散热风扇，然而在坑爹的Ubuntu下风扇完全不工作，估计是ACPI的问题，暂时无法解决，有段时间不能用Linux了。但是这学期的嵌网编程和综合课设都需要用到Linux，为了解决这个问题（至少能够进行Linux C/C++开发），试试在Win10下搭建一个精简的Linux环境。主要用到的是WSL（Windows Subsystem for Linux）和CLion。

## 一、可行方案

百度了一下，大概有两种比较简单的可行方案

1. 虚拟机，完整的Linux，但是太臃肿。

2. CLion配合WSL（Windows Subsystem for Linux）环境。WSL比虚拟机精简，能够满足普通开发，而且我已经有一个Kali的WSL做渗透，搭建更简单。Jetbrains家的IDE使用体验也不错。VS2017也有差不多的Linux C++开发工具集，但本人一直对VS没什么好感，详情请见[官方](https://blogs.msdn.microsoft.com/vcblog/2016/03/30/visual-c-for-linux-development/)。

## 二、安装WSL

我已经装有Kali的WSL，这里还是给出安装教程。

　　1.安装前确保WSL功能已开启：管理员运行PowerShell并运行以下命令，然后重启系统。

```bash
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
```

　　2.在Microsoft Store中选择需要的发行版进行安装，可安装的发行版有Ubuntu、OpenSUSE、SLES、Kali和Debian。还可以使用脚本安装，详情见[这里](https://docs.microsoft.com/zh-cn/windows/wsl/install-manual)。

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/win10-wsl-c-env/store.png)

　　3.WSL中Windows文件系统挂载在/mnt中，如C盘路径为/mnt/c。

　　4.安装完成后开始菜单中会有相应图标，点击即可打开终端，或者通过运行wsl、bash、发行版名称启动终端。第一次进入终端需要进行用户设置，这里就不给出了。

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/win10-wsl-c-env/menu.png)

　　5.如果安装多个发行版，可以使用命令`wslconfig`对WSL进行设置和卸载等操作。

## 三、安装及配置CLion

　　1.安装包官网上下，可以用教育邮箱开[学生免费授权](https://www.jetbrains.com/zh/student/)，不方便或者嫌麻烦可以上万能的淘宝。安装完打开登陆，疯狂下一步。

　　2.配置WSL工具链

- 配置前需要在WSL进行相关环境的搭建，CLion官方提供了一个脚本，可以直接通过下面的命令下载并执行脚本。

```bash
wget https://raw.githubusercontent.com/JetBrains/clion-wsl/master/ubuntu_setup_env.sh && bash ubuntu_setup_env.sh
```

- 脚本的主要内容是安装cmake、gcc、gdb、openssh等并设置ssh端口和自启，自己做也行。脚本执行完可以用Xshell或者ssh命令测试一下ssh连接。
- WSL环境搭建好后，进入CLion设置Toolchains，如下图所示。注意设置时WSL终端需要一直打开以便CLion通过ssh连接并检测环境。

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/win10-wsl-c-env/config.png)

　　3.至此Win10下的Linux C/C++环境就搭建完成。但是还有一个问题，每次打开CLion时都无法build，这是因为WSL没有开启，CLion无法使用WSL内的环境。解决办法有两个，一是在CLion里开一个Terminal再build；二是写一个启动bash.exe的脚本，然后在计划任务中添加脚本自启任务。

　　4.如果需要使用其他开发环境（如嵌入式开发的交叉编译环境），可以在WSL中搭好环境后，再在CLion中设置相应工具位置。

## More

https://docs.microsoft.com/zh-cn/windows/wsl/about

https://www.jetbrains.com/help/clion/how-to-use-wsl-development-environment-in-clion.html