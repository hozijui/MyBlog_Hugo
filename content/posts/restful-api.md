---
date: 2019-03-16
title: "什么是RESTful API"
description: "　　REST是Roy Thomas Fielding提出的对互联网软件的架构原则，REST全称是Representational State Transfer，即表现层状态转移。如果一个架构符合REST原则，就称它为RESTful架构，RESTful API就是符合REST原则而设计的接口。REST的主要原则有:网络上的所有事物都被抽象为资源;每个资源都有一个唯一的资源标识符;同一个资源具有多种表现形式;对资源的各种操作不会改变资源标识符;所有的操作都是无状态的......"
categories: ["Web"]
---

## 一、REST和RESTful

　　REST是Roy Thomas Fielding提出的对互联网软件的架构原则，REST全称是Representational State Transfer，即表现层状态转移。如果一个架构符合REST原则，就称它为RESTful架构。


　　RESTful架构的具体特征如下：

- 资源

　　资源指的是网络上的具体信息，资源可以是一段文字、一张图片、一首歌，每个资源对应一个特定的URI，并可以通过访问URI获取相应到资源。

- 表现层

　　即资源的具体表现形式，比如一段文字可以用HTML、JSON等格式表现。客户端和服务器间通过传递资源的表现层进行交互。

- 状态转移

　　由于HTTP是无状态协议，所以状态都保存在服务器端。在客户端与服务器交互的过程中，一定涉及资源和状态的变化，这就需要让服务器端发生状态转移。具体到HTTP中就是GET / POST / PUT / DELETE，分别对应获取资源、创建资源、更新资源以及删除资源。

## 二、RESTful API Best Practices

### 1.URL的设计

- 动宾结构

　　RESTful 的核心思想就是，客户端发出的请求都是动宾结构。动词就是HTTP方法，宾语就是资源URI

- 名词和复数

　　宾语必须是名词，是动词（HTTP方法）的作用对象，不能是动词。名词也有单复数的区别，一般建议使用复数URL

- 避免多级URL

　　资源的多级分类容易导致多级URL，可以使用查询字符串表达除第一级外的其他级别

### 2.状态码

　　响应状态码必须精确，而HTTP状态码共有100多种，分为5类：

- 1xx：相关信息
- 2xx：操作成功
- 3xx：重定向
- 4xx：客户端错误
- 5xx：服务器错误

　　HTTP状态码覆盖了绝大部分可能的情况，而每一个状态码都有标准解释，客户端可以只通过状态码就知道服务器发生了什么。常用的状态码及其具体含义自行百度。

### 3.服务器响应

- 服务器返回的数据格式应JSON对象而不是纯文本，以提供结构化的数据。因此HTTP响应头要设置` Content-Type: application/json`，而请求头则要有`Accept: application/json`
- 发生错误时，应使用相应状态码反映错误类型，而不应该使用200状态码再把错误信息放入响应报文中
- HATEOAS (Hypermedia as the engine of application state) 约束

　　简单来说，就是提供一个链接让API使用者知道URL的设计，比如[api.github.com](http://api.github.com)。