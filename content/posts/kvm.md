---
date: 2019-10-08T16:00:00
title: "KVM虚拟化基础"
description: "　　虚拟化是云计算的基础。简单的说，虚拟化使得在一台物理的服务器上可以跑多台虚拟机，虚拟机共享物理机的 CPU、内存、IO 硬件资源，但逻辑上虚拟机之间是相互隔离的。对硬件资源虚拟化、创造并运行虚拟机的程序叫Hypervisor。KVM全程Kernel-Based Virtual Machine，基于Linux内核实现的Hypervisor，属于Ⅱ型虚拟化。"
categories: ["云和虚拟化"]
---

## 虚拟化

　　虚拟化是云计算的基础。简单的说，虚拟化使得在一台物理的服务器上可以跑多台虚拟机，虚拟机共享物理机的 CPU、内存、IO 硬件资源，但逻辑上虚拟机之间是相互隔离的。

　　对硬件资源虚拟化、创造并运行虚拟机的程序叫Hypervisor，被Hypervisor用来运行虚拟机的物理机称为宿主机（Host），宿主机上运行的成为客户机（Guest）。根据Hypervisor的实现方式，虚拟化可以分为两种：

- Ⅰ型虚拟化：Hypervisor直接管理调用硬件资源，不需要底层操作系统，可以将Hypervisor看作一个很薄的操作系统。Xen和ESXi都属于这一类。
- Ⅱ 型虚拟化：Hypervisor运行在操作系统之上，构建出一整套虚拟硬件平台。KVM、VirtualBox和VMWare Workstation都属于这一类。

　　两者比较：Ⅰ型虚拟化性能上比 Ⅱ 型好，但 Ⅱ 型基于OS会更灵活

### KVM虚拟化基础

　　KVM全程Kernel-Based Virtual Machine，基于Linux内核实现。KVM提供的内核模块只关注虚拟机调度和内存管理两方面，IO的虚拟化需要交给Linux内核和Qemu。此外还需要Libvirt作为KVM的管理工具。

#### CPU虚拟化

- 一个虚机就是一个qemu-kvm进程
- 虚机中的一个vCPU就是进程中的一个线程
- CPU overcommit：vCPU总数可以超过物理CPU数量

#### 内存虚拟化

- 虚机中进程的虚拟内存地址（GVA）要转换为虚机的物理内存地址（GPA）
- 宿主机上qemu-kvm进程的虚拟内存地址（HVA）要转换为机器内存地址（HPA）

#### 存储虚拟化

　　存储池（Storage Pool）：一片存储空间，多种类型，由/etc/libvirt/storage下的xml文件定义。

　　卷（Volume）：在存储池中划出一块空间分配给虚拟机，就是虚拟机中的硬盘。

- 目录类型的Storage Pool
  - 将宿主机目录作为Storage Pool，目录下的文件就是Volume，一个文件就是一个Volume。
  - default.xml定义了默认目录为/var/lib/libvirt/images。
  - KVM支持多种Volume文件格式：raw、qcow2、vmdk等。
  - 使用文件做Volume的优点：方便存储、移植性好、可复制、可远程访问。
- LVM类型的Storage Pool
  - LVM（逻辑盘卷管理）是Linux下的磁盘管理机制，宿主机上一个Volume Group（卷组）就是一个Storage Pool，VG中的Logical Volume（逻辑卷组）就是作为Volume分配给虚拟机。
  - Logical Volume没有MBR引导记录，只能作为数据盘，不能作为启动盘。
  - Logical Volume性能较好，但管理和移动性不如镜像文件，不能远程使用。
- 其他类型的Storage Pool：KVM还支持iSCSI，Ceph等多种类型的Storage Pool



#### 网络虚拟化

- Linux 的 VLAN 设备实现隔离功能，Linux Bridge 实现交换功能。 将同一 VLAN 的子设备都挂载到一个 Bridge 上，设备之间就可以交换数据了。
- Linux Bridge 加 VLAN 在功能层面完整模拟现实世界里的二层交换机，物理网卡相当于虚拟交换机上的 trunk 口。



## 云平台服务分类

- IaaS：基础设施服务，提供虚拟机。例子：AWS、阿里云
- PaaS：平台服务，提供应用运行环境和中间件（比如数据库、消息队列等）。例子：Google App Engine、Heroku
- SaaS：应用服务，直接提供应用。例子：Google Gmail、Dropbox