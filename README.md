# 智能网页信息提取器 · Smart Web Extractor

> AI 驱动的 Chrome 浏览器插件 —— 在 30 秒内从冗长网页中提取干货精华：去广告、取正文、收图片、析表格，一键生成结构化摘要并导出。

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome&logoColor=white" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Chrome-%E2%89%A5114-success?logo=googlechrome&logoColor=white" alt="Chrome >= 114">
  <img src="https://img.shields.io/badge/AI-DeepSeek%20%7C%20%E9%80%9A%E4%B9%89%E5%8D%83%E9%97%AE-8A2BE2" alt="AI Providers">
  <img src="https://img.shields.io/badge/i18n-zh--CN%20%7C%20en-informational" alt="i18n">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
</p>

---

## 为什么做这个

传统「稍后阅读」的结局往往是：网页存进收藏夹，然后再也不看。超过 80% 的长文在被收藏后就此吃灰。

```
传统方式：打开网页 → 阅读 10 分钟 → 手动摘抄笔记 → 存入收藏夹吃灰
本插件：  打开网页 → 触发提取 → AI 30 秒生成摘要 → 导出带走
```

目标很直接：**花 1/10 的时间，拿到 90% 的信息价值。**

---

## 核心功能

| 功能 | 说明 |
|------|------|
| **正文提取** | 自动识别主内容区，保留标题层级与段落结构，响应 < 500ms |
| **图片采集** | 网格化缩略图预览，支持批量打包 ZIP 下载 |
| **表格解析** | 同时识别标准 `<table>` 与 `div` 模拟表格，导出 CSV |
| **广告过滤** | 静默过滤 + 预览标记双模式 |
| **AI 摘要** | 接入 DeepSeek / 通义千问，内置 3 种摘要模板 |
| **多格式导出** | TXT / Markdown / Word |
| **双语界面** | 简体中文 / English，随浏览器语言自动切换 |

### 快捷键

| 操作 | 快捷键 |
|------|--------|
| 打开 / 关闭提取面板 | `Ctrl+Shift+E`（macOS：`Command+Shift+E`） |
| 关闭面板 | `Escape` |
| 发送 AI 对话 | `Ctrl+Enter` |

---

## 架构流程

![架构流程图](%E6%B5%81%E7%A8%8B%E5%9B%BE.png)

---

## 安装使用

本插件尚未上架 Chrome 应用商店，请以开发者模式加载：

1. 克隆或下载本仓库
   ```bash
   git clone https://github.com/122245951-lab/smart-web-extractor.git
   ```
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启右上角的 **开发者模式**
4. 点击 **加载已解压的扩展程序**
5. 选择仓库中的 **`plugin/`** 目录（注意：不是仓库根目录）

### 首次使用

1. 在任意网页右侧点击蓝色 **「提取」** 边沿标签，唤出面板
2. 进入设置，选择 AI 服务商（DeepSeek 或通义千问），填入自己的 API Key
3. 点击 **开始提取**，插件生成结构化摘要

> 需要自备 AI 服务商的 API Key。插件不提供、也不代理任何 AI 额度。

---

## 目录结构

```
.
├── plugin/                      # ✅ 浏览器插件本体（加载这个目录）
│   ├── manifest.json            #    Manifest V3 配置
│   ├── background/              #    Service Worker
│   ├── content/                 #    内容脚本：正文/表格/图片提取、广告过滤、悬浮面板
│   ├── lib/                     #    AI 适配、存储加密、Markdown、ZIP、规则引擎等
│   ├── pages/settings/          #    设置页
│   ├── icons/                   #    插件图标
│   └── _locales/                #    zh_CN / en 多语言文案
│
├── docs/                        # 交互原型与设计稿（React + Vite + TypeScript）
│   ├── src/                     #    浏览器模拟器 + 插件抽屉原型组件
│   ├── api/                     #    原型用的服务端接口示例
│   ├── figma-design-spec.md     #    设计规范
│   └── optimized-prototype.html #    单文件可直接打开的原型
│
├── PRD-业务需求规格说明书.md       # 完整产品需求文档
├── TECHNICAL-DESIGN-技术架构设计.md # 技术架构设计文档
└── 流程图.png                    # 架构流程图
```

---

## 技术栈

**插件本体**：原生 JavaScript + Chrome Manifest V3，零运行时框架依赖，无需构建步骤。

**原型 / 设计稿**（`docs/`）：React + TypeScript + Vite。

```bash
cd docs
npm install
npm run dev
```

---

## 隐私与安全

- **API Key 加密存储**：采用 AES-GCM-256 本地加密，不以明文落盘
- **全程本地运行**：网页解析在浏览器内完成，不经过任何第三方服务器
- **数据最小化**：内容仅通过 HTTPS 发往用户自行配置的 AI 服务商
- **权限收敛**：`<all_urls>` 置于可选主机权限（optional host permissions），按需授权；网络请求由 CSP 白名单限制在已配置的 AI 域名

---

## 文档

| 文档 | 内容 |
|------|------|
| [PRD-业务需求规格说明书.md](PRD-业务需求规格说明书.md) | 产品定位、目标用户、功能需求清单、用户旅程、验收清单 |
| [TECHNICAL-DESIGN-技术架构设计.md](TECHNICAL-DESIGN-技术架构设计.md) | 模块划分、数据流、加密方案、AI 适配层设计 |
| [docs/figma-design-spec.md](docs/figma-design-spec.md) | UI 设计规范 |

---

## 兼容性

Chrome / Edge 等 Chromium 内核浏览器，版本 **≥ 114**。

---

## License

[MIT](LICENSE) © Jialong
