---
title: "一张 45MP NEF 降噪要多久？PureRAW 实测：RTX 5090 vs M5 Pro"
date: 2026-10-29 23:54:52
categories:
  - 摄影器材
tags:
  - Nikon Z9
  - DxO PureRAW
  - RTX 5090
  - M5 Pro
  - 降噪测试
description: Nikon Z9 FX／机内 DX NEF 的 DxO PureRAW 批量测速，对照 Ryzen 9 9950X3D＋RTX 5090 与 MacBook Pro M5 Pro，比较 DeepPRIME 3、XD3 的处理耗时。
---

拍鸟回来，将一批 NEF 交给 DxO PureRAW 处理，究竟要等多久？这次我们用 Z9 的 FX 和机内 DX 文件做了实测，并把 Windows 台式机与 MacBook Pro 的两份结果整理到一起。

连续批量处理时，Ryzen 9 9950X3D＋RTX 5090 处理 FX 文件，DeepPRIME 3 平均约 **2.29 秒/张**，XD3 约 **3.00 秒/张**；

M5 Pro 对应约 **2.63 秒/张**和 **11.77 秒/张**。

两台机器处理 DX 文件的耗时，都在各自 FX 的一半左右。

<!-- more -->

## 批量处理每张需要多少时间

以下单位均为**秒/张，越小越快**。括号中是三轮批次各自折算为秒/张后的最小值与最大值。

<div class="article-table-scroll" tabindex="0" role="region" aria-label="批量处理耗时对照表，可横向滚动">

| 算法 | 画幅 | Windows：9950X3D＋RTX 5090 | MacBook Pro：M5 Pro | Mac 耗时多了多少 |
| --- | --- | ---: | ---: | ---: |
| DeepPRIME 3 | FX | **2.29**（2.056–2.435） | **2.63**（2.538–2.688） | 1.15 倍 |
| DeepPRIME 3 | DX | **1.06**（0.961–1.265） | **1.24**（1.181–1.289） | 1.16 倍 |
| DeepPRIME XD3 | FX | **3.00**（2.837–3.286） | **11.77**（11.764–11.768） | 3.93 倍 |
| DeepPRIME XD3 | DX | **1.43**（1.298–1.704） | **5.50**（5.440–5.610） | 3.84 倍 |

</div>

## 机器配置

<div class="article-table-scroll" tabindex="0" role="region" aria-label="两台测试机器配置表，可横向滚动">

| 项目 | Windows 台式机 | MacBook Pro |
| --- | --- | --- |
| CPU | Ryzen 9 9950X3D，16 核 / 32 线程 | Apple M5 Pro，18 核 CPU |
| 图形硬件 | NVIDIA GeForce RTX 5090，驱动 610.88 | 芯片内置 20 核 GPU |
| 内存 | 96GB | 48GB 统一内存 |
| 系统 | Windows 11 专业版，Build 26200 | macOS 26.5.1（25F80） |
| PureRAW | **6.3.1.1** | **6.8.0.7** |
| 加速选项 | Auto selection（NVIDIA GeForce RTX 5090） | Auto selection（Apple Neural Engine） |
| 读写位置 | 本机 NVMe SSD | 本机内置 SSD |

</div>

Mac 的加速菜单虽然显示 Apple Neural Engine，但原报告中的 Core ML 日志记录为：DeepPRIME 3 使用 `All`，XD3 使用 `CPU+ANE`。

两边都使用内置的 `DeepPRIME 3 - DNG` 与 `DeepPRIME XD3 - DNG` 预设，主要设置如下：

- DNG compression：`Original`。
- Luminance：40；Force details：0。
- 镜头锐度、畸变、暗角及色差校正开启，对应光学模块已安装。
- AI 除尘关闭，Smart Lighting 关闭。


## 这些结果说明了什么

**机内 DX 在本次测试中明显减少了处理时间。** 四组比较里，DX 的批量耗时约为各自 FX 的 46%–48%。DX 的有效像素量约为 FX 的 43%。

**算法带来的时间差，在两套环境里相当不同。** Windows 上，XD3 的批量耗时约为 DeepPRIME 3 的 1.31–1.35 倍；Mac 上约为 4.45–4.48 倍。

如果简单用均值乘以 100，得到下面的时间：

<div class="article-table-scroll" tabindex="0" role="region" aria-label="处理一百张照片的估算耗时表，可横向滚动">

| 算法 | 画幅 | Windows 处理 100 张的估算 | Mac 处理 100 张的估算 |
| --- | --- | ---: | ---: |
| DeepPRIME 3 | FX | 约 3 分 49 秒 | 约 4 分 23 秒 |
| DeepPRIME 3 | DX | 约 1 分 46 秒 | 约 2 分 04 秒 |
| DeepPRIME XD3 | FX | 约 5 分 00 秒 | 约 19 分 37 秒 |
| DeepPRIME XD3 | DX | 约 2 分 23 秒 | 约 9 分 10 秒 |

</div>
