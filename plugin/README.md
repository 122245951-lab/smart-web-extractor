# 智能网页信息提取器 · Smart Web Extractor

> AI 驱动的 Chrome 浏览器插件（Manifest V3）—— 在 30 秒内从冗长网页中提取干货精华。

本目录是插件的**可加载本体**。仓库根目录的 [`README.md`](../README.md) 是项目总览，本文档聚焦插件本身的安装、结构与配置。

---

## 安装

插件尚未上架 Chrome 应用商店，请以开发者模式加载：

1. 打开 Chrome，访问 `chrome://extensions/`
2. 开启右上角的 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择本目录（`plugin/`，注意不是仓库根目录）

要求 Chromium 内核浏览器版本 **≥ 114**。

## 首次使用

1. 在任意网页右侧点击蓝色 **「提取」** 边沿触发球，唤出面板
2. 进入设置，选择 AI 服务商（DeepSeek 或通义千问），填入自己的 API Key
3. 点击 **开始提取**，插件生成结构化摘要

> 需要自备 AI 服务商的 API Key。插件不提供、也不代理任何 AI 额度。

---

## 功能

| 功能 | 说明 |
|------|------|
| 正文提取 | 自动识别主内容区，保留标题层级与段落结构，响应 < 500ms |
| 图片采集 | 网格化缩略图预览，支持批量打包 ZIP 下载 |
| 表格解析 | 同时识别标准 `<table>` 与 `div` 模拟表格，导出 CSV |
| 广告过滤 | 静默过滤 + 预览标记双模式 |
| AI 摘要 | 接入 DeepSeek / 通义千问，内置 3 种摘要模板 |
| 多格式导出 | TXT / Markdown / Word |
| 双语界面 | 简体中文 / English，随浏览器语言自动切换 |

### 快捷键

| 操作 | 快捷键 |
|------|--------|
| 打开 / 关闭提取面板 | `Ctrl+Shift+E`（macOS：`Command+Shift+E`） |
| 关闭面板 | `Escape` |
| 发送 AI 对话 | `Ctrl+Enter` |

---

## 目录结构

```
plugin/
├── manifest.json            # Manifest V3 配置（版本、权限、CSP 白名单）
├── background/
│   └── service-worker.js    # 后台 Service Worker
├── content/
│   ├── extractor.js         # 正文提取
│   ├── ad-filter.js         # 广告过滤
│   ├── table-parser.js      # 表格解析
│   ├── image-collector.js   # 图片采集
│   ├── floating-panel.js    # 悬浮面板（UI 主体）
│   ├── content.js           # 内容脚本入口与编排
│   └── content.css          # 源站注入样式
├── lib/
│   ├── utils.js             # 通用工具
│   ├── i18n.js              # 多语言文案加载
│   ├── storage.js           # 存储层（含 AES-GCM 加密）
│   ├── ai-providers.js      # AI 服务商适配层
│   ├── markdown.js          # Markdown 解析与渲染
│   ├── rule-engine.js       # 站点规则引擎
│   ├── exporter.js          # 导出器（TXT / MD / Word）
│   └── zip.js               # ZIP 打包
├── pages/settings/          # 设置页（HTML / CSS / JS）
├── icons/                   # 插件图标 16 / 48 / 128
└── _locales/                # zh_CN / en 多语言资源
```

加载顺序在 `manifest.json` 的 `content_scripts.js` 中定义：先加载 `lib/` 基础层，再加载 `content/` 业务层，`content.js` 作为编排入口置于末尾。

---

## 技术栈

原生 JavaScript + Chrome Manifest V3，零运行时框架依赖，无需构建步骤。直接修改源码后，在 `chrome://extensions/` 点击插件的刷新按钮即可生效。

---

## 隐私与安全

- **API Key 加密存储**：采用 AES-GCM-256 本地加密，不以明文落盘
- **全程本地运行**：网页解析在浏览器内完成，不经过任何第三方服务器
- **数据最小化**：内容仅通过 HTTPS 发往用户自行配置的 AI 服务商
- **权限收敛**：`<all_urls>` 置于可选主机权限（optional host permissions），按需授权；网络请求由 CSP 白名单限制在 `api.deepseek.com` 与 `dashscope.aliyuncs.com`

---

## 版本

当前 **v1.2.0**，以界面重做主线的版本。相比 v1.0.0 的变化见仓库根 [`README.md`](../README.md) 的「v1.2.0 UI 改版」一节。
