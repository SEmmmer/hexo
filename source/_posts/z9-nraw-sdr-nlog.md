---
title: "Z9 N-RAW 的 SDR 与 N-Log：高光、暗部噪声与曝光选择实测"
date: 2026-10-23 00:00:00
categories:
  - 摄影器材
tags:
  - Nikon Z9
  - N-RAW
  - N-Log
  - 视频测试
  - LUT
description: Z9 N-RAW SDR 与 N-Log 两轮实拍对比：同 ISO 下的高光余量与暗部噪声、跨 ISO 的亮度和噪声关系，以及旧版和新版 LUT 的高光裁切检查。
---

Z9 录制 N-RAW 时，需要先选择 SDR 或 N-Log。尼康官方说明，这两种模式具有无法在后期互相改变的特性：SDR 更适合 SDR 工作流程，暗部噪声表现更好；N-Log 则更侧重高光余量，适合 Log 和 HDR 工作流程。[尼康：About tone mode](https://nps.nikonimaging.com/technical_info/technical_solutions/z9_tips/about_tone_mode/)

但既然记录的是 RAW，为什么拍摄前选择 SDR 或 N-Log，还会留下无法通过后期消除的区别？

我用两轮实拍检查了这个问题。第一轮让两种模式使用完全相同的 ISO、光圈和快门；第二轮扩大 ISO 和光圈范围，寻找两种模式之间更合理的对应关系。随后再单独检查 LUT，区分哪些高光在素材中已经丢失，哪些只是被显示转换剪掉了。

结论：**在本次拍摄与解码流程中，同为 ISO 800，N-Log 的可用高光上限比 SDR 高约 3 EV，但深暗部噪声也更明显。把两份素材都解码成 RWG／Log3G10，并不会消除这些差异。**

第二轮则给出了另一个关键线索：N-Log 800 与 SDR 100、N-Log 4000 与 SDR 500，在统一亮度后，噪声和高光响应十分接近。

<!-- more -->

## 一、拍摄条件与比较方法

测试使用 Nikon Z9，固件为 5.32，镜头为 NIKKOR Z 50mm f/1.8 S。固定机位、固定场景、固定 5500 K 白平衡，录制过程中焦点位置保持不变。

记录规格统一为：

- N-RAW，NORM 画质。
- 8.3K，8256 × 4644，50p。
- 快门 1/100 秒。
- 第一轮：SDR 800 与 N-Log 800，均为 f/8，灯的亮度为 50%，完全过曝。
- 第二轮：SDR 64、100、500、800、4000，以及 N-Log 800、4000；每组覆盖 f/5.6、f/5、f/4.5、f/4、f/3.5、f/3.2、f/2.8，共 49 个曝光参数，灯的亮度为 2%，保证灯芯在 ISO 100，f/4 的情况下略微出现斑马纹而不过曝。

后期比较时，在 Premiere Pro 的 RAW 源设置中统一使用 **REDWideGamutRGB／Log3G10**，关闭序列色彩管理，保持相同的 RAW 源参数，再导出 ProRes 4444 XQ。测量时正确解开视频电平和 Log3G10，回到共同的线性光坐标。

这里没有直接拿两张播放器截图比较亮暗。噪声测量使用连续 50 帧的原生像素，比较同一位置随时间的变化，并在需要时先匹配平均亮度。墙面纹理、门板纹理和图像缩放，不应被当作传感器噪声。

![测试场景与测量区域](/downloads/z9-nraw-sdr-nlog/images/measurement_ROI_map.png)

*第一轮测量位置：A、B 为墙面，C、D 为门板，E 为头显暗部。图中整体提亮仅用于说明位置，实际噪声使用原始尺寸像素计算。*

请注意，本文测到的是**相机记录、RAW 解码与 Premiere Pro 转码共同形成的系统结果**。

## 二、同为 ISO 800，高光与暗部出现了不同取舍

### 高光：N-Log 余量多约三档

第一轮把灯的亮度固定在 50%。按 250/255 的斑马纹设置，保证灯芯中心完全过曝。

两种模式都出现了明显的过曝，符合预期：

<div class="article-table-scroll article-table-compact" tabindex="0" role="region" aria-label="线性高光平台">

| 模式 | 测得的线性高光平台 |
|---|---:|
| SDR 800 | 约 3.284 |
| N-Log 800 | 约 26.252 |

</div>

两个平台相差约 7.995 倍，也就是约 3 EV。两份素材的普通未饱和区域原本就基本等亮；区别主要出现在 SDR 已经到达上限，而 N-Log 仍能继续记录更亮层次的位置。

![高光实拍与线性剖面](/downloads/z9-nraw-sdr-nlog/images/highlight_plateau_comparison.png)

*两份素材共同降低 5 EV 显示。SDR 已经进入平台的部分，N-Log 仍有变化；最中心则是两种模式都已完全失去细节，符合过曝预期。*

**同 ISO 800、同光照环境、同曝光三要素下，N-Log 经当前流程解码后的可用高光上限，比 SDR 高约三档。**

注意：这不意味着：“总动态范围多三档”。

### 暗部：N-Log 暗部噪声较多

把两份素材匹配到相同亮度后，较亮墙面的时间噪声基本相当；进入门板暗部后，N-Log 的噪声逐渐更明显。

<div class="article-table-scroll article-table-compact" tabindex="0" role="region" aria-label="时间噪声标准差">

| 测量区域 | N-Log／SDR 时间噪声标准差 |
|---|---:|
| 左、右墙面 | 约 0.97、1.02 倍 |
| 门板中部 | 约 1.19 倍 |
| 门板下部 | 约 1.33 倍 |
| 头显暗部 | 约 1.74 倍 |

</div>

![同亮度 N-Log／SDR 时间噪声比热力图](/downloads/z9-nraw-sdr-nlog/images/noise_ratio_heatmap.png)

*热力图显示 N-Log／SDR 的时间噪声标准差比：1 表示相当，大于 1 表示 N-Log 噪声更大。沿用本轮亮度匹配，SDR 的线性值与噪声标准差统一乘以 1.0068。每个色块覆盖 64×64 原生像素，在横纵方向每隔 4 像素取一个原生样本，用连续 50 帧计算噪声，再汇总到色块；没有先缩图再测噪声。灰色为剔除的饱和、动态或不宜比较区域。A—E 的标注数值来自上表的完整测量区域。*

![同亮度暗部原生像素对照](/downloads/z9-nraw-sdr-nlog/images/shadow_native_pixel_comparison.png)

*两份素材共同提亮 4 EV。*

这一轮回答了最初的问题：**把相同曝光三要素的 SDR 和 N-Log 都输出成 Log3G10，并不会让两者成为相同的素材。** 支持尼康所说的“不同记录特性不能在后期直接互换”。

## 三、应该怎样 Match ISO？

第二轮最有解释力的，是下面两组三模式对照：

- **SDR 100／N-Log 800／SDR 800。**
- **SDR 500／N-Log 4000／SDR 4000。**

每组三者使用相同光圈和快门，因此**实际进光**相同。最后一个 ISO 的 SDR 作为参照。

### 低 ISO SDR 与 N-Log，在线性输出上约相差三档

在 f/5.6 的暗门板上：

- N-Log 800／SDR 100 的线性亮度比约为 **7.957**。
- N-Log 4000／SDR 500 的线性亮度比约为 **8.022**。

检查未产生高光剪切的亮纸面，在 f/5.6、f/4 和 f/2.8 情况下，亮度比也都接近八倍。

**N-Log 800 与 SDR 100、N-Log 4000 与 SDR 500，在未产生高光/暗部裁切区域的共同线性输出上，呈现约八倍的标度关系。**

### 匹配亮度后，噪声非常接近

把每组三者匹配到同一亮度，标定该组 N-Log 的暗门板噪声为 1，f/5.6 时得到：

**第一组：SDR 100／N-Log 800／SDR 800**

<div class="article-table-scroll article-table-compact" tabindex="0" role="region" aria-label="第一组同亮度噪声幅度">

| 模式与 ISO | 同亮度噪声幅度 |
|---|---:|
| SDR 100 | 1.026 |
| N-Log 800 | 1.000 |
| SDR 800 | 0.784 |

</div>

---

**第二组：SDR 500／N-Log 4000／SDR 4000**

<div class="article-table-scroll article-table-compact" tabindex="0" role="region" aria-label="第二组同亮度噪声幅度">

| 模式与 ISO | 同亮度噪声幅度 |
|---|---:|
| SDR 500 | 1.015 |
| N-Log 4000 | 1.000 |
| SDR 4000 | 1.041 |

</div>

SDR 100 与 N-Log 800 很接近，SDR 500 与 N-Log 4000 也很接近。

第一组中，SDR 800 更干净，因为已经切换到了第二档原生 ISO 之上。

第二组中，SDR 4000 没有重现这个优势，噪声反而略高于 N-Log 4000，因为 500 之上没有更高的原生 ISO，提升 ISO 引入的噪声开始显现。

### 高光响应

在第二轮已覆盖的曝光范围内，低 ISO SDR 与对应 N-Log 的高光变化接近。

例如 f/2.8 时，SDR 500 与 N-Log 4000 的过曝区域的面积，分别约为 11.2% 和 11.5%；但是 SDR 4000 已接近 99.8%。

![两组三模式的高光与噪声关系](/downloads/z9-nraw-sdr-nlog/images/TRIO_highlight_shadow.png)

*右侧噪声图以光圈为横轴、噪声比为纵轴，纵轴采用非线性刻度放大 1 附近的差异；刻度标签仍是实际比值，y＝1 参考线表示同组 N-Log 的噪声水平。*

![两组三模式实拍对照](/downloads/z9-nraw-sdr-nlog/images/TRIO_real_samples.jpg)

*两排均为 f/4 的纸面，分别对应两组三模式。每格直接从原视频提取 1960×1360 原生像素，按 1∶1 放入成图；打开原图可查看字迹和纹理。低 ISO SDR 在线性域增加 3 EV，每组三者共用显示转换；第二组另统一降低 2.32 EV，便于观看。*

*纸上的“4K、120p”等字样只是测试纹理，不是本次拍摄参数。*

## 四、这是否意味着 N-Log 800 就是 SDR 100 提亮三档？

可以作为描述现象的近似模型，但是不能直接下结论。

本次数据支持：

1. 两者在高光/阴影未裁切区域的线性输出约相差八倍。
2. 匹配亮度后，暗部噪声接近。
3. 测量范围内，高光响应接近。

**N-Log 800 的输出特征，与 SDR 100 经线性三档标度调整后的结果相似。**

### ISO 不变性

在本次 N-RAW／Premiere 解码流程中，把 SDR 100 后期推亮到对应亮度，并不等价于直接拍摄 SDR 800：前者的暗部噪声更大。

本次数据支持：**不同 ISO 区间、不同记录模式下，前期增益与后期提亮未必等价。**

本次数据不支持：Z9 这块 CMOS 具有 ISO 不变性。

## 五、同一块传感器，不只有一种工作方式

Z9 的一些公开测试告诉我们：不应把“同一块传感器”理解为“所有模式都以同样方式工作”。

Horshack 的逐行扫描测量中，Z9 照片约为 3.73 ms，8K 24p／30p 视频约为 14.4 ms；4K 60p 开关超采样时，扫描时间也明显不同。[原始读出速度测试](https://horshack-dpreview.github.io/RollingShutter/)

另一个相关案例来自 Z8。Alik Griffin 的实拍比较展示了部分 4K RAW 帧率之间的暗部偏色，并报告类似现象也出现在 ProRes RAW 中。[Alik Griffin 的 Z8 实测](https://alikgriffin.com/nikon-z8-color-shifts-4k24p-nraw/)

这类案例能支持“RAW 结果也可能随工作模式变化”的认识，但不是本次 Z9 SDR／N-Log 差异的机制证明。我没有在这一轮中专门复测 Z8 的偏色问题。相关视频可参考 Josh Sattin 的 [Nikon Z8 N-RAW — A Deep Dive](https://www.youtube.com/watch?v=YyyiKwlRXCA)。

## 六、旧 N-Log LUT 会不会剪掉素材原本保留的高光？

拍摄端保住高光之后，LUT 仍可能把它丢掉。

为检查这一点，我分别测试了：

- 旧 Z9 V01-00。
- 旧 Z9 V02-00。
- 新版 RED Technical，即 <code style="overflow-wrap: anywhere;">N-Log_BT2020_to_REC709_BT1886_size_33.cube</code>。

最直接的检查方法，是给 LUT 输入逐渐增加的中性信号，也就是 R＝G＝B，观察输出是否继续变化。

下表给出几个中性 N-Log 输入点。为方便阅读，只列输出 G 通道的归一化值：

<div class="article-table-scroll" tabindex="0" role="region" aria-label="LUT 中性输入与输出">

| 中性 N-Log 输入 | 旧 V01 | 旧 V02 | 新版 RED Technical |
|---|---:|---:|---:|
| 0.75 | 0.9436 | 1.0000 | 0.9093 |
| 0.80 | 0.9578 | 1.0000 | 0.9303 |
| 0.90 | 0.9822 | 1.0000 | 0.9599 |
| 1.00 | 1.0000 | 1.0000 | 0.9776 |

</div>

V01 的高光已经挤到很靠近白色的范围，但在输入端点之前仍持续变化。

V02 的问题更明确：**中性输入从 0.71875 到 1.0，三通道输出都已经完全相同，为 RGB［1，1，1］。** 在这段 N-Log 输入所对应的线性范围内，约 2.77 EV 的差异被映射成了同一个白值，这属于高光裁切。

新版 RED Technical 在本次中性高光测试中持续保留变化。输入 1.0 时输出约为 0.9776。

![三张 LUT 的高光曲线与实拍响应检查](/downloads/z9-nraw-sdr-nlog/images/RED_V01_V02_highlight_check.png)

### 实拍验证

我使用同一份 N-Log 实拍画面，分别应用三张 LUT。

图的上排是正常 LUT 输出，下排是**逐通道 RGB 高光诊断图**：分别对 R、G、B 执行 `clip((通道输出 − 0.85) / 0.15, 0, 1)`，将 0.85—1.00 区间展开到 0—1。

这种处理会放大原有的 RGB 通道差异，裁切也会改变饱和度与色相，因此下排出现的红、紫色**不能用于评价色准**。它只帮助观察：被压缩的亮部是否仍有变化。如果不同输入已经被合并成同一个白值，后面的拉伸无法重新分开它们。

![同一张纸面经过三种 LUT 的结果](/downloads/z9-nraw-sdr-nlog/images/RED_V01_V02_real_highlights.jpg)

*输入为同一份 N-RAW N-Log 拍摄时生成的 8bit MP4 代理。上排用于观察正常 LUT 输出；下排是逐通道拉伸诊断，会同时放大量化与压缩痕迹，不用于评价色准。剪切比例依据浮点计算，而非凭诊断图的颜色判断。*

新版 RED 和 V01 的高光裁切比例均为 0；V02 则从约 14.7% 到 99.4% 不等。以 N-Log 800、f/4 为例，约 31.1% 的纸面像素已经被高光裁切。

所以，旧 V02 确实有高光裁切问题。

### Log3G10 配合 RED IPP2，表现如何？

本次补充检查 RWG／Log3G10 配合 RED IPP2 的 Rec.709／BT.1886 输出 LUT，设置为 Medium Contrast、Medium Highlight Rolloff。

在与 N-Log 有效输入上端对应的中性亮度范围内，没有出现 V02 情况下的大量过曝区域。它与新版 N-Log Technical 的结果也很接近。本次工作流程证明，两种模式都可以解码到共同的 RWG／Log3G10，进行曝光和颜色处理，再使用匹配输入的 RED IPP2 显示转换。

## 七、这些结果对实际拍摄有什么用？

### HDR 和强高光场景，优先考虑 N-Log

如果需要保护灯具、窗外、反射等强高光，或者计划进行 HDR 制作，N-Log 的高光余量在本次同 ISO 对照中具有明确优势。

### SDR 内容、高光可控且暗部优先时，SDR 是合理起点

如果高光范围可控，并且更关心深暗部噪声，那么 SDR 值得优先考虑。第一轮同 ISO 800 的结果明确展示了这一优势。


## One more thing: N-Log Low 与 SDR64 的向右曝光选择

有人提过，对于 N-Log，应该尝试使用低 ISO，并且向右曝光：通过使用档位较低的 ND 和更大的光圈，让传感器吃到更多的光，再在后期把画面拉回需要的亮度。

### 从三档对应关系出发的猜测

前面的测试中，N-Log 800 与 SDR 100 在统一亮度后表现接近，线性输出呈现约八倍、也就是三档的标度关系。如果把这组对应关系继续向低 ISO 延伸，就会得到一个很自然的猜测：

**500 ÷ 8 ≈ 62.5, N-Log Lo0.7 约相当于 ISO500, 它会不会恰好对应 SDR64？**

如果这个猜测成立，Lo0.7 就可能在保留 N-Log 工作流程的同时，进入类似 SDR64 的记录状态，成为向右曝光的合适起点。不过，已有两组 ISO 配对还不足以证明所有 Low 档位都遵循相同规律；这次补拍就是为了检查这一步外推。

### 直接检查 RAW 后，Lo0.7 仍然接近 N-Log 800

补拍包含 SDR100、SDR64、N-Log800、N-Log Lo0.7 四种设置。每条先拍黑场，再依次拍摄 f/7.1、f/5.6、f/4.5、f/4、f/3.5、f/2.8 六档光圈。


![低 ISO RAW 响应与高光上尾对照](/downloads/z9-nraw-sdr-nlog/images/ONE_MORE_THING_low_iso_raw.png)

*左图为参照区信号比值；右图为减去黑位后，亮斑区域的最亮部分的响应。横轴是光圈标签，未将其强行当作精确的实际进光量。*

**因此，“Lo0.7 会对应 SDR64”这个猜测没有得到支持。N-Log Lo0.7 更接近 N-Log 800。**


### 暗部改善，来自把高光余量用来增加进光

这让寻找向右曝光档位的问题变得更具体：除了试 N-Log 的 Low，是否也应该认真考虑 SDR64，让高光余量转化为更多的实际曝光？

这个方向也与 Photons to Photos 的 Z9 照片动态范围曲线相容：ISO64 附近的 PDR 约为 11.27 EV，ISO100 约为 10.61 EV，低 ISO 端可以容纳更宽的明暗跨度。但它是照片 RAW 的测量，使用特定暗部信噪比门槛和观看尺度归一化，不能直接拿来给本次 N-RAW 标注动态范围；图中的照片 ISO800 也不能直接对应这里的 N-Log800。[Z9 PDR 曲线](https://www.photonstophotos.net/Charts/PDR.htm#Nikon%20Z%209) · [PDR 定义](https://www.photonstophotos.net/GeneralTopics/Sensors_%26_Raw/Sensor_Analysis_Primer/Engineering_and_Photographic_Dynamic_Range.htm)

### 光线充足时，把 SDR64 作为认真尝试的起点

对于外部环境光充足、能够控制进光的场景，我现在会大胆尝试 **SDR64**：在快门满足运动表现、光圈满足景深要求的前提下，用减光更少的 ND，或在允许时开大光圈，逐步增加实际曝光；以需要保留的高光仍有层次为边界，再把素材统一到需要的输出亮度。具体 ND 档位和曝光量由场景决定。

**N-Log 的 Low 档并不应被预设为优于 SDR64 的向右曝光选择。** 本次直接测过的 Lo0.7 没有表现出 SDR64 的较晚触顶优势；这次找到的是一个值得使用的曝光起点：**光线充足且高光可控时，SDR64 可以兼顾亮部保留和暗部改善。**

## 附录：数据、方法与可复核资料

本次测试没有条件测定传感器绝对动态范围。相机内部的模拟增益、读出架构和模式实现，仍属于需要进一步验证的问题。

前两轮 Premiere 导出片的噪声采用连续 50 帧的时间标准差，去除固定的逐像素平均及逐帧公共亮度波动。第二轮 49 个点中，相邻帧差分法与时间标准差法的结果基本一致；七个代表点另取不重叠的 50 帧复核，同一门板噪声幅度变化最大约为 1.24%。

One more thing 的直接 RAW 补充使用独立的方法：旧素材暗部测量为连续 16 帧；新一轮每条使用八帧黑场及每个光圈三个间隔亮场样本，后者用于响应与稳定性比较。两轮的场景和偏置校正不同，不能直接横比绝对 RAW 数值。具体方法与保留的测量值见下列补充附件。


<div class="article-table-scroll article-table-compact" tabindex="0" role="region" aria-label="公开数据与方法附件">

| 内容 | 文件 |
|---|---|
| 脱敏说明与样本代号 | {% url_for "公开样本表" /downloads/z9-nraw-sdr-nlog/data/public_sample_catalog.json %} |
| 第一轮拍摄条件、解码方法、高光与噪声结果 | {% url_for "脱敏报告" /downloads/z9-nraw-sdr-nlog/data/FINAL_CMoff_comparison_zh.txt %} · {% url_for "测量数据" /downloads/z9-nraw-sdr-nlog/data/comparison_results.json %} |
| 色彩管理及导出核验 | {% url_for "导出核验结果" /downloads/z9-nraw-sdr-nlog/data/CMoff_validation_summary.json %} |
| 同亮度噪声热力图 | {% url_for "方法与统计摘要" /downloads/z9-nraw-sdr-nlog/data/noise_ratio_heatmap.json %} · {% url_for "区域数值与掩膜" /downloads/z9-nraw-sdr-nlog/data/noise_ratio_heatmap.npz %} |
| 两组纸面原生裁切来源 | {% url_for "样本代号、帧号、裁切位置与显示设置" /downloads/z9-nraw-sdr-nlog/data/trio_native_crop_sources.json %} |
| 时间噪声定义与交叉检查 | {% url_for "第一轮时间噪声数据" /downloads/z9-nraw-sdr-nlog/data/temporal_metrics.json %} |
| 第二轮完整 49 点结果 | {% url_for "49 点数据" /downloads/z9-nraw-sdr-nlog/data/ROUND2_expanded_results.json %} · {% url_for "数字矩阵" /downloads/z9-nraw-sdr-nlog/images/ROUND2_49_noise_highlight_matrix.png %} |
| 第二轮实拍与原生像素 | {% url_for "49 点纸面对照" /downloads/z9-nraw-sdr-nlog/images/ROUND2_all49_paper_contact.jpg %} · {% url_for "七组代表样本" /downloads/z9-nraw-sdr-nlog/images/ROUND2_seven_representative_samples.jpg %} |
| LUT 文件名称、来源与校验信息 | {% url_for "LUT 清单" /downloads/z9-nraw-sdr-nlog/data/lut_inventory.json %} |
| V01、V02 与新版 RED 的严格剪切检查 | {% url_for "完整数值结果" /downloads/z9-nraw-sdr-nlog/data/RED_technical_clipping_comparison.json %} |
| RWG／Log3G10 配合 RED IPP2 的补充检查 | {% url_for "中性响应数据" /downloads/z9-nraw-sdr-nlog/data/blog_direct_IPP2_neutral_check.json %} |
| One more thing 低 ISO 响应与高光复核 | {% url_for "完整统计与比值" /downloads/z9-nraw-sdr-nlog/data/low_iso_raw_response.json %} |
| 低 ISO 补拍条件、取样及方法 | {% url_for "方法与公开样本" /downloads/z9-nraw-sdr-nlog/data/low_iso_capture_method.json %} |
| SDR64 增加曝光后的暗部补充 | {% url_for "16 帧测量及同进光对照" /downloads/z9-nraw-sdr-nlog/data/low_iso_shadow_followup.json %} |

</div>

编码与工作流程依据可参考 [RED 的 RWG／Log3G10 白皮书](https://docs.red.com/955-0187/PDF/915-0187%20Rev-C%20%20%20RED%20OPS,%20White%20Paper%20on%20REDWideGamutRGB%20and%20Log3G10.pdf)、[尼康 N-Log 规范](https://download.nikonimglib.com/archive3/deHU500g8zYS03Crat379bMLUc33/N-Log_Specification_%28En%2901.pdf)，以及[尼康的 Premiere Pro RAW 编辑指南](https://onlinemanual.nikonimglib.com/technicalguide/log_raw/video_recording_editing/en/edit_with_premiere_pro_14.html)。
