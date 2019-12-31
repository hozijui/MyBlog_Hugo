---
title: "Weekly Report"
---

<script type="text/javascript" src="/js/echarts.min.js"></script>

<div style="text-align: right;font-size: 24px;margin-top: -2.8em">
周 报
</div>

<div style="text-align: right;font-size: 20px;margin: 1.5em 0;font-style: italic">
    Last Updated：2019-12-25 14:35
</div>

## 近一周 Code::Stats

<div id="code_stats" style="width: 100%; height: 360px"></div>
<script type="text/javascript" src="/js/myCharts.js"></script>
<script type="text/javascript" src="/js/collapsible.js"></script>

## 2019-12-23 至 2019-12-29
### 本周完成或进展

- 建筑行业爬虫项目
    - 完成对天津公共资源交易的爬取
    - NFS服务已搭建，但无法在 windows 环境下挂载使用

- 肿瘤智能编码系统
    - 编码结果导出 excel 改由前端实现

### 下周计划

- 建筑行业爬虫项目
    - 完成 NFS Pipeline 的开发
    - 对山东公共资源交易等其他站点的爬取

<br>

## 2019-12-16 至 2019-12-22
### 本周完成或进展

- 建筑行业爬虫项目
    - start_urls 格式改成 json
    - 添加文件与图片的下载，存储到 mongodb 中，在文章详情中以 url 作为外键关联
    - 完成对河北公共资源交易平台的爬取

### 下周计划

- 建筑行业爬虫项目
    - Mongodb 存储的数据库名改在 item 中指定
    - 甲方考虑到成本问题，文件与图片的存储改为 NFS
    - 继续爬取其他站点

<br>

## 2019-12-09 至 2019-12-15
### 本周完成或进展

- 建筑行业爬虫项目
    - 改为单个 spider，在 parse 中对初始请求进行路由
    - start_urls 改用 zset，并将子请求的优先级与初始请求的优先级关联
    - 代理中间件配置改到 settings 中
    - 远程仓库迁移到 gogs

### 下周计划

- 建筑行业爬虫项目
    - start_urls 格式改成 json，以便初始请求携带参数
    - 添加文件、图片的下载与存储
    - 阿里云数据库测试，完善全国公共资源的爬取，简单部署测试

<br>

## 2019-12-02 至 2019-12-08
### 本周完成或进展

- 建筑行业爬虫项目
    - 添加 BasicItem 基类
    - MongoDB Pipeline 连接鉴权、去重与更新
    - 全国建筑市场爬取（监管动态、政策法规）

### 下周计划

- 建筑行业爬虫项目
    - 改为单个 spider
    - start_urls 改为优先级队列，请求优先级与域名优先级关联
    - 代理中间件
    - git 远程仓库迁移到自建 gogs

<br>

## 2019-11-25 至 2019-12-01
### 本周完成或进展

- 建筑行业爬虫项目搭建
    - 开发环境搭建
    - 全国公共资源交易平台爬取（除了交易公开）

### 下周计划

- 建筑行业爬虫项目
    - MongoDB 连接鉴权
    - Item 调整，Pipeline 根据内容去重与更新
    - 全国建筑市场爬取

<br>

## 2019-11-18 至 2019-11-24
### 本周完成或进展

- 本周摸鱼，项目都没写
- 周报页面加了近一周 Code::Stats 图表
- 老子科目二过了哈哈哈哈哈


### 下周计划

- 建筑行业爬虫：项目搭建、基本架构


<br>

## 2019-11-11 至 2019-11-17
### 本周完成或进展

- 学习使用 Spring Boot 搭建 Web 项目，集成了 Spring Session 和 Mybatis，写了个肿瘤编码系统用户管理接口的demo
- 学习 Drools 基本语法并集成到 Spring Boot 项目中
- 学习掌握 Scrapy 基本架构与基本用法

### 下周计划

- 肿瘤智能编码系统：协助参与后端开发
- 建筑行业爬虫项目：部级网页爬虫开发


<br>

## 2019-11-04 至 2019-11-10
### 本周完成或进展

- 网页编程基础：完成实验报告并提交
- 肿瘤智能编码系统：登录接口调通

### 下周计划

- 学习 SpringBoot + Drools
- 学习 Scrapy


<br>

## 2019-10-28 至 2019-11-03
### 本周完成或进展

- 网页编程基础：报告没写
- 肿瘤只能编码系统：联调待定
- 建筑行业爬虫项目：初期可行性分析
- 完成博文 [使用 Hugo 生成静态博客](/2019/myblog-hugo)
- 使用 Caddy 自动部署博客，参考 [使用 Caddy 和 Github 实现博客的自动部署](/2019/caddy-auto-deployment)

### 下周计划

- 完成并提交网页编程基础实验报告
- 待定


<br>

## 2019-10-21 至 2019-10-27
### 本周完成

- 肿瘤智能编码系统前端开发
  - 编码结果页面样式调整
  - 添加全平台 favicon
  - 添加登录界面以及用户状态管理
  - IE 11兼容
- 恢复误删的静态博客，重新魔改主题

### 下周计划

- 完成网页编程基础实验报告
- 肿瘤智能编码系统联调
- 恢复博客文章，写一篇 Hugo 生成静态博客的文章
