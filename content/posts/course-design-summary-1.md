---
date: 2018-01-18
title: "综合课设Ⅰ 总结"
categories: ["嵌入式"]
---

　　两天搞定了这学期的综合课设，报告是小组一起肝了两天半写的，有些内容写的不是很详细，就在这里捋一捋遇到的问题和学到的东西。

## 一、ssh和sftp

　　刚开始就没想着用什么minicom、超级串口、nfs和tftp啊去连开发板，乱七八糟一堆线，小洁癖看的很不舒服。用ssh连啥线都不用，还能用sftp直接传文件。燃鹅板子预装的系统告诉我事情并不会这么简单，主要有几个问题。

- wifi啥都扫不到，估计是DM9000网卡驱动的问题。
- 有线连进局域网，但是ping不通，可能是同学的网络设置问题，以后有时间在自己网络中测试一下。只能用pc和板子直接相连组成局域网，ssh能够正常登陆。
- Xshell报错：sftp子系统申请已拒绝 请确保ssh连接的sftp子系统设置有效。怀疑是ssh服务设置问题，翻遍/etc下的文件找不到sshd_config，找了好久，最后发现在/usr/sbin里面（记不清了），按照网上的各种方法修改都没有奏效。

　　最后用ssh+nfs实现开发板的终端控制和文件传输，在linux上使用sftp没有Xftp方便，甚至还没有nfs好用。

## 二、裸机环境下实现对按键和LED的控制

### GPIO端口组成原理

　　s3c2440芯片有如下9组GPIO端口，起始地址为0x56000000，每个端口都有一个配置寄存器GPXCON和一个数据寄存器GPXDAT。

| 端口号 | 输入输出引脚  | GPXCON地址 | GPXCON位数     | GPXDAT地址 |   GPXDAT位数   |
| ------ | ------------- | ---------- | -------------- | ---------- | :------------: |
| GPA    | 25位输出端口  | 0x56000000 | 25位，1位/引脚 | 0x56000004 | 25位，1位/引脚 |
| GPB    | 11位输入/输出 | 0x56000010 | 22位，2位/引脚 | 0x56000014 | 11位，1位/引脚 |
| GPC    | 16位输入/输出 | 0x56000020 | 32位，2位/引脚 | 0x56000024 | 16位，1位/引脚 |
| GPD    | 16位输入/输出 | 0x56000030 | 32位，2位/引脚 | 0x56000034 | 16位，1位/引脚 |
| GPE    | 16位输入/输出 | 0x56000040 | 32位，2位/引脚 | 0x56000044 | 16位，1位/引脚 |
| GPF    | 8位输入/输出  | 0x56000050 | 16位，2位/引脚 | 0x56000054 | 8位，1位/引脚  |
| GPG    | 16位输入/输出 | 0x56000060 | 32位，2位/引脚 | 0x56000064 | 16位，1位/引脚 |
| GPH    | 9位输入/输出  | 0x56000070 | 22位，2位/引脚 | 0x56000074 | 11位，1位/引脚 |
| GPJ    | 13位输入/输出 | 0x560000D0 | 26位，2位/引脚 | 0x560000D4 | 13位，1位/引脚 |

　　由于大多数端口为复用引脚，所以需要配置寄存器来选择每个引脚的功能，而数据寄存器则是用于设置或获取对应引脚的数值状态。要控制硬件设备，就是要获取和修改相应寄存器的内容。

　　查阅用户手册可知，LED灯组使用GPB端口，且4个LED灯分别对应GPB5-GPB8，即GPBCON的10-17位，GPBDAT的5-8位。而按键组则使用的是GPG端口，6个按键分别对应GPG0,GPG3,GPG5,GPG6,GPG7和GPG11。

　　GPBCON和GPGCON中每两位设置一个引脚的功能，00为输入，01为输出，10为特殊功能，11为保留待用。GPBDAT的对应位中，1为点亮LED，0为灯灭。GPGDAT的对应位中，1为按键按下，0为未按下。

### 程序实现

　　知道了LED和按键的端口组成后就可以编写程序对其进行控制了。

```c
//2440_GPX.h头文件
#define GPIOBASE 0x56000000
#define GPXCON_ADDR(x) (*(volatile unsigned long *)(GPIOBASE + x))     
//GPXCON地址，即GPX起始地址
#define GPXDAT_ADDR(x) (*(volatile unsigned long *)(GPIOBASE + x + 4)) 
//GPXDAT地址，即GPX起始地址+4

#define GPB 0x10 //GPB起始地址
#define GPG 0x60 //GPG起始地址

#define GPBCON GPXCON_ADDR(GPB) //即0x56000010
#define GPGCON GPXCON_ADDR(GPG) //即0x56000020

#define GPBDAT GPXDAT_ADDR(GPB) //即0x56000014
#define GPGDAT GPXDAT_ADDR(GPG) //即0x56000024

#define GPXXOUT(GPXCON,n) (GPXCON |=  (0x1 << (2 * n)))
/*
 *把[2n:2n+1]两位变为01，即设置GPXn对应的引脚的功能为输出
 *GPXCON必须为GPBCON~GPJCON，即n<=16
 */
#define GPXXIN(GPXCON,n) (GPXCON &= ((GPXCON & ~(0x3 << (2 * n)))))
/*
 *把[2n,2n+1]两位设为00（对11取反），即设置GPXn对应的引脚的功能为输入
 *GPXCON必须为GPBCON~GPJCON
 */
```

　　上面的头文件给出了各寄存器的地址和设置引脚功能的函数

　　下面是主程序

