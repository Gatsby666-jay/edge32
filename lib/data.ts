/* ============================================================
   EDGE32 — 数据层（与静态版内容完全一致）
   ------------------------------------------------------------
   维护入口：课程 / 网盘 / 工具 / 社区全部集中在此文件，
   新增内容只需改这里，页面组件自动渲染。
   ============================================================ */

export type Platform = "bilibili" | "youtube" | "mooc";

export interface Stage {
  id: string;
  num: string;
  name: string;
  en: string;
  duration: string;
  goal: string;
  points: string[];
  courses: string[];
}

export interface Course {
  id: string;
  title: string;
  author: string;
  platform: Platform;
  url: string;
  meta: string;
  desc: string;
  tags: string[];
}

export interface PanResource {
  title: string;
  desc: string;
  url: string;
  pwd: string;
  tag: string;
}

export interface LinkItem {
  name: string;
  desc: string;
  url: string;
  tag?: string;
}

export interface Pain {
  title: string;
  desc: string;
  icon: "grid" | "split" | "chip" | "brain" | "bookmark";
}

export interface Note {
  id: string;
  title: string;
  content: string;
  stage: string;
  updated: number;
}

export const STAGES: Stage[] = [
  {
    id: "stage-00",
    num: "00",
    name: "C语言与电子基础",
    en: "FOUNDATION",
    duration: "约 4 周",
    goal: "能熟练编写嵌入式风格的 C 代码，看得懂原理图与芯片数据手册。",
    points: [
      "C 语言核心：指针、结构体、枚举、位运算、内存视角",
      "嵌入式 C 思维：寄存器即变量、资源受限下的写法",
      "基础电子知识：电压/电流/欧姆定律、上拉下拉、常见元器件",
      "看懂原理图与 Datasheet，会查引脚定义与电气参数",
      "工具链初识：VS Code / Keil 工程结构与编译流程",
    ],
    courses: ["c-darkhorse"],
  },
  {
    id: "stage-01",
    num: "01",
    name: "STM32 入门",
    en: "GETTING STARTED",
    duration: "约 6 周",
    goal: "独立完成 GPIO / 中断 / 定时器编程，真正理解时钟系统。",
    points: [
      "开发环境：STM32CubeMX + HAL 库（或标准库 SPL）",
      "时钟树 RCC：系统时钟、倍频、各总线时钟来源",
      "GPIO 输入输出：LED 点灯、按键检测、上下拉配置",
      "外部中断 EXTI 与 NVIC 嵌套向量中断控制器",
      "定时器 TIM：基本定时、PWM 输出、输入捕获",
      "串口 UART：printf 重定向 printf 到串口日志",
      "推荐开发板：STM32F103C8T6 最小系统板 / Nucleo-F103R",
    ],
    courses: ["st-jiangxie", "st-keysking", "st-cubemx"],
  },
  {
    id: "stage-02",
    num: "02",
    name: "外设与通信协议",
    en: "PERIPHERALS",
    duration: "约 6 周",
    goal: "掌握常用外设与通信协议，能独立驱动传感器与显示模块。",
    points: [
      "I2C / SPI 协议时序与传感器驱动（MPU6050、OLED、温湿度模块）",
      "ADC 多通道采样：规则组 / 注入组、DMA 搬运数据",
      "DMA 原理：外设 ↔ 内存 ↔ 存储器，解放 CPU",
      "看门狗 IWDG/WWDG、RTC 实时时钟、低功耗模式初探",
      "状态机编程思想：菜单与多界面切换（枚举 + switch）",
      "阶段项目：环境监测仪 / 串口示波器 / 数字电压表",
    ],
    courses: ["st-wildfire", "st-alientek", "st-hit"],
  },
  {
    id: "stage-03",
    num: "03",
    name: "RTOS 实时操作系统",
    en: "RTOS",
    duration: "约 4 周",
    goal: "用 FreeRTOS 组织清晰的多任务程序，理解并发与同步。",
    points: [
      "任务调度：优先级、时间片、任务状态迁移",
      "任务间通信：队列、信号量、互斥量、事件组",
      "内存管理：heap_4 与动态分配的取舍",
      "临界区与中断安全：何时该关中断",
      "裸机 vs RTOS：什么时候真的需要上系统",
      "阶段项目：多传感器采集 + OLED 显示 + 串口上报",
    ],
    courses: ["os-keysking", "os-wildfire", "os-alientek"],
  },
  {
    id: "stage-04",
    num: "04",
    name: "边缘 AI 入门",
    en: "TINYML",
    duration: "约 8 周",
    goal: "把一个神经网络模型部署到 STM32 上，实现端侧实时推理。",
    points: [
      "机器学习基础：训练/推理、分类与回归、过拟合",
      "轻量级网络：DSCNN、MobileNet-Tiny、全连接网络",
      "特征提取：MFCC（音频）、FFT（振动）、归一化",
      "模型压缩：INT8 量化、剪枝、知识蒸馏",
      "工具链：TensorFlow Lite for Microcontrollers / CMSIS-NN",
      "STM32Cube.AI（X-CUBE-AI）：模型 → C 代码全流程",
      "Edge Impulse：零代码完成采集-训练-部署一条龙",
      "阶段项目：关键词唤醒 / 手势识别 / 振动异常检测",
    ],
    courses: ["ai-bili", "ai-st-mooc", "ai-ei", "ai-philslab"],
  },
  {
    id: "stage-05",
    num: "05",
    name: "项目实战与工程化",
    en: "PROJECTS",
    duration: "持续进行",
    goal: "完成 2-3 个完整项目并沉淀成作品集，形成工程化习惯。",
    points: [
      "项目一：TinyML 关键词唤醒（麦克风 + STM32F4）",
      "项目二：加速度计手势识别遥控器",
      "项目三：设备振动异常检测（预测性维护场景）",
      "代码架构：分层设计、模块化、HAL 与应用解耦",
      "Git 版本管理、README 与文档习惯",
      "进阶方向：OTA 升级、功耗优化、量化再压缩",
    ],
    courses: ["proj-all"],
  },
];

