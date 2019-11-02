---
date: 2019-10-28
title: "使用 Hugo 生成静态博客"
description: "　　Hugo 是由 Go 语言实现的静态网站生成器。简单、易用、高效、易扩展、快速部署。Hugo 生成静态页面的效率很高，而且自带热重载模式，可以在修改 MarkDown 文章后更新生成的页面，能极大的提高博客书写效率。本站就是使用 Hugo 生成的静态博客......"
categories: ["Web"]
---

　　之前博客用的是 WordPress，最近觉得动态博客太占服务器资源了，想改用静态博客试试。静态博客框架有许多，常见的有 Jekyll、Hexo 以及 Hugo等。Hugo 是由 Go 语言实现的静态网站生成器。简单、易用、高效、易扩展、快速部署。Hugo 生成静态页面的效率很高，而且自带热重载模式，可以在修改 MarkDown 文章后更新生成的页面，能极大的提高博客书写效率。本站就是使用 Hugo 生成的静态博客。

　　本篇文章主要写写如何安装和使用 Hugo 来生成静态博客，以及我对 Hugo 主题的魔改。

## 一、安装 Hugo

　　推荐二进制安装，我是在本地 WSL 环境下装的，所以用的 deb 包。

```bash
wget https://github.com/gohugoio/hugo/releases/download/v0.58.3/hugo_0.58.3_Linux-64bit.deb
sudo dpkg -i hugo_0.58.3_Linux-64bit.deb
hugo version
```

## 二、使用 Hugo 生成静态页面

### 1.新建站点

　　使用以下命令新建 Hugo 站点。执行该命令会生成 `MyBlog` 文件夹。

```bash
hugo new site MyBlog
```

### 2.添加主题

