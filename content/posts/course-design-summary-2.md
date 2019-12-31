---
date: 2018-11-27T16:00:00
title: "综合课设Ⅱ 总结"
description: "　　基于S3C2440平台的基本嵌入式课程设计第二期总结，主要任务是进行嵌入式Linux操作系统的硬件（LED和按钮）驱动程序的开发、嵌入式Linux GUI软件开发以及网络软件的开发。"
categories: ["嵌入式"]
---

　　这学期课设过的挺顺利，总结一下学到的东西。

## 一、Linux驱动开发

### 1.Linux驱动开发基础
#### 驱动程序的功能
- 对设备初始化以及资源释放
- 内核与硬件之间的数据（操作、读写内容等）的转换与传送
- 读取应用程序传送给设备文件的数据和回送应用程序请求的数据
- 检测和处理设备出现的错误

#### 应用程序、库、驱动程序和内核的关系
- 应用程序调用一系列函数库，以文件形式访问各种硬件设备
- 某些库函数无需内核的支持，由库函数内部通过代码实现。另外一些库函数涉及到硬件操作或内核的支持，由内核完成对应功能，我们称之为系统调用
- 内核处理系统调用，根据设备文件，调用设备驱动程序
- 驱动程序直接与硬件通信，为系统提供硬件接口

#### 驱动程序与应用程序的区别

- 应用程序
  - 工作在用户态
  - 可以使用glibc等C标准函数库
  - 以main开始
  - 从头到尾执行

- 驱动程序
  - 是内核的一部分，工作在内核态
  - 不能使用标准库
  - 没有main
  - 以一个模块初始化函数作为入口，完成初始化之后不再运行，等待系统调用

### 2.Linux内核模块

  Linux内核是单内核，而驱动程序作为操作系统设备管理中的一部分，就需要被编译进内核。如果直接在现有的内核中加入新的驱动，就不得不重新编译内核，效率非常低，同时如果编译的模块不是很完善，很可能会造成内核崩溃。这也是单内核的缺点，可扩展性和可维护性相对较差。

  因此，Linux提供了内核模块机制来弥补上述缺陷。内核模块是Linux内核向外部提供的一个插口，全称为动态可加载内核模块（Loadable Kernel Module，LKM），简称为模块。模块在运行时被链接到内核作为内核的一部分在内核空间运行，可以实现内核本身并不含有的功能。

  显然，内核模块非常适合用于Linux驱动程序的开发。但是模块并不是驱动的必要形式，驱动不一定必须是模块，有些驱动是直接编译进内核的，同时模块也不全是驱动。

### 3.LED驱动

#### 硬件原理 

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/course-design-summary-2/led.png)

  LED硬件原理如图所示。LED 1-4对应的GPIO引脚为GPB5、GPB6、GPB7、GPB8。由LED电路可知，每个LED的一端连接电阻，同时有VDD33V提供高电平，另一端则直接连接控制芯片。当控制芯片提供低电平时，即数据寄存器置0，电流通过，LED被点亮。

#### 驱动设计

  驱动需要实现的功能有：设备初始化，包括有定义设备引脚、设置引脚功能、定义设备名、创建设备文件、设备注册、设备状态初始化等；给出系统调用ioctl函数的驱动实现；驱动模块卸载时的操作，包括卸载设备以及删除设备文件等。

#### 代码实现
```c
/** myleds.c **/
#include <linux/miscdevice.h>
#include <linux/delay.h>
#include <asm/irq.h>
#include <mach/regs-gpio.h>
#include <mach/hardware.h>
#include <linux/kernel.h>
#include <linux/module.h>
#include <linux/init.h>
#include <linux/mm.h>
#include <linux/fs.h>
#include <linux/types.h>
#include <linux/delay.h>
#include <linux/moduleparam.h>
#include <linux/slab.h>
#include <linux/errno.h>
#include <linux/ioctl.h>
#include <linux/cdev.h>
#include <linux/string.h>
#include <linux/list.h>
#include <linux/pci.h>
#include <linux/gpio.h>
#include <asm/uaccess.h>
#include <asm/atomic.h>
#include <asm/unistd.h>

#define DEVICE_NAME "myleds"

static unsigned long led_table[]={ //定义led的GPIO引脚
    S3C2410_GPB(5),
    S3C2410_GPB(6),
    S3C2410_GPB(7),
    S3C2410_GPB(8)
};

static unsigned int led_cfg_table[]={ //设置led引脚功能为输出
    S3C2410_GPIO_OUTPUT,
    S3C2410_GPIO_OUTPUT,
    S3C2410_GPIO_OUTPUT,
    S3C2410_GPIO_OUTPUT
};


//ioctl函数的驱动实现
static int leds_ioctl(struct inode *inode,struct file *file,unsigned int cmd,unsigned long arg)  
{
    if(cmd==0 || cmd==1){
        if(arg>4) return -EINVAL;
            s3c2410_gpio_setpin(led_table[arg],!cmd); //设置相应的引脚状态
        return 0;
    }
    else
        return -EINVAL;
}

static struct file_operations dev_fops={ //文件结构体
    .owner=THIS_MODULE,                  //防止使用过程中被卸载
    .ioctl=leds_ioctl                    //ioctl函数实现
};

static struct miscdevice misc={ //混杂设备结构体
    .minor=MISC_DYNAMIC_MINOR,  //动态分配次设备号
    .name=DEVICE_NAME,          //驱动名为DEVICE_NAME,即myleds
    .fops=&dev_fops             //文件操作指针
};

static int __init dev_init(void) //模块加载时的初始化函数
{
  int ret,i;
    
    printk(KERN_ALERT"\"Myleds\" installed\n");

    for (i=0;i<4;i++){
        s3c2410_gpio_cfgpin(led_table[i],led_cfg_table[i]);
        //配置led引脚的功能
        s3c2410_gpio_setpin(led_table[i],0);
        //初始化led状态为点亮
    }

    ret=misc_register(&misc);  
    //设备注册，创建设备文件,并miscdevice结构挂载到misc_list列表
    printk ("\"Myleds\" initialized\n");

  return ret;
}

static void __exit dev_exit(void) //模块卸载时的退出函数
{
    misc_deregister(&misc);
    //卸载设备，从mist_list中删除miscdevice结构，删除设备文件
    printk("\"Myleds\" removed\n");
}

module_init(dev_init);
module_exit(dev_exit);
MODULE_LICENSE("GPL");
MODULE_AUTHOR("Boys Next Door"); // 🤪
```


### 4.按键驱动

#### 硬件原理

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/course-design-summary-2/button.png)

  按键硬件原理如图所示。按键1-6对应的GPIO引脚为GPG0、GPG3、GPG5、GPG6、GPG7、GPG11，同时对应有外部中断EINT8、EINT11、EINT13、EINT14、EINT15、EINT19。由按键电路可知，当按键按下时，VDD33V高电平被拉低，从而触发产生相应的中断。所以按键驱动采用中断方式实现对设备的控制。

#### 驱动设计

  驱动需要实现的功能有：按键按下即触发中断，进入中断服务程序，获取按键状态；设备初始化，包括有定义设备引脚、设置引脚功能、定义设备名、创建设备文件、设备注册、设备状态初始化等；给出系统调用open函数、close函数、read函数、poll函数的驱动实现；驱动模块卸载时的操作，包括卸载设备以及删除设备文件等。

  这里引入等待队列和中断标志：当按键按下产生中断时，唤醒等待队列，设置中断标志，以便read函数获取按键状态并传递给用户程序；当按键没有按下时，系统不会轮询按键状态，节省时钟资源。中断服务程序实现按键状态的获取、设置中断标志并唤醒等待队列。

  涉及按键的系统调用有open函数、close函数、read函数、poll与select函数。驱动对各函数的底层实现如下：

- open函数：实现中断注册并设置中断标志。中断类型采用双沿触发，这样能够更加有效的判断按键状态。

- close函数：实现释放中断并注销中断处理函数。

- read函数：当按键未按下时，若程序使用非阻塞方式读取则返回错误，若程序使用阻塞方式读取则将进程挂在等待队列，等待按键按下唤醒。被唤醒后就将中断处理程序获取的一组按键状态传递给用户程序。

- poll与select函数：将进程挂在等待队列，当进程被唤醒时返回数据可读标识。

#### 代码实现
```c
/** mybuttons.c **/
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/fs.h>
#include <linux/init.h>
#include <linux/delay.h>
#include <linux/poll.h>
#include <linux/irq.h>
#include <asm/irq.h>
#include <linux/interrupt.h>
#include <asm/uaccess.h>
#include <mach/regs-gpio.h>
#include <mach/hardware.h>
#include <linux/platform_device.h>
#include <linux/cdev.h>
#include <linux/miscdevice.h>
#include <linux/sched.h>
#include <linux/gpio.h>

#define DEVICE_NAME "mybuttons"

struct button_irq_desc{  //中断用结构体
    int irq;             //中断号
    int pin;             //GPIO引脚
    int pin_setting;     //引脚设置
    int number;          //键值
    char *name;          //按键名称
};

static struct button_irq_desc button_irqs[]={
    {IRQ_EINT8,S3C2410_GPG(0),S3C2410_GPG0_EINT8,0,"KEY1"},
    {IRQ_EINT11,S3C2410_GPG(3),S3C2410_GPG3_EINT11,1,"KEY2"},
    {IRQ_EINT13,S3C2410_GPG(5),S3C2410_GPG5_EINT13,2,"KEY3"},
    {IRQ_EINT14,S3C2410_GPG(6),S3C2410_GPG6_EINT14,3,"KEY4"},
    {IRQ_EINT15,S3C2410_GPG(7),S3C2410_GPG7_EINT15,4,"KEY5"},
    {IRQ_EINT19,S3C2410_GPG(11),S3C2410_GPG11_EINT19,5,"KEY6"}
};

//按键状态
static volatile char key_values[]={'0','0','0','0','0','0'};

//创建等待队列,中断产生时唤醒队列,设置中断标志,以便read函数读取键值，没有中断时,系统不会轮询按键状态，节省时钟资源
static DECLARE_WAIT_QUEUE_HEAD(button_waitq);

//中断标志
static volatile int ev_press=0;

//中断服务程序
static irqreturn_t buttons_interrupt(int irq,void *dev_id)
{
  struct button_irq_desc *button_irqs=(struct button_irq_desc *)dev_id;
  int down;

    down=!s3c2410_gpio_getpin(button_irqs->pin);
    //获取被按下的按键状态

    if(down!=(key_values[button_irqs->number] & 1)){
        key_values[button_irqs->number]='0'+down;
        ev_press=1;
        //设置中断标志
        wake_up_interruptible(&button_waitq);
        //唤醒等待队列
    }
    
  return IRQ_RETVAL(IRQ_HANDLED);
}

//open函数驱动实现
static int buttons_open(struct inode *inode,struct file *file) 
{
  int i;
  int err=0;
    
    for(i=0;i<sizeof(button_irqs)/sizeof(button_irqs[0]);i++){
        if(button_irqs[i].irq<0)
            continue;
        err=request_irq(button_irqs[i].irq,buttons_interrupt,IRQ_TYPE_EDGE_BOTH,button_irqs[i].name,(void *)&button_irqs[i]);
        //注册中断,中断类型为IRQ_TYPE_EDGE_BOTH(双沿触发),能够更加有效的判断按键状态
        if(err) break;
    }

    if(err){ //如果出错则释放已注册的中断
        i--;
        while(i>=0){
            if(button_irqs[i].irq<0)
                continue;
            disable_irq(button_irqs[i].irq);
            free_irq(button_irqs[i].irq,(void *)&button_irqs[i]);
            i--;
        }
        return -EBUSY;
    }
	
    ev_press=1; //中断注册成功,设置中断标志
    
  return 0;
}

//close函数驱动实现
static int buttons_close(struct inode *inode,struct file *file)
{
  int i;
    
    for(i=0;i<sizeof(button_irqs)/sizeof(button_irqs[0]);i++){
        if (button_irqs[i].irq<0)
            continue;
        free_irq(button_irqs[i].irq,(void *)&button_irqs[i]);
        //释放中断，并注销中断处理函数
    }

  return 0;
}

//read函数驱动实现
static int buttons_read(struct file *filp,char __user *buff,size_t count,loff_t *offp)
{
  unsigned long err;

    if(!ev_press)//中断标志为0时
        if(filp->f_flags & O_NONBLOCK) //以非阻塞方式打开时,返回
            return -EAGAIN;
        else
            wait_event_interruptible(button_waitq, ev_press); 
        //以阻塞方式打开时,挂在等待队列,等待被唤醒
    
    ev_press=0;//清中断标志
    err=copy_to_user(buff,(const void *)key_values,min(sizeof(key_values),count));
    //将一组按键状态传递到用户层

  return err?-EFAULT:min(sizeof(key_values),count);
}

static unsigned int buttons_poll(struct file *file,struct poll_table_struct *wait)
//poll函数驱动实现
{
  unsigned int mask=0;

    poll_wait(file,&button_waitq,wait);
    //将进程挂到等待队列，以便被唤醒
    if(ev_press)
        mask|=POLLIN | POLLRDNORM;

  return mask;
}

static struct file_operations dev_fops={ //文件结构体
    .owner=THIS_MODULE,                  //防止使用过程中被卸载
    .open=buttons_open,                  //open函数实现
    .release=buttons_close,              //close函数实现
    .read=buttons_read,                  //read函数实现
    .poll=buttons_poll                   //poll函数实现
};

static struct miscdevice misc={
    .minor=MISC_DYNAMIC_MINOR, //动态分配次设备号
    .name=DEVICE_NAME,         //驱动名为DEVICE_NAME,即mybuttons
    .fops=&dev_fops            //文件操作指针
}; 

static int __init dev_init(void) //模块加载时的初始化函数
{
  int ret;

    printk(KERN_ALERT"\"Mybuttons\" installed\n");
    ret = misc_register(&misc);
    //设备注册，创建设备文件,并miscdevice结构挂载到misc_list列表

  return ret;
}

static void __exit dev_exit(void) //模块卸载时的退出函数
{
    misc_deregister(&misc);
    //卸载设备，从mist_list中删除miscdevice结构，删除设备文件
    printk("\"Mybuttons\" removed\n");
}

module_init(dev_init);
module_exit(dev_exit);
MODULE_LICENSE("GPL");
MODULE_AUTHOR("Boys Next Door");
```