export const COURSES: Course[] = [
  // ---------- B站 ----------
  {
    id: "c-darkhorse",
    title: "C语言入门教程",
    author: "黑马程序员",
    platform: "bilibili",
    url: "https://www.bilibili.com/video/BV1Xa4y1k7LU/",
    meta: "体系课 · 已完结",
    desc: "C 语言体系化入门，重点学到数组与指针即可匹配嵌入式需求。",
    tags: ["C语言", "零基础"],
  },
  {
    id: "st-jiangxie",
    title: "STM32入门教程-2023版",
    author: "江协科技",
    platform: "bilibili",
    url: "https://www.bilibili.com/video/BV1th411z7sn/",
    meta: "50 集 · 已完结 · 单集最高 2260 万播放",
    desc: "口碑极佳的循序渐进式教程，标准库风格，官网可免费下载全部源码与资料。",
    tags: ["STM32", "标准库", "强烈推荐"],
  },
  {
    id: "st-keysking",
    title: "STM32入门教程",
    author: "keysking",
    platform: "bilibili",
    url: "https://www.bilibili.com/video/BV12v4y1y7uV/",
    meta: "合集 · 已完结",
    desc: "节奏明快、演示直接，适合作为第二套课程快速过一遍建立整体印象。",
    tags: ["STM32", "HAL库"],
  },
  {
    id: "st-cubemx",
    title: "STM32CubeMX + HAL库开发教程",
    author: "社区精选",
    platform: "bilibili",
    url: "https://www.bilibili.com/video/BV1R7411s7PW/",
    meta: "合集",
    desc: "现代 STM32 开发方法：图形化配置引脚时钟，自动生成 HAL 工程。",
    tags: ["CubeMX", "HAL库"],
  },
  {
    id: "st-wildfire",
    title: "STM32F103 标准外设库（SPL）开发教学全集",
    author: "野火",
    platform: "bilibili",
    url: "https://www.bilibili.com/video/BV1yW411Y7Gw/",
    meta: "全集",
    desc: "寄存器与 HAL 双视角对照讲解，配套文档《零死角玩转STM32》极为详尽。",
    tags: ["STM32", "SPL", "资料全"],
  },
  {
    id: "st-alientek",
    title: "手把手教你学STM32（HAL库全集）",
    author: "正点原子",
    platform: "bilibili",
    url: "https://www.bilibili.com/video/BV1Lx411Z7Qa/",
    meta: "全集 · 真人出镜",
    desc: "国内最经典的 STM32 教学系列之一，从寄存器到 HAL 库全覆盖，配套手册权威。",
    tags: ["STM32", "HAL库", "经典"],
  },
  {
    id: "st-hit",
    title: "STM32单片机应用与开发",
    author: "哈尔滨工业大学",
    platform: "bilibili",
    url: "https://www.bilibili.com/video/BV1Px411B7VT/",
    meta: "高校课程",
    desc: "高校系统课视角，知识体系完整，适合想打牢理论基础的学习者。",
    tags: ["STM32", "高校课程"],
  },
  {
    id: "os-keysking",
    title: "FreeRTOS教程",
    author: "keysking",
    platform: "bilibili",
    url: "https://www.bilibili.com/video/BV1mhWqzFEzn/",
    meta: "合集",
    desc: "讲解清晰易懂，被许多学习者称为「全网最好的 FreeRTOS 教程」。",
    tags: ["FreeRTOS", "RTOS"],
  },
  {
    id: "os-wildfire",
    title: "FreeRTOS内核实现与应用开发实战指南",
    author: "野火",
    platform: "bilibili",
    url: "https://www.bilibili.com/video/av57449565",
    meta: "系列视频",
    desc: "先带你从零写内核，再讲应用开发，理解极其深刻。",
    tags: ["FreeRTOS", "内核"],
  },
  {
    id: "os-alientek",
    title: "FreeRTOS源码详解与应用开发",
    author: "正点原子",
    platform: "bilibili",
    url: "https://www.yuanzige.com/",
    meta: "原子哥在线平台 · 免费",
    desc: "源码级讲解，配合正点原子开发板，配套书籍《FreeRTOS源码详解与应用开发》。",
    tags: ["FreeRTOS", "源码"],
  },
  {
    id: "ai-bili",
    title: "AI+STM32：如何将AI模型部署到STM32（TinyML）",
    author: "小轩的电子世界",
    platform: "bilibili",
    url: "https://www.bilibili.com/video/BV1CSsSzbE1p/",
    meta: "合集 · 44 分钟实操",
    desc: "从零演示把神经网络塞进 STM32F103，含 CubeMX 生成 Keil 工程全流程。",
    tags: ["TinyML", "STM32Cube.AI"],
  },
  {
    id: "ai-st-mooc",
    title: "STM32Cube.AI Workshop（官方 MOOC）",
    author: "STMicroelectronics",
    platform: "mooc",
    url: "https://www.st.com/content/st_com/en/support/learning/stm32-education/stm32-moocs/STM32CubeAI_workshop_MOOC.html",
    meta: "约 120 分钟 · 官方免费",
    desc: "ST 官方动手实验课：用 CubeMX + X-CUBE-AI 在 STM32L4 上搭建神经网络系统。",
    tags: ["官方", "Cube.AI", "MOOC"],
  },
  {
    id: "ai-ei",
    title: "Edge Impulse 官方教程与文档",
    author: "Edge Impulse",
    platform: "mooc",
    url: "https://docs.edgeimpulse.com/",
    meta: "在线平台 · 免费额度",
    desc: "浏览器端完成数据采集、训练、量化到部署，零代码跑通第一个 TinyML 项目。",
    tags: ["Edge Impulse", "零代码"],
  },
  {
    id: "ai-philslab",
    title: "STM32 / DSP / FreeRTOS 项目级教程",
    author: "Phil's Lab",
    platform: "youtube",
    url: "https://www.youtube.com/@PhilsLab",
    meta: "英文 · 持续更新",
    desc: "硬件 bring-up、DMA、USB、DSP 与真实项目调试，技术含量极高的进阶频道。",
    tags: ["YouTube", "进阶", "DSP"],
  },
  {
    id: "ai-coursera",
    title: "Introduction to Embedded Systems Software and Development Environments",
    author: "Coursera（科罗拉多大学）",
    platform: "mooc",
    url: "https://www.coursera.org/learn/introduction-embedded-systems",
    meta: "英文 · 可旁听",
    desc: "嵌入式软件与开发环境系统课，打牢软件工程基础。",
    tags: ["Coursera", "理论"],
  },
  // ---------- YouTube ----------
  {
    id: "yt-controllerstech",
    title: "STM32 HAL库系统教程",
    author: "Controllers Tech",
    platform: "youtube",
    url: "https://www.youtube.com/@ControllersTech",
    meta: "英文 · 系列",
    desc: "从 GPIO 到各外设的 HAL 库教程，节奏友好，适合刚上手时对照学习。",
    tags: ["YouTube", "HAL库"],
  },
  {
    id: "yt-digikey",
    title: "Introduction to RTOS（FreeRTOS 系列）",
    author: "DigiKey / Shawn Hymel",
    platform: "youtube",
    url: "https://www.youtube.com/@digikey",
    meta: "英文 · 系列",
    desc: "调度、队列、信号量、死锁与优先级反转讲得极其清楚，RTOS 原理首选。",
    tags: ["YouTube", "RTOS", "原理"],
  },
  {
    id: "yt-st",
    title: "STM32 官方培训与研讨会",
    author: "STMicroelectronics",
    platform: "youtube",
    url: "https://www.youtube.com/@STMicroelectronics",
    meta: "英文 · 官方",
    desc: "官方网络研讨会、新品与 AI 功能包介绍，了解生态风向。",
    tags: ["YouTube", "官方"],
  },
  {
    id: "yt-miro",
    title: "Modern Embedded Systems Programming Course",
    author: "Miro Samek",
    platform: "youtube",
    url: "https://www.state-machine.com/embedded/",
    meta: "英文 · 课程官网",
    desc: "Cortex-M 运行机理、C runtime、状态机与 active object，远超「怎么用」的深度。",
    tags: ["YouTube", "深度", "状态机"],
  },
  {
    id: "proj-all",
    title: "综合运用 · 无单一课程",
    author: "你自己",
    platform: "mooc",
    url: "https://github.com/topics/awesome-tinyml",
    meta: "项目导向",
    desc: "从 Awesome-TinyML 等开源列表找灵感，把前五个阶段的知识串成完整作品。",
    tags: ["项目", "开源"],
  },
];

