---
date: 2017-12-03
title: "公钥密码及RSA攻击方法"
categories: ["编码与密码技术"]
---

## 一、什么是公钥密码

　　在对称密码中，加密和解密的密钥是相同的，但公钥密码中，加密密钥和解密密钥是不同的，因此只有拥有解密密钥的人才能够解密。公钥密码又称**非对称密码**。

　　公钥密码中

- 加密密钥一般是公开的，称为**公钥**（public key）
- 解密密钥则绝对不能公开，只能由接收者使用，称为**私钥**（private key）
- 公钥和私钥是一一对应的，一对公钥和私钥称为**密钥对**（key pair），由公钥进行加密的密文，必须使用对应的私钥才能解密
- 公钥和私钥不能单独生成

## 二、通信流程

　　在公钥密码通信中，通信过程由接收者Receiver来启动。发送者为Sender。
- Receiver生成一个密钥对
- Receiver将公钥发送给Sender
- Sender使用公钥对消息进行加密，并将密文发送给Receiver
- Receiver使用私钥解密密文

## 三、RSA

　　RSA是现在使用最广泛的公钥密码算法，其名字是由三位开发者Ron Rivest、Adi Shamir和Leonard Adleman的姓氏首字母组成。RSA可用于公钥密码和数字签名。
### 1.RSA算法原理

　　RSA加密算法如下，**E和N的组合即（E,N）就是公钥**：
$$
c=m^EmodN
$$
　　RSA解密算法如下，**D和N的组合即（D,N）就是私钥**（由于N是公钥的一部分，所以可单独将D称为私钥）：
$$
m=c^DmodN
$$
　　可见，RSA加密最重要的就是E、D、N三个数，下面给出生成这三个数的算法

选择两个大质数p和q，通常由伪随机数生成器生成

- N=p×q
- L=φ(n)=(p-1)(q-1)
- E要满足1<E<L且gcd(E,L)=1，即E与L互质，这是为了保证一定存在D
- D要满足1<D<L且E×D mod L=1，保证对密文解密能够得到正确的明文

　　得到E、D和N后即可封装成公钥和密钥。密钥的长度就是N的长度。实际应用中，公钥和私钥的数据都采用[ASN.1](http://zh.wikipedia.org/zh-cn/ASN.1)格式表达。

### 2.对RSA的攻击

- 通过密文求得明文：已知密文、E和N，求解方程
  $$
  c=m^EmodN
  $$
  这是一个求离散对数的问题，目前还没有高效的算法。

- 暴力破解找出D：暴力枚举D，破解难度随着D的长度增加而变大，当D足够长时，一辈子都爆不出来。

- 通过E和N求出D：如果能够高效地对N进行质因数分解，即求出p和q，RSA就能被破译，但是目前公开能够分解的最大整数为768位。

- 通过推测p和q进行攻击，和伪随机数生成器玩猜数字游戏(￣▽￣)"。

- 中间人攻击：攻击者充当中间人，拦截接收者发出的公钥并替换为另一公钥，攻击者可以拦截发送者发送的密文并使用私钥解密，而后篡改消息，再通过真正的公钥加密后发送给接收者。该过程可以反复进行。该方法是针对机密性的攻击，但无法破译RSA。可以使用**证书**来确认公钥来源，以防范这种攻击手段。

- 选择密文攻击：如果服务器对收到的任意数据都当做密文来解密，并返回解密结果（即解密提示），攻击者可以构造不同的信息让解密提示尝试解密，从而获得密钥与明文有关的部分信息。有点像SQL报错注入。对密文进行认证可抵御选择密文攻击，如[RSA-OAEP](https://en.wikipedia.org/wiki/Optimal_asymmetric_encryption_padding)算法。

### 3.密码劣化与RSA的长度

　　随着计算机技术的进步，以前安全的密码会被破译，该现象称为**密码劣化**。针对该现象，[NIST](https://en.wikipedia.org/wiki/National_Institute_of_Standards_and_Technology) SP800-57给出如下方针
- 1024位的RSA不应被用于新的用途
- 2048位的RSA可在2030年之前被用于新的用途
- 4096位的RSA在2031年之后仍可被用于新的用途

## 四、其他公钥密码

- ElGama方式
- Rabin方式
- [椭圆曲线密码](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography)（ECC）

## 五、CTF中的RSA破译

### 1.低加密指数攻击

　　在RSA加密算法中，选取的加密指数E较小，分两种情况。

　　如果明文较小，m^E小于N，可得到

　　如果m^E大于N，但不是特别大，可以通过枚举可能的k，使得有整数解

```python
# -*- coding: utf-8 -*-

import gmpy
n=int(raw_input("输入n:"))
c=int(raw_input("输入密文C:"))
e=int(raw_input("输入加密指数E:"))

k=0;
while 1:
    if(gmpy.root(c+k*n,e)[1]==1):
        print "明文:",gmpy.root(c+k*n,e)
        break
    k=k+1
```

### 2.低加密指数广播攻击

　　给出多组加密的参数，使用相同的低加密指数加密相同的信息（N不同），这种情况可以进行广播攻击得到明文。例如有
$$
c_1=m^EmodN_1 \quad c_2=m^EmodN_2 \quad c_3=m^EmodN_3
$$
　　由中国剩余定理，可得到
$$
c=m^Emod(N_1 \times N_2 \times N_3)
$$

### 3.低解密指数攻击

　　在RSA解密算法中，选取的解密指数D较小，一般给出的加密指数E会很大。

　　[pablocelayes/rsa-wiener-attack](https://github.com/pablocelayes/rsa-wiener-attack)给出了攻击的python脚本。
### 4.共模攻击

　　明文相同，已知密文和公钥，加密时对相同的N取模，加密指数不同。如果两个加密指数互质，可得到
$$
E_1 \times S_1 + E_2 \times S_2=1，其中S_1与S_2都为整数，且S_1 \times S_2<0
$$
　　又
$$
c_1=m^{E_1}modN \quad c_2=m^{E_2}modN
$$
　　所以
$$
({c_1}^{S_1} \times {c_2}^{S_2})modN=m^{E_1 \times S_1 + E_2 \times S_2}modN
$$
　　得到
$$
({c_1}^{S_1} \times {c_2}^{S_2})modN=mmodN
$$
　　求出S1与S2即可求出明文

```python
# -*- coding: utf-8 -*-

def egcd(a,b):
    if a==0:
        return (b,0,1)
    else:
        g,y,x=egcd(b%a,a)
        return (g,x-(b//a)*y,y)
def modinv(a,m):
    g,x,y=egcd(a,m)
    if g!=1:
        raise Exception('模反不存在')
    else:
        return x%m
def main():
    n=int(raw_input("输入n:"))
    c1=int(raw_input("输入密文C1:"))
    c2=int(raw_input("输入密文C2:"))
    e1=int(raw_input("输入加密指数E1:"))
    e2=int(raw_input("输入加密指数E2:"))
    s=egcd(e1, e2)
    s1=s[1]
    s2=s[2]
    if s1<0:
        s1=-s1
        c1=modinv(c1,n)  #通过求模反元素的正数次幂进行负数次幂运算
    elif s2<0:
        s2=- s2
        c2=modinv(c2,n)
    print (c1**s1)*(c2**s2)%n
if __name__=='__main__':
    main()
```

## More

[算法原理(一) - 阮一峰的网络日志](http://www.ruanyifeng.com/blog/2013/06/rsa_algorithm_part_one.html)

[算法原理(二) - 阮一峰的网络日志](http://www.ruanyifeng.com/blog/2013/06/rsa_algorithm_part_one.html)

