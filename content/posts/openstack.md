---
date: 2019-10-08T18:00:00
title: "OpenStack基础"
description: "　　OpenStack is a cloud operating system that controls large pools of compute, storage, and networking resources throughout a datacenter, all managed through a dashboard that gives administrators control while empowering their users to provision resources through a web interface."
categories: ["云和虚拟化"]
---

## OpenStack

　　OpenStack is a cloud operating system that controls large pools of compute, storage, and networking resources throughout a datacenter, all managed through a dashboard that gives administrators control while empowering their users to provision resources through a web interface.（IaaS云操作系统）

- [OpenStack Documentation](https://docs.openstack.org)
- [API Documentation](https://developer.openstack.org/api-guide/quick-start/index.html)

### 架构

![](/images/openstack/openstack_kilo_conceptual_arch.png)

#### 核心服务

- Nova：管理VM生命周期
- Neutron：提供网络连接服务，管理网络资源
- Glance：管理VM启动镜像
- Cinder：为VM提供块存储服务
- Swift：为VM提供对象存储服务
- Keystone：提供认证和权限管理服务
- Horizon：Dashboard，Web操作界面

#### 分布式系统

- 控制节点：运行 Keystone、Glance、Horizon 以及 Nova 和 Neutron 中管理相关的组件，还运行支持 OpenStack 的服务，例如数据库、消息队列和网络时间服务
- 网络节点：运行 Neutron
- 存储节点：运行 Cinder、Swift
- 计算节点：运行 Hypervisor，同时运行 Neutron 服务的 agent，为虚拟机提供网络支持

![](/images/openstack/openstack_arch_kilo_logical_v1.png)

### OpenStack 通用设计思路

- API 前端服务
  - 对外提供统一接口，隐藏实现细节
  - RESTful，便于与第三方系统集成
  - 可以通过运行多个 API 服务实例实现 API 的高可用
- Scheduler 调度服务：分配任务，负责从实体中挑选出合适的来执行任务。当客户请求量太大，无法及时调度时，可以增加 Scheduler
- Worker 工作服务：执行任务。当计算资源不足时可以增加 Worker
- Driver 框架：OpenStack 基于 Driver 实现对多种底层技术的适配，我们只用关心对资源的使用，而不用关心如何对资源的虚拟化 。这也是 OpenStack 开放性的体现。
- Messaging 服务：API 通过 Messaging 间接调用，是异步调用
  - 解耦各个子服务
  - 提高性能，提高系统吞吐量
  - 提高伸缩性，子服务可以按需扩展
- Database：各组件有自己的数据库维护自身状态信息

### Keystone

- User：使用 OpenStack 的实体。
- Credentials：User 用来证明自己身份的信息，可以是用户名/密码、Token、API Key 或其他高级方式。
- Authentication：Keystone 验证 User 身份的过程。User 访问 OpenStack 时向 Keystone 提交用户名和密码形式的 Credential，Keystone 验证通过后会给 User 签发一个 Token 作为后续访问的 Credential。Token 用作访问 Service 的 Credential，Service 会通过 Keystone 验证 Token 的有效性，默认有效期为24小时。
- Project/Tenant：租户，用于将 OpenStack 的资源进行分组和隔离；资源所有权属于租户，不属于 User；每个 User 必须挂在租户里才能访问该租户的资源，一个 User 可以属于多个租户。
- Role：角色，用于鉴权和控制访问。
- Service：包括 Compute、Block Storage、Object Storage、Image Service、Networking Service 等。每个 Service 都会提供若干个 Endpoint，User 通过 Endpoint 访问资源和执行操作。
- Endpoint：可访问的网络地址，Service 通过 Endpoint 暴露自己的 API。
- 日志：包括 keystone.log 和 keystone_access.log，可以通过 screen 查看。

### Glance

- Image： 一个模板，里面包含了基本的操作系统和其他的软件。
- Image Service：管理 Image，让用户能够发现、获取和保存 Image。
  - 提供 RESTful API 让用户能够查询和获取image的元数据和 image本身
  - 支持多种方式存储 image，包括普通的文件系统、Swift、Amazon S3 等
  - 对 Instance 执行 Snapshot 创建新的 image
- glance-api
  - 如果操作与 image 元数据相关，请求由 glance-registry 处理
  - 如果操作与 image 自身存取相关，请求由该 image 的 store backend 处理
- glance-registry：负责处理和存取 image 的 metadata（元数据），metadata 会保存到数据库中。
- store backend：image 并不存储在 Glance，而是存放在 backend 中，Glance 支持多种 backend，可在 /etc/glance/glance-api.conf 中配置
- 日志：glance_api.log 和 glance_registry.log

### Nova

#### 组件

- nova-api：接收和响应客户的 API 调用

  - 检查传入参数合法性
  - 调用其他子服务的处理客户端 HTTP 请求
  - 格式化其他子服务返回结果并返回

- nova-secheduler：虚机调度服务，决定虚机在哪个计算节点上运行。默认使用 Filter Secheduler 调度器

  1. 通过过滤器选择满足的计算节点。

  2. 计算各计算节点的权重，在权重最大的计算节点上新建虚机实例。默认根据空闲内存计算权重。

- Hypervisor：虚拟化管理程序

- nova-compute：管理虚机核心服务，通过 Hypervisor API 进行虚机生命周期管理

- nova-conductor：专门进行数据库操作，将 nova-compute 与数据库解耦。主要出于以下考虑

  - 安全性：如果 nova-compute 直接访问数据库，计算节点上就要配置数据库连接信息，当计算节点遭到入侵，位于控制节点的数据库将面临极大的安全风险
  - 伸缩性：与 nova-compute 通过消息队列交互，这样就允许配置多个 conductor 实例，就可以通过增加 conductor 的数量来应对对数据库访问量的增长

- Database：名为 nova 的数据库

- 消息队列：Nova 的众多子服务间需要相互协调和通信，为解耦各个子服务，Nova 通过消息队列作为子服务的信息中转站，各子服务间通过消息队列联系。OpenStack 默认使用 RabbitMQ。

- nova-console：一个 console 代理，用于设置访问虚机 console 的方式。

- nova-consoleauth：为 nova-console 提供认证。

- nova-cert：提供 x509 证书服务，用于为 euca-bundle-image 生成证书，仅适用于 EC2 API。

#### 操作

![](/images/openstack/instance_management.png)

- Launch：部署instance

  - 为 instance 准备资源：根据 flavor 为 instance 分配 vCPU、内存、磁盘和网络资源

  - 创建 instance 的镜像文件：将Glance管理的 image 下载到计算节点（如果下载过就跳过），将其作为 backing file 创建 instance 的镜像文件

  - 创建 instance 的 XML 文件

  - 创建虚拟网络设备并启动虚机

- Shut Off：关闭正在运行的 instance

- Start：启动 instance

- Terminate：删除 instance

- Pause/Unpause：短时间暂停。Pause 将 instance 的状态保存到宿主机的**内存**中，状态变更为 Paused；Unpause 从内存中读取 instance 的状态，继续运行

- Suspend/Resume：长时间暂停。Suspend 将 instance 的状态保存到宿主机的**磁盘**上，状态变更为 Shut Down；Resume 从磁盘中读取 instance 的状态，继续运行

- Reboot：分为 soft reboot 和 hard reboot，前者是重启操作系统，后者是重启 instance，相当于关机后再开机

- Lock/Unlock：为避免误操作，可以对 instance 加锁，被加锁的 instance 执行重启等改变状态的操作会提示不允许，Unlock 为解锁（admin角色的用户不受 lock 影响，默认配置任何用户都可以unlock）

- Rescue/Unrescue：instance 故障恢复。用指定的 image 作为启动盘引导 instance，将 instance 本身的系统盘作为第二磁盘挂载到操作系统上，类似于Win PE；修复完成后使用 Unrescue 从原启动盘重新引导 instance

- Snapshot/Rebuild：Snapshot 创建备备份，对 instance 的镜像文件进行全量备份，生成一个 snapshot 类型的 image，并保存到 Glance 上；Rebuild 通过 snapshot 回复 instance，用 snapshot 替换 instance 当前镜像文件，同时保持 instance 其他资源分配属性不变

- Shelve/Unshelve：instance 被 suspend 后，Hypervisor 依然为其预留了资源，shelve 操作可以释放这些资源，shelve 会将 instance 作为 image 保存到 Glance 中，然后删除该 instance；unshelve 操作通过之前保存的 image 部署一个新的 instance，由于是重新部署，所以新的 instance 可能运行在与之前不同的计算节点上，但其他属性不会改变

- Migrate：将 instance 迁移到其他计算节点上，需要先关闭 instance，冷迁移 

- Resize：通过选择新的 flavor 来调整 instance 的 vCPU、内存和磁盘资源，需要scheduler重新选择计算节点，如果选择的节点不是当前节点则需要migrate

- Live Migrate：热迁移，源和目标节点 CPU 类型、Libvirt 版本要一致，要能够互相识别对方主机名，要指明迁移使用的 TCP 协议，且 Libvirt TCP 远程监听服务要打开；根据源和目标节点有无共享存储可以分为两类

  - 无共享存储：Block Migrate， 需要将镜像文件从源节点传到目标节点
  - 有共享存储：镜像文件不需要迁移，只需将 instance 的状态迁移到目标节点

- Evacuate：当一个计算节点无法工作时，将节点上的 instance 迁移到其他节点上，前提是 instance 的镜像文件必须放在共享存储上

### Neutron

<br>

### Cinder

<br>

### OpenStack CLI

​	每个 OpenStack 服务都有自己的 CLI，命令就是服务名称，但 keystone 除外，keystone 命令为 openstack。一般的，使用方式如下：

- 执行命令前，需要设置环境变量（包括用户名、租户、密码等），或者由命令行参数指定
- 各个服务的命令都有增删查改操作
  - CMD　\<obj\>-create　parm1　parm2 ...
  - CMD　\<obj\>-delete　parm
  - CMD　\<obj\>-update　parm1　parm2 ...
  - CMD　\<obj\>-list
  - CMD　\<obj\>-show　parm
- 每个对象都有 id
- 使用 help 查看命令用法