export const PAN_RESOURCES: PanResource[] = [
  {
    title: "STM32 学习资料合集（本站整理）",
    desc: "教程源码、数据手册、开发软件与学习文档打包。",
    url: "https://pan.baidu.com/s/1h_UjuQKDX9IpP-U1Effbsw",
    pwd: "dspb",
    tag: "综合",
  },
  {
    title: "野火《FreeRTOS内核实现与应用开发实战》",
    desc: "教程全文 + 全部配套源码，适配野火各开发板。",
    url: "https://pan.baidu.com/s/1za6pEITmB9pX-YjYUMiFug",
    pwd: "12jz",
    tag: "FreeRTOS",
  },
  {
    title: "野火 FreeRTOS 系列视频",
    desc: "与教程配套的视频课程下载。",
    url: "https://pan.baidu.com/s/1l7YrIP1Suz7fam6xdxYsyQ",
    pwd: "cw0p",
    tag: "FreeRTOS",
  },
  {
    title: "正点原子《FreeRTOS源码详解与应用开发》",
    desc: "书籍 PDF 与源码，配合原子哥开发板使用。",
    url: "https://pan.baidu.com/s/1hFtCCo_PV85kFnFGudM7bg",
    pwd: "4rub",
    tag: "FreeRTOS",
  },
];

