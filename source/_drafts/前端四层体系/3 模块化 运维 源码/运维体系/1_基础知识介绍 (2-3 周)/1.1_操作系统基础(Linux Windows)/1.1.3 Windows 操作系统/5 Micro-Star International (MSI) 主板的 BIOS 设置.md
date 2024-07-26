---
title: Micro-Star International (MSI) 主板的 BIOS 设置
---

Micro-Star International (MSI) 主板的 BIOS 设置可以帮助你进行硬件配置、系统优化以及故障排除。以下是一些常见的 BIOS 设置和配置步骤，具体操作可能会因主板型号不同有所差异。


## 进入 BIOS 设置

1. 启动电脑：按下电源按钮启动电脑。
2. 按 BIOS 键：在启动过程中，立即按下 Del 或 F2 键（具体按键取决于主板型号，一般会在启动画面上显示提示）。

## BIOS 界面介绍

MSI 主板的 BIOS 通常有两种模式：EZ Mode（简易模式）和 Advanced Mode（高级模式）。

- EZ Mode：提供基本的信息和常用设置，适合快速调整。
- Advanced Mode：提供更详细的设置和调节选项，适合高级用户。

## 常见 BIOS 设置

1. 设备启动顺序（Boot Priority）

- 位置：Boot 标签
- 操作：设置启动设备的优先级，例如将硬盘设置为第一启动设备，或者设置从 USB 设备启动。

2. 超频设置（Overclocking）

- 位置：OC 标签
- 操作：调整 CPU 和内存的频率和电压设置以进行超频。此操作需要慎重，错误的设置可能会导致系统不稳定。

3. 存储配置（Storage Configuration）

- 位置：Advanced 标签 -> SATA Configuration
- 操作：设置 SATA 模式（如 AHCI 或 RAID），查看和配置已连接的存储设备。

4. 风扇控制（Fan Control）

- 位置：Hardware Monitor 标签
- 操作：调整风扇速度和温度阈值，以优化散热效果和噪音水平。

5. 安全设置（Security Settings）

- 位置：Security 标签
- 操作：设置 BIOS 密码、启动密码、Secure Boot 等安全选项。

6. 电源管理（Power Management）

- 位置：Advanced 标签 -> Power Management Setup
- 操作：配置电源按钮行为、睡眠模式、唤醒事件等设置。

7. 复位 BIOS 设置（Reset BIOS Settings）

- 位置：Save & Exit 标签
- 操作：选择 Load Optimized Defaults 以恢复 BIOS 设置到出厂默认值。

## 示例操作：调整启动顺序

- 进入 BIOS 设置界面。
- 选择 Boot 标签。
- 找到 Boot Option #1 并按回车键。
- 从列表中选择你希望的启动设备（例如硬盘或 USB 设备）。
- 按 F10 保存更改并退出。

## 注意事项

- 更新 BIOS：只有在必要时更新 BIOS，更新过程需谨慎操作，避免中途断电或其他中断，否则可能导致主板损坏。
- 记录更改：在修改 BIOS 设置之前，建议记录当前设置，以便在需要时还原。
- 查阅手册：参考主板的用户手册或 MSI 官方网站获取详细的 BIOS 设置说明。

这些设置和步骤应当能够帮助你在 MSI 主板的 BIOS 中进行常见的配置。如果有具体的问题或不确定的地方，建议查阅主板的用户手册或访问 MSI 的支持页面。