　　可以在 [themes.gohubo.io](https://themes.gohugo.io/) 上挑一个自己喜欢的主题，我用的是 [LeaveIt](https://github.com/liuzc/LeaveIt) 主题。进入 `Myblog` 文件夹，用以下命令下载安装主题。

```bash
git init
git submodule add https://github.com/liuzc/LeaveIt.git
```

　　在 `config.toml` 中添加主题设置

```bash
echo 'theme = "LeaveIt"' >> config.toml
```

### 3.主题设置

　　参考 Hugo 文档和主题文档编辑配置文件，下面是我的配置文件

```toml
baseURL = "/"
languageCode = "en-us"
title = "Ho_Zijui's B10g"
theme = "LeaveIt"

paginate = 10
enableEmoji = true

[Permalinks]
  posts = "/:year/:filename/"

[menu]
  [[menu.main]]
    name = "Weekly Report"
    url = "/report/"
    weight = 1

  [[menu.main]]
    name = "Blog"
    url = "/posts/"
    weight = 2

  [[menu.main]]
    name = "Categories"
    url = "/categories/"
    weight = 3

  [[menu.main]]
    name = "Tags"
    url = "/tags/"
    weight = 4

  [[menu.main]]
    name = "About"
    url = "/about/"
    weight = 5 

[params]
    since = 2017
    author = "Ho_Zijui"
    avatar = "/images/me/panda.jpg"
    subtitle = "I am a programmer, I write code"
    home_mode = "post" # 首页展示博文

[params.social]
    GitHub = "hozijui"
    Email = "hozijui@foxmail.com"
    WeChat = "/images/me/wechat_qrcode.png"
```

### 4.添加文章

　　文章用 Markdown 写，放在 content 文件夹下，根据自己的菜单配置组织文件目录结构。文章前面可以通过以下方式指明标题、时间、类别、标签以及模板中可能用到的变量值。

```markdown
---
date: 2019-10-01T16:00:00
title: "This it title"
description: "This is description"
categories: ["Blog"]
tags: ["Blog"]
draft: true
---
```

　　图片等静态资源可以放在 static 目录中，在文章中引用图片的地址以 static 目录为根目录，例如图片 example.png 放在 static 下的 images 目录中，那么 Markdown 中引用该图片的地址就是 /images/example.png

### 5.启动服务查看生成的静态站点

　　在 MyBlog 文件夹下运行以下命令，该命令会构建站点并启动一个服务器，该服务器会监视 MyBlog 文件夹下的所有文件改动，并自动重新生成页面。其中 `-D` 表示构建的内容包括标记为草稿（draft）的内容。

```bash
hugo server -D
```

　　在浏览器中访问 127.0.0.1:1313 就可以看到生成的静态站点了。

## 三、魔改主题

　　不同主题有不同的模板结构，魔改都是以我用的主题为例。

### 1.添加 MathJax 支持

　　在 themes/LeaveIt/layouts/partials/js.html 中添加以下代码段即可

```html
<script type="text/x-mathjax-config">
    MathJax.Hub.Config({
        tex2jax: {
            inlineMath: [['$','$'], ['\\(','\\)']],
            displayMath: [['$$','$$'], ['\[','\]']],
            processEscapes: true,
            processEnvironments: true,
            skipTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
            TeX: {
                equationNumbers: { autoNumber: "AMS" },
                extensions: ["AMSmath.js", "AMSsymbols.js"]
            }
        }
    });
</script>
<script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML"></script>
```

### 2.修改页面结构和样式

#### 站点首页

　　我想在博客首页同时显示个人信息和最近的几篇博文，虽然主题文档里说支持这种模式，但是有 Bug，样式也有点错乱，估计是没有做对新版本 Hugo 的兼容。在首页内容上，我要改的主要有：

- 文章的摘要或描述可以由我自己写，而不是直接显示博文内容

- 首页文章列表只显示最近 5 篇博文

- 分页改为 More，点击后进入博文目录

　　针对以上几点，要改的文件是 themes/LeaveIt/layouts/partials/home_post.html

```html
<div class="post-warp">
    ......
    <!-- 只显示最近的 5 篇博文 -->
    {{ range first 5 (.Site.RegularPages) }}
        <article class="post" itemscope itemscope="" itemtype="http://schema.org/Article">
            <header class="post-header">
                <h1 class="post-title" itemprop="name headline"><a href="{{ .Permalink }}">{{ .Title }}</a></h1>
            </header>
            <div class="post-content">
                ......
                <!-- 文章概要或描述，由 Markdown 中的 description 指定 -->
                {{ .Description }}
            </div>
            ......
        </article>
    {{ end }}

    <!-- {{ partial "paginator.html" . }} -->
    <!-- More按钮，点击进入博文目录，样式与分页保持统一 -->
    <ul class="pagination" style="padding: 0 0 20px 0">
        <li class="page-item"><a href="/posts/" style="font-size: 24px">More</a></li>
    </ul>
</div>
```

　　自定义样式我写在 css.html 里了，下同。虽然主题文档说了自定义样式应该写在 assets/css/_custom.scss 中，我尝试了但不知道为什么并没有被 import 进 main.scss 中。

```scss
// 解决个人信息位置错乱
.intro {
  transform: translateY(0px);
  margin-bottom: 50px;
}

// 文章列表项底边
article.post {
    margin-bottom: 80px;
    border-bottom: #ccc 1.5px dashed;
}

.post-warp .post-content {
    padding-top: 0.8rem;
}
```

#### About页面

　　将主题本身做好的个人信息（头像、github、邮箱和微信等）放到 About 页面中。要改的文件是 themes/LeaveIt/layouts/page/single.html。参考 home_profile.html 进行修改。

```html
......
<div class="post-content">
   <!-- 是 About 页面时添加以下内容 -->
    {{ if eq .Title "- About -" }}
        <div class="intro">
            {{ $cdn_url := .Scratch.Get "cdn_url" }}
            {{ with .Site.Params.avatar}}
            {{ $avatar := .}}
            <div class="avatar" style="margin-top: -50px">
                <img class="about" src="{{ (printf "%s%s" $cdn_url $avatar)}}"/>
            </div>
            {{ end }}
            {{ with .Site.Params.subtitle}}
            <h2 class="description" style="font-size: 16px;padding: 0.8em 0">
                {{ . }}
            </h2>
            {{ end }}
            <div class="social-links">
                {{ partial "social.html" . }}
            </div>
        </div>
        {{ partial "wechat.html" . }}
    {{ end }}
    {{ .Content }}
</div>
......
```

#### 其他

　　其他的修改主要是一些细节，比如取消页面失去焦点时会改 title、数学公式的样式、微信按钮的target属性等，翻翻主题代码改就行。

## 参考

- [Hugo Documentation](https://gohugo.io/documentation/)

- [LeaveIt: A simple, minimal, clean blog theme for hugo](https://github.com/liuzc/LeaveIt)

- [使用Hugo生成支持数学公式渲染的静态站](https://www.jianshu.com/p/5fd2c9b3b638)