export const TOOLS: LinkItem[] = [
  { name: "STM32CubeIDE", desc: "ST 官方免费 IDE，集成 CubeMX，推荐主力开发环境", url: "https://www.st.com/en/development-tools/stm32cubeide.html", tag: "IDE" },
  { name: "STM32CubeMX", desc: "图形化配置引脚与时钟，一键生成初始化代码", url: "https://www.st.com/en/development-tools/stm32cubemx.html", tag: "配置" },
  { name: "STM32CubeProgrammer", desc: "官方烧录工具，支持 ST-Link / DFU / UART", url: "https://www.st.com/en/development-tools/stm32cubeprog.html", tag: "烧录" },
  { name: "Keil MDK", desc: "经典 ARM 开发 IDE，Community 版免费，许多教程使用", url: "https://www.keil.com/demo/eval/c151.htm", tag: "IDE" },
  { name: "VS Code + PlatformIO", desc: "现代轻量组合，插件生态丰富，适合有基础后使用", url: "https://platformio.org/", tag: "IDE" },
  { name: "STM32Cube.AI", desc: "官方神经网络模型转换工具（X-CUBE-AI 扩展包）", url: "https://www.st.com/en/embedded-software/x-cube-ai.html", tag: "AI" },
  { name: "Edge Impulse", desc: "在线 TinyML 开发平台，采集-训练-部署一条龙", url: "https://www.edgeimpulse.com/", tag: "AI" },
  { name: "TensorFlow Lite Micro", desc: "谷歌官方微控制器推理框架", url: "https://github.com/tensorflow/tflite-micro", tag: "AI" },
  { name: "CMSIS-NN", desc: "ARM 官方神经网络内核，发挥 Cortex-M DSP 性能", url: "https://github.com/ARM-software/CMSIS-NN", tag: "AI" },
  { name: "STM32CubeMonitor", desc: "实时变量跟踪与可视化，调试推理过程很好用", url: "https://www.st.com/en/development-tools/stm32cubemonitor.html", tag: "调试" },
];

