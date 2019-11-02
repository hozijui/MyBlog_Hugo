---
date: 2017-12-16
title: "信息摘要算法及md5绕过"
categories: ["编码与密码技术"]
---

## 一、消息摘要函数

- 输入称为消息
- 输出称为消息摘要、指纹或散列值
- 能够快速计算出散列值
- 任意长度的消息计算出固定长度的散列值
- 单向性，即无法通过消息摘要计算得到消息
- 可用于一致性验证、口令加密、消息认证码、数字签名，还可以构造伪随机数生成器

## 二、MD5

　　MD5是现在web中广泛采用的消息摘要算法，常用于口令的加密和验证。在CTF中主要的攻击类型是php漏洞绕过。
### 弱类型比较漏洞

- 原理

　　php中有两种判等比较符，比较符`==` 和 恒等计算符`===`。`==`会先进行类型转换再进行值的比较，而`===`要同时比较类型和值。

　　php手册给出了`==`类型转换的规则：

1. 一个数值和一个字符串比较，将字符串转换为数值。

2. 如果该字符串没有包含 '.' ，'e' 或 'E' 并且其数字值在整型的范围之内，该字符串将被当成 integer 来取值。其它所有情况下都被作为 float 来取值。

3. 该字符串的开始部分决定了它的值。如果该字符串以合法的数值开始，则使用该数值。否则其值为 0。合法数值由可选的正负号，后面跟着一个或多个数字（可能有小数点），再跟着可选的指数部分。指数部分由 ‘e’ 或 ‘E’ 后面跟着一个或多个数字构成。

　　因此，我们可以利用上述类型转换规则，绕过利用"=="进行的MD5验证。

- 例子

　　[网络安全实验室-解密关-MD5真的能碰撞吗](http://lab1.xseclab.com/pentest5_6a204bd89f3c8348afd5c77c717a097a/)

　　题目给出php源码如下

```php
<?php
$flag=FLAG;
if(isset($_POST["password"])){
    $password=$_POST['password'];
    $rootadmin="!1793422703!";
    if($password==$rootadmin){
        die("Please do not attack admin account!");
    }
    if(md5($password)==md5($rootadmin)){
        echo $flag;
    }else{
        die("Password Error!");
    }
}
?>
```

　　已知rootadmin，要求password不能等于rootadmin，但两者的md5要相等，且已知字符串`!1793422703!`的md5为`0e332932043729729062996282883873`

　　由于使用的是`==`验证，rootadmin的md5会被转换为数值0，那么只需要构造md5开头为0e的字符串，如QNKCDZO等

### md5函数漏洞

- md5函数不能处理数组，当传入的参数为数组时，函数报错并返回null。
- sql中使用md5时，md5后的值转换成的字符串会作为sql语句的一部分，通过构造字符串，使得md5后转换的字符串中含有`'or'<trash>`，实现注入。例如`ffifdyop`。
- 例子：SWPU-CTF2017 Web1，phpscrew解密后发现源码中sql使用了md5函数。输入上述字符串即可成功登陆

```php
<?php
error_reporting(E_ALL^E_NOTICE^E_WARNING);
$link = mysqli_connect('localhost', 'root', '*******', '*******');
if($link) {
        $name=$_POST["logname"];
        $password=$_POST["logpass"];
        if(!isset($name)||!isset($password))//判断是否为空
        {
          exit();
        } else {
          if(empty($name)||empty($password)){
            echo "<script type="."\""."text/javascript"."\"".">"."window.alert"."("."\""."请填写正确的信息！"."\"".")".";"."</script>";
          }
          $str="select password from users where password='".md5($password,true)."'";
          $str1="select password from users where user_id=1";
          $result=mysqli_query($link,$str);
          $result1=mysqli_query($link,$str1);
          $pass=mysqli_fetch_array($result,MYSQLI_ASSOC);
          $pass1=mysqli_fetch_array($result1,MYSQLI_ASSOC);
          if($pass['password']===$pass1['password']) {//判断是否正确匹配
            //echo"登录成功！";
            echo "<script type="."\""."text/javascript"."\"".">"."window.alert"."("."\""."flag{******}"."\"".")".";"."</script>";
          } else {  
            echo"<script type="."\""."text/javascript"."\"".">"."window.alert"."("."\""."登录失败！"."\"".")".";"."</script>";
          }
        
          exit();
        }
}
?>
```