```c
//主程序led.c
#include "2440_GPX.h"

int main()
{
    GPXXOUT(GPBCON,5);GPXXOUT(GPBCON,6);GPXXOUT(GPBCON,7);GPXXOUT(GPBCON,8);
    //设置LED为输出状态
    GPXXIN(GPGCON,0);GPXXIN(GPGCON,3);GPXXIN(GPGCON,5);GPXXIN(GPGCON,6);
    //设置按键为输入状态

    while(1)
    {
        unsigned long dwData;
        dwData=GPGDAT;

        /*如果按键K1按下，即按键1在GPGDAT中的相应位为1
         *则设置LED0在GPBDAT中的相应位为1，否则将相应位置0，下同
         */
        if(dwData & (1<<0))
	    GPBDAT |= (1<<5);
        else
            GPBDAT &= ~(1<<5);

        /*K2*/
        if(dwData & (1<<3))
            GPBDAT |= (1<<6);
        else
            GPBDAT &= ~(1<<6);

        /*K3*/
        if(dwData & (1<<5))
            GPBDAT |= (1<<7);
        else
            GPBDAT &= ~(1<<7);

        /*K4*/
        if(dwData & (1<<6))
            GPBDAT |= (1<<8);
        else
            GPBDAT &= ~(1<<8);
    } 
    return 0;
}
```

## 三、裸机程序执行环境

　　crt0即 C runtime 0，0的意思是初始阶段，顾名思义，就是对C程序运行时进行初始化。crt0是一组链接到C程序中的执行启动例程，通常以汇编语言编写。crt0会执行所有的初始化操作，然后调用执行main函数。[crt0的主要工作](http://www.embecosm.com/appnotes/ean9/html/ch05s02.html)如下：

1. 根据目标平台进行相应的初始化
2. 初始化堆栈
3. 调用constructor初始化，并确保退出时调用destructor[constructor属性和destructor属性](http://blog.csdn.net/justlinux2010/article/details/11695645)
4. 调用main函数
5. 如果main函数终止，则返回提供的返回码

　　在一般的操作系统环境下，编译器会将crt0.o自动链接包含到每个可执行文件中。由于我们需要在裸机环境下执行程序，所以需要自己编写相应的crt0.S文件，并编译为目标文件crt0.o并链接到主程序，形成最终的可执行文件。crt0.S可源码如下

```assembly
//crt0.S
.text                 //arm-gcc关键词，指定了后续编译的内容放在代码段
.global _start        //.global也是关键词，告诉编译器_start是全局变量或函数
_start:               //表示程序入口，链接器在链接时会将其设置为整个程序的入口
ldr r0,=0x53000000    //获取看门狗的WTCON寄存器地址，用于设置看门狗定时器模式
mov r1,#0x0
str r1,[r0]           //设置WTCON的复位使能位为0，使看门狗定时器复位无效
ldr sp,=1024*4        //初始化堆栈，设置堆栈大小为4K，下面解释为什么是4K
bl main               //调用main函数
halt_loop:
b halt_loop
```

#### 看门狗（watchdog）

　　上面crt0.S中将看门狗复位使能设置为0，这里就来讲一讲看门狗。

　　在由单片机构成的微机系统中，由于单片机的工作常常会受到来自外界电磁场的干扰，造成程序的跑飞，而陷入死循环，程序的正常运行被打断，由单片机控制的系统无法继续工作，会造成整个系统的陷入停滞状态，发生不可预料的后果，所以出于对单片机运行状态进行实时监测的考虑，于是就有了看门狗定时器。

　　看门狗内设有一个递减计数器，当计数器数值为0时就会重启控制器并复位，所以为了系统的正常运作，需要定时重置计数器的数值（即喂狗）。由于我们的程序比较简单，一般不会出现程序跑飞的问题，所以为了确保系统不会重启，可以设置看门狗配置寄存器（WTCON）的0位（复位使能位）为0，使看门狗复位无效。

　　看门狗的更多内容见[S3C2440看门狗定时器（watchdog）](http://blog.csdn.net/mr_raptor/article/details/6555704)

#### 编译与链接

　　上面说了crt0需要链接到主程序形成可执行文件，课设任务要求使用ADS，这个老古董只在windows有，还一堆兼容性问题，我的linux还是双系统，切来切去很麻烦，直接用的arm-linux-gcc。下面给出Makefile

```makefile
led.bin:crt0.S led.c
    arm-linux-gcc -g -c -o crt0.o crt0.S
    arm-linux-gcc -g -c -o led.o led.c
    # -g为了调试，-c先不链接
    arm-linux-ld -Ttext 0x0000000 -g crt0.o led.o -o led_elf
    # 将crt0.o和led.o链接生成elf文件，-Ttext指定代码段的起始地址
    arm-linux-objcopy -O binary -S led_elf led.bin
    # 将elf文件转为烧录需要使用bin文件，-O设定输出格式为二进制文件，-S不从源文件中复制重定位信息和符号信息到输出文件

clean:
    rm -f *.o led_elf
    # 清理中间文件
```

## 四、程序烧录

　　s3c2440芯片有NOR Flash存储器和NAND Flash存储器，为了支持NAND Flash的BootLoader，s3c2440采用了Steppingstone技术。从NAND Flash启动时，会将NAND Flash的开始4K字节将加载到SDRAM中，并映射到ARM地址空间的0x00000000地址开始的4K区域，然后PC（指令计数器）会指向0x00000000地址，开始执行程序。所以我们需要将程序写进NAND Flash，并设置堆栈空间为4K，并指定代码段的起始地址。

　　厂商提供了方便的烧录软件MiniTools，只需要从NOR Flash启动开发板，然后使用USB线连接开发板（USB type-B）和电脑（USB type-A），选择烧录文件即可直接将程序烧录进NAND Flash，再从NAND Flash启动开发板，程序就在裸机环境下运行了。

 