export const COMMUNITY: LinkItem[] = [
  { name: "正点原子论坛", desc: "最活跃的中文 STM32 社区之一，资料下载与答疑", url: "http://www.openedv.com/" },
  { name: "正点原子资料库", desc: "各开发板教程与源码在线文档", url: "http://www.openedv.com/docs/index.html" },
  { name: "野火论坛", desc: "野火官方社区，教程与问题讨论", url: "https://www.firebbs.cn/forum-stm32-1.html" },
  { name: "野火资料库", desc: "在线文档齐全，搜索方便", url: "https://ebf-products.readthedocs.io/zh_CN/latest/index.html" },
  { name: "ST 中文社区", desc: "STM32 官方中文社区，含部分官方资料翻译", url: "https://www.stmcu.org.cn/" },
  { name: "ST 官网", desc: "数据手册、参考手册、应用笔记的唯一权威来源", url: "https://www.st.com/zh/microcontrollers-microprocessors.html" },
  { name: "Embedded Engineering Roadmap", desc: "GitHub 上最全的嵌入式学习路线图", url: "https://github.com/m3y54m/Embedded-Engineering-Roadmap" },
  { name: "Awesome TinyML", desc: "TinyML 工具、论文与项目精选列表", url: "https://github.com/awesome-tinyml/awesome-tinyml" },
];

export const PAINS: Pain[] = [
  { title: "资料太多，无从下手", desc: "教程、手册、论坛帖收藏了一堆，却不知道该先看哪一门、按什么顺序看。", icon: "grid" },
  { title: "寄存器 vs HAL 库", desc: "直接学 HAL 不懂原理，直接啃寄存器又太劝退，两种风格反复横跳。", icon: "split" },
  { title: "外设学完就忘", desc: "GPIO、定时器、DMA 单独都懂，合起来做项目就懵，缺少把知识串起来的项目。", icon: "chip" },
  { title: "AI 门槛高", desc: "想结合边缘 AI，却不知道模型怎么训练、怎么量化、怎么塞进单片机。", icon: "brain" },
  { title: "笔记散落各处", desc: "学了就忘，看过就扔，缺少沉淀与复盘，半年后不得不重头再来。", icon: "bookmark" },
];

export const MARQUEE_WORDS: [string, boolean][] = [
  ["STM32", true], ["CORTEX-M", false], ["HAL 库", false], ["寄存器", false],
  ["TINYML", true], ["EDGE AI", true], ["FREERTOS", false], ["CMSIS-NN", false],
  ["STM32CUBE.AI", false], ["EDGE IMPULSE", false], ["DMA", false], ["I2C / SPI", false],
  ["关键词唤醒", false], ["手势识别", false], ["低功耗", false], ["边缘推理", true],
];

export const PLATFORMS: { key: "all" | Platform; label: string }[] = [
  { key: "all", label: "全部 ALL" },
  { key: "bilibili", label: "B站" },
  { key: "youtube", label: "YouTube" },
  { key: "mooc", label: "官方 / MOOC" },
];

export const PLAT_NAME: Record<Platform, string> = {
  bilibili: "BILIBILI",
  youtube: "YOUTUBE",
  mooc: "OFFICIAL",
};

export const courseById = (id: string): Course | undefined =>
  COURSES.find((c) => c.id === id);

export const stageName = (id: string): string => {
  const s = STAGES.find((x) => x.id === id);
  return s ? `${s.num} · ${s.name}` : "";
};

export const ROAD_KEY = "edge32.roadmap.v1";
export const NOTES_KEY = "edge32.notes.v1";