### 5.驱动模块的编译与安装
  编译模块的Makefile
```makefile
PWD = $(shell pwd)
# 模块源文件路径
KDIR = /home/***/Desktop/kernel/linux-2.6.32.2/
# 内核目录
obj-m := myleds.o mybuttons.o
# obj-m表示编译目标为模块，指定编译的源文件
all:
    $(MAKE) -C $(KDIR) M=$(PWD) CONFIG_DEBUG_SECTION_MISMATCH=y
    # 切换到内核目录进行编译
clean:
    rm -rf *.o *~core.depend. *.cmd *.ko *.mod.c .tmp_versions
    rm -rf *.order Module.*
active:
    echo -e "$(MAKE) \n"
    $(MAKE) -C $(KDIR) M=$(PWD)
```

  Led驱动模块的安装与卸载，按键的也一样
```bash
insmod myleds.ko
#加载led驱动模块
lsmod
#查看当前已加载的模块
rmmod myleds
#卸载led驱动模块
```

## 二、内核裁剪与编译

  由于原系统自带的LED和按键驱动已经直接编译进内核，为了测试自己编写的驱动，需要对内核进行配置，裁剪去掉原有的驱动模块。Linux内核配置系统系统由以下三个部分组成。

- 内核源代码各层目录中的Makefile

- 配置文件
- 配置工具：make config(字符界面)、make menuconfig(ncurses图形界面)、make xconfig(Xwindows图形界面)

  运行 `make menuconfig` 对现有的Linux内核配置进行修改。在 `Devices Drivers` 菜单中，选择进入 `Character devices`，找到并选中LEDs和Buttons驱动。可以看到驱动名称前的标识符为` <*>`，意思是模块直接编译进内核，修改为` < >`对应的模块将不被编译进内核，内核裁剪完成。

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/course-design-summary-2/menuconfig.png)

  再执行```make zImage```，根据配置文件编译生成Linux内核映像文件```arch/arm/boot/zImage```。

## 三、Qt/E

  （Qt/E开发板上GUI程序待续......）

  在Qtopia-2.2.0中运行Qt程序，需要在“设置”的“关机”中点击Terminate Server以关闭Qtopia。

![](https://blog-zijui.oss-cn-shenzhen.aliyuncs.com/images/course-design-summary-2/qt.png)

  还需要执行以下命令。
```bash
source /bin/setqt4env
# 使用自带脚本设置环境变量
./gui -qws
# 使用-qws选项运行程序，将程序设置为服务程序
```

## 四、参考

- [Linux驱动基础开发 - 月夜听枫 - 博客园](https://www.cnblogs.com/mrzhangxinjie/p/7170736.html)