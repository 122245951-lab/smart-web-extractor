# 智能网页信息提取器 — 技术架构设计文档

> 版本：v1.0  
> 日期：2026-06-29  
> 对应 PRD：v1.0  
> 技术栈：Manifest V3 + 纯原生 JS/HTML/CSS

---

## 目录

1. [技术选型](#1-技术选型)
2. [总体架构](#2-总体架构)
3. [模块设计](#3-模块设计)
4. [数据流设计](#4-数据流设计)
5. [存储设计](#5-存储设计)
6. [消息通信设计](#6-消息通信设计)
7. [关键算法](#7-关键算法)
8. [文件结构](#8-文件结构)
9. [安全设计](#9-安全设计)
10. [扩展 API 使用清单](#10-扩展-api-使用清单)
11. [UI/UE/UX 实现规范](#11-uiueux-实现规范)
12. [验收清单](#12-验收清单)

---

## 1. 技术选型

| 维度 | 选择 | 理由 |
|------|------|------|
| **扩展规范** | Manifest V3 | Chromium 系标准，Service Worker 替代 Background Page |
| **开发语言** | 纯原生 JavaScript (ES2020+) | 零 npm 安装、零构建、直接加载（ZIP/Markdown 为内联自实现） |
| **样式方案** | CSS Custom Properties + 原生 CSS | 无预处理器，主题切换靠 CSS 变量 |
| **存储方案** | `chrome.storage.local` + `chrome.storage.sync` | 浏览器原生 API，支持大容量本地存储 |
| **加密方案** | Web Crypto API (AES-GCM) | 浏览器原生，无需第三方库 |
| **AI 对接** | HTTP Fetch API → OpenAI 兼容接口 | DeepSeek & 通义千问均兼容 OpenAI 格式 |
| **Word 导出** | HTML → Blob → .doc（Word 兼容 HTML） | 无需依赖 docx 库 |
| **ZIP 打包** | 自实现轻量 ZIP（内联，~15KB，非第三方库） | 图片批量下载必须 |
| **Markdown 解析** | 自实现轻量渲染器 | 避免引入 marked/showdown 等库 |
| **国际化** | 自实现 i18n 模块 + `chrome.i18n`（manifest 层） | 支持运行时语言切换 |

### 1.1 为什么不用构建工具

- 用户要求直接加载源码，无需编译步骤
- ES Modules 在现代浏览器（含扩展环境）已原生支持
- Service Worker 不支持 ES Modules 动态 import？→ 使用 `importScripts` 或单文件打包
- 所有 JS 用 IIFE + 全局命名空间组织，确保 Service Worker 兼容

> **实际策略**：Content Script 和 Page 使用 ES Modules (`<script type="module">`)。Service Worker 使用传统脚本加载方式（importScripts 或单文件）。

### 1.2 为什么不用框架（React/Vue）

- 避免构建步骤
- 扩展 UI 相对简单（弹窗、侧边栏、设置页、编辑器），原生 DOM 操作足够
- 体积极小（< 500KB 总大小）
- 学习成本为零（任何人可读源码）

---

## 2. 总体架构

### 2.1 架构分层

```
┌─────────────────────────────────────────────────────────┐
│                    表现层 (Presentation)                  │
│                                                         │
│  ┌──────────────────────────────┐  ┌─────────────────┐ │
│  │   Floating Panel (Content)    │  │  Settings Page  │ │
│  │   悬浮边沿面板（主交互入口）    │  │  设置页（按需）  │ │
│  │   - 边沿标签渲染              │  │                 │ │
│  │   - 面板滑入/滑出             │  │                 │ │
│  │   - Tab: 摘要/图片/表格/编辑   │  │                 │ │
│  │   - 导出/规则管理              │  │                 │ │
│  └──────────────┬───────────────┘  └────────┬────────┘ │
├─────────────────┼─────────────────────────────┼──────────┤
│                 │      消息通信层              │          │
│                 │  chrome.runtime.sendMessage  │          │
├─────────────────┼─────────────────────────────┼──────────┤
│         ┌───────┴───────┐                            │
│         │    Service     │                            │
│         │    Worker      │  ← 消息路由中枢             │
│         │                │                            │
│         │ - 右键菜单     │                            │
│         │ - AI 调用中转  │                            │
│         │ - 文件下载     │                            │
│         └───────┬───────┘                            │
├─────────────────┼────────────────────────────────────┤
│        业务逻辑层 (Business Logic)                     │
│  ┌──────┴──────┐ ┌──────────┐ ┌──────────┐          │
│  │  Content     │ │    AI    │ │ Exporter │          │
│  │  Scripts     │ │Providers │ │ 导出模块  │          │
│  │ 提取引擎      │ │AI 供应商  │ │          │          │
│  └──────┬──────┘ └────┬─────┘ └────┬─────┘          │
│  ┌──────┴──────┐       │            │                │
│  │ Extractor   │       │            │                │
│  │ AdFilter    │       │            │                │
│  │ TableParser │       │            │                │
│  │ ImageCollector│     │            │                │
│  └─────────────┘       │            │                │
│         ┌──────────────┴────────────┘                │
│         │  lib/: storage, i18n, rule-engine,         │
│         │  markdown, utils                           │
│         └───────────────────────────────────────────┘│
├──────────────────────────────────────────────────────┤
│                    数据层 (Data)                       │
│  chrome.storage.local (API Keys加密/规则/缓存)         │
│  chrome.storage.sync  (设置/规则 可选同步)             │
└──────────────────────────────────────────────────────┘
```

### 2.2 进程模型（简化后）

```
┌──────────────────────────────────────────────┐
│             Browser Process                   │
│  ┌─────────────────────────────────┐         │
│  │   Extension Service Worker       │         │
│  │   - 右键菜单注册                  │         │
│  │   - AI API 调用中转               │         │
│  │   - 文件下载触发                  │         │
│  │   - 消息路由                      │         │
│  └──────────┬──────────────────────┘         │
│             │                                 │
│  ┌──────────┴──────────────────────┐         │
│  │         Tab Process              │         │
│  │  ┌───────────────────────────┐  │         │
│  │  │  Content Script (注入)     │  │         │
│  │  │  ├─ extractor.js          │  │         │
│  │  │  ├─ ad-filter.js          │  │         │
│  │  │  ├─ table-parser.js       │  │         │
│  │  │  ├─ image-collector.js    │  │         │
│  │  │  └─ floating-panel.js     │  │ ← 悬浮面板（主 UI）│
│  │  │     - 边沿标签渲染         │  │         │
│  │  │     - 面板滑入/滑出        │  │         │
│  │  │     - Tab 切换            │  │         │
│  │  │     - 内联编辑器           │  │         │
│  │  │     - 内联导出             │  │         │
│  │  └───────────────────────────┘  │         │
│  └─────────────────────────────────┘         │
│  ┌─────────────────────────────────┐         │
│  │  Settings Page (独立标签页)      │         │
│  │  仅在用户点击⚙时打开             │         │
│  └─────────────────────────────────┘         │
└──────────────────────────────────────────────┘
```

---

## 3. 模块设计

### 3.1 模块总览

```
                       ┌──────────────┐
                       │  manifest.json │
                       └──────┬───────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────┴─────┐        ┌─────┴──────┐       ┌──────┴──────┐
   │ Background│        │  Content    │       │   Settings  │
   │  Worker   │        │  Scripts    │       │   Page     │
   │           │        │             │       │  (唯一页面)  │
   └────┬─────┘        └─────┬──────┘       └──────┬──────┘
        │                     │                     │
        │              ┌──────┼──────────────┐      │
        │              │      │      │       │      │
        ▼              ▼      ▼      ▼       ▼      ▼
   ┌─────────┐   ┌─────────┐┌────┐┌────┐┌────────┐
   │Context  │   │Extractor││Ad  ││Tbl ││Floating│  ┌──────────┐
   │Menus    │   │         ││Flt ││Prs ││Panel   │  │ Settings │
   │AI Relay │   └─────────┘└────┘└────┘│★主UI   │  │ Page     │
   │Downloads│                         │边沿标签  │  └──────────┘
   └─────────┘                         │面板滑入  │
        │                              │Tab切换   │
        └──────────────────────────────┤内联编辑  │
                                       │内联导出  │
                              ┌────────┤规则快捷  │
                              │        └────────┘
                     ┌────────┴────────┐
                     │   lib/ (共享)    │
                     │ storage.js      │
                     │ ai-providers.js │
                     │ exporter.js     │
                     │ rule-engine.js  │
                     │ i18n.js         │
                     │ markdown.js     │
                     │ utils.js        │
                     └─────────────────┘
```

### 3.2 各模块详细设计

#### 3.2.1 Background Service Worker

**文件**：`background/service-worker.js`

**职责**：
- 注册/管理右键菜单（`chrome.contextMenus`）
- 控制悬浮面板（Content Script 注入 DOM）的行为
- 消息路由：UI 页面 → Content Script / Content Script → UI 页面
- 处理安装/更新事件（首次安装引导）

**关键接口**：

```javascript
// 消息路由表
const ROUTES = {
  'extract:start': '→ Content Script (触发提取)',
  'extract:result': '→ Sidebar/Editor (返回提取结果)',
  'analyze:ai': '→ AI Provider (调用 AI)',
  'export:file': '→ Exporter (生成导出文件)',
  'storage:get': '→ Storage Module',
  'storage:set': '→ Storage Module',
};
```

**生命周期注意事项**：
- Service Worker 空闲 30 秒后自动休眠
- 长时间 AI 调用需要保持唤醒 → 使用 `chrome.runtime.connect` 长连接

#### 3.2.2 Content Scripts

**文件**：
- `content/content.js` — 主入口，协调各子模块
- `content/extractor.js` — 正文提取引擎
- `content/ad-filter.js` — 广告检测过滤
- `content/table-parser.js` — 表格识别解析
- `content/image-collector.js` — 图片收集分类
- `content/content.css` — 浮动按钮/选择框样式

**注入策略**：
- `"run_at": "document_idle"`（DOM 就绪后执行）
- **host_permissions 策略**（与 §9.4 一致）：边沿标签需在用户打开的任意页面常驻注入 Content Script，无法仅凭 `activeTab` 实现（`activeTab` 仅在用户主动操作后生效）。因此采用 `optional_host_permissions: ["<all_urls>"]`，在用户首次使用时通过 `chrome.permissions.request` 申请；申请通过后，Content Script 在 `manifest.json` 静态声明匹配用户已授权页面并注入
- 用户拒绝 optional 权限时降级为"仅点击图标后经 `chrome.scripting.executeScript` 按需注入"模式（边沿标签不常驻显示，改为点击工具栏图标触发）
- 边沿标签仅在非扩展页面渲染（排除 `chrome://`、`chrome-extension://`、`https://` 及系统页等）

**核心类结构**：

```javascript
// Extractor 提取器
class ContentExtractor {
  extract(document) → ExtractedContent
  extractSelection(selection) → ExtractedContent
  computeTextDensity(element) → number
  findMainContent(document) → Element
}

// AdFilter 广告过滤器
class AdFilter {
  detectAds(document) → AdRegion[]
  filterContent(content, adRegions) → CleanContent
  previewCleanPage(document, adRegions) → void  // 高亮标记
}

// TableParser 表格解析器
class TableParser {
  findTables(document) → TableData[]
  parseTable(tableElement) → TableData
  detectDivTable(element) → TableData | null
}

// ImageCollector 图片收集器
class ImageCollector {
  collect(document, contentArea) → ImageItem[]
  classify(imageElement) → ImageCategory
  getDescription(imageUrl, context) → Promise<string>
}
```

#### 3.2.3 AI Provider 模块

**文件**：`lib/ai-providers.js`

**支持的供应商**：

```javascript
const PROVIDERS = {
  deepseek: {
    name: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  defaultModel: 'deepseek-chat',
  requiresAuth: true,
  authHeader: 'Bearer {API_KEY}',
  },
  // 多模态模型 — 仅图片描述 F2.2 使用；DeepSeek deepseek-chat 为纯文本模型，无多模态能力
  qwen_vl: {
    name: '通义千问 VL',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    models: ['qwen-vl-plus', 'qwen-vl-max'],
    defaultModel: 'qwen-vl-plus',
    requiresAuth: true,
    multimodal: true,
    authHeader: 'Bearer {API_KEY}',
  },
  qwen: {
    name: '通义千问',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    models: ['qwen-plus', 'qwen-max', 'qwen-turbo'],
    defaultModel: 'qwen-plus',
    requiresAuth: true,
    authHeader: 'Bearer {API_KEY}',
  },
};
```

**核心接口**：

```javascript
// 单次调用
async function callAI({ provider, apiKey, model, messages, temperature, maxTokens }) → AIResponse

// 流式调用（编辑器对话场景）
async function callAIStream({ provider, apiKey, model, messages, onChunk }) → Promise<void>
```

**图片描述（F2.2）的供应商差异**：
- 通义千问：使用 `qwen_vl` 多模态模型，将图片 base64 + 文本提示发送，返回一句话图像描述
- DeepSeek：`deepseek-chat` 不支持图像输入，走「文字推断降级」——基于图片的 alt / aria-label、周围文本、CSS 类名等上下文用文本模型生成描述；无可用上下文时提示"该图片暂无法生成描述（当前供应商不支持多模态）"
- 结论：DeepSeek 用户启用 F2.2 时自动降级为文字推断，需在设置页对此限制给出说明

**错误处理策略**：
```
请求 → 超时(30s) → 抛出 TimeoutError
     → 401 → 提示 "API Key 无效"
     → 429 → 提示 "请求过于频繁，请稍后重试"
     → 5xx → 提示 "AI 服务暂时不可用，请稍后重试"
     → 网络错误 → 提示 "网络连接失败，请检查网络"
```

#### 3.2.4 Export 导出模块

**文件**：`lib/exporter.js`

**导出格式实现**：

```javascript
const Exporters = {
  txt(content, metadata) → Blob,
  markdown(content, metadata) → Blob,
  word(content, metadata) → Blob,  // HTML-as-Word
};

// Word 导出：HTML 包装为 Word 兼容格式
function generateWordHTML(content, metadata) {
  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word">
      <head><meta charset="utf-8">...</head>
      <body>${markdownToHTML(content)}</body>
    </html>
  `;
}
```

**ZIP 打包**：内联轻量 ZIP 实现（约 200 行），用于图片批量下载。**图片二进制数据必须经 Service Worker 中转获取**——Content Script 直接 fetch 跨域图片会被宿主页 CORS / 页面 CSP 拦截，故由 Content Script 将图片 URL 列表发消息给 SW，SW 用 fetch 拉取图片 blob 后回传 Content Script 打包；获取失败的跨域图片在 ZIP 中跳过，并在面板内提示用户"N 张图片因跨域无法打包"。SW 的 fetch 仍受扩展 manifest 的 `optional_host_permissions` 约束，跨域广泛图片场景下部分图片可能失败，需有跳过 + 提示的降级路径。

#### 3.2.5 Rule Engine 规则引擎

**文件**：`lib/rule-engine.js`

**规则数据结构**：

```javascript
const RuleSchema = {
  id: 'string (uuid)',
  name: 'string',
  description: 'string',
  urlPattern: 'string (glob)',
  enabled: 'boolean',
  prompt: 'string (支持 {content} {title} {url} {images} {tables} 变量)',
  extractionMode: 'fullPage | selection',
  summaryLength: 'short | medium | long',
  includeImages: 'boolean',
  includeTables: 'boolean',
  steps: 'RuleStep[]', // 规则链
};

const RuleStep = {
  type: 'extract | filter | transform | summarize | format',
  config: 'object',
};
```

**规则匹配**：URL glob 匹配 → `*://*.zhihu.com/*` 等模式转正则。

#### 3.2.6 Storage 存储模块

**文件**：`lib/storage.js`

**存储结构设计**：

```javascript
// Key 命名规范：前缀:标识符
const STORAGE_KEYS = {
  // 加密存储（local only）
  API_KEY_DEEPSEEK: 'secure:api_key_deepseek',
  API_KEY_QWEN: 'secure:api_key_qwen',

  // 普通本地存储
  RULES: 'local:rules',
  LAST_EXTRACTION: 'local:last_extraction',

  // 同步存储
  SETTINGS: 'sync:settings',
  RULES_SYNC: 'sync:rules',
  LANGUAGE: 'sync:language',
};
```

**加密方案**：

```javascript
// 使用 Web Crypto API
async function encrypt(plaintext) {
  const key = await deriveKey(deviceFingerprint());
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext)
  );
  return { iv: bufferToHex(iv), data: bufferToHex(encrypted) };
}
```

#### 3.2.7 Markdown 模块

**文件**：`lib/markdown.js`

**功能**：
- Markdown → HTML 渲染（轻量实现）
- 富文本工具栏操作（插入加粗/标题/列表等）
- 实时预览切换

#### 3.2.8 i18n 国际化模块

**文件**：`lib/i18n.js`

**设计**：
- 语言包以 JS 对象存储（非 JSON 文件，避免额外加载）
- 消息键命名：`section.key` 格式
- 支持运行时切换，无需刷新

```javascript
const messages = {
  zh: {
    'app.name': '智能网页信息提取器',
    'extract.start': '开始提取',
    'export.md': '导出 Markdown',
    // ...
  },
  en: {
    'app.name': 'Smart Web Extractor',
    'extract.start': 'Start Extraction',
    'export.md': 'Export Markdown',
    // ...
  }
};

function t(key) → string  // 根据当前语言返回对应文本
```

---

## 4. 数据流设计

### 4.1 主提取流程（简化后）

```
用户触发提取（边沿标签点击 / 右键 / 快捷键）
    │
    ▼
[Floating Panel] ──函数直接调用──▶ [Extractor + AdFilter + TableParser]
                                        │    (同在 Content Script 进程)
                              ┌─────────┼─────────┐
                              ▼         ▼          ▼
                         Extractor  AdFilter  TableParser
                              │         │          │
                              └────┬────┘          │
                                   ▼               │
                            [合并内容+过滤广告]       │
                                   │               │
                                   ▼               │
                            ImageCollector          │
                                   │               │
                                   ▼               │
                            [ExtractedData] ◀──────┘
                            {title, content, images[], tables[]}
                                   │
                                   ▼
                            [面板显示进度动画]
                            ✅ 正文 ✓  ✅ 图片 ✓  ✅ 表格 ✓
                                   │
                           用户选择模板（或使用默认）
                                   │
                                   ▼
[Floating Panel] ──消息──▶ [Service Worker] ──fetch──▶ [AI API]
                                   │                      │
                                   │  ◀── 流式 chunk ────┘
                                   │
                            [面板逐字显示摘要]
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              [📄 摘要Tab]  [🖼 图片Tab]  [📊 表格Tab]
                    │
              [✏️ 编辑Tab]
              - 手动编辑 Markdown
              - 对话式 AI 调整
                    │
                    ▼
              [📥 导出]
              - ☑ TXT  ☑ MD  ☐ Word
              - 面板内完成，无需跳转
```

### 4.2 消息格式规范

```typescript
// 请求消息
interface ExtensionMessage {
  type: string;          // 消息类型 'extract:start' | 'extract:analyze' | 'export:file' | ...
  payload?: any;         // 消息负载
  tabId?: number;        // 目标标签页 ID
  requestId?: string;    // 请求追踪 ID
}

// 响应消息
interface ExtensionResponse {
  success: boolean;
  data?: any;
  error?: { code: string; message: string; };
  requestId: string;
}
```

### 4.3 长连接（AI 流式调用）

```
[Editor] ──port = chrome.runtime.connect()──▶ [Service Worker]
                                                    │
  port.postMessage({type: 'ai:stream', ...})        │
                                                    │
  port.onMessage ◀── 流式 chunk ◀── [AI Provider 流式读取]
  port.onMessage ◀── 流式 chunk
  port.onMessage ◀── 流式 chunk
  port.onMessage ◀── {done: true}
```

---

## 5. 存储设计

### 5.1 存储模型 ER

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Settings   │       │     Rule     │       │   API Key    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ language     │       │ id (PK)      │       │ provider     │
│ theme        │       │ name         │       │ key (加密)   │
│ defaultProv  │       │ urlPattern   │       │ createdAt    │
│ triggers     │ 1──N  │ prompt       │       │ lastUsed     │
│ summaryLen   │       │ mode         │       └──────────────┘
│ includeImgs  │       │ enabled      │
│ includeTbls  │       │ steps[]      │
│ syncEnabled  │       │ createdAt    │
└──────────────┘       │ updatedAt    │
                       └──────────────┘
```

### 5.2 存储容量预估

| 数据 | 单条大小 | 数量上限 | 总上限 |
|------|----------|----------|--------|
| Settings | ~1KB | 1 | 1KB |
| Rules | ~2KB | 50 | 100KB |
| API Keys (加密) | ~500B | 5 | 2.5KB |
| 上次提取缓存 | ~50KB | 1 | 50KB |
| **总计** | | | **< 200KB** |

`chrome.storage.local` 上限 10MB → 充足。  
`chrome.storage.sync` 上限 100KB → 仅同步 Settings + Rules，足够。

---

## 6. 消息通信设计

### 6.1 消息类型枚举

```javascript
const MESSAGE_TYPES = {
  // 提取相关
  EXTRACT_START: 'extract:start',
  EXTRACT_RESULT: 'extract:result',
  EXTRACT_ERROR: 'extract:error',
  EXTRACT_PROGRESS: 'extract:progress',

  // AI 相关
  AI_ANALYZE: 'ai:analyze',
  AI_STREAM: 'ai:stream',
  AI_STREAM_CHUNK: 'ai:stream:chunk',
  AI_STREAM_DONE: 'ai:stream:done',
  AI_TEST_CONNECTION: 'ai:test',

  // 导出相关
  EXPORT_FILES: 'export:files',
  EXPORT_PROGRESS: 'export:progress',

  // 存储相关
  STORAGE_GET: 'storage:get',
  STORAGE_SET: 'storage:set',
  STORAGE_REMOVE: 'storage:remove',

  // UI 控制
  SIDEPANEL_OPEN: 'sidepanel:open',
  SIDEPANEL_CLOSE: 'sidepanel:close',
  EDITOR_OPEN: 'editor:open',
  SETTINGS_OPEN: 'settings:open',

  // 规则相关
  RULE_IMPORT: 'rule:import',
  RULE_EXPORT: 'rule:export',
  RULE_MATCH: 'rule:match',
};
```

### 6.2 通信路由表（简化后）

```
发送方                →  接收方              消息类型
───────────────────────────────────────────────────────
Floating Panel (CS)  →  Service Worker     AI_ANALYZE, AI_STREAM, EXPORT_FILES
Floating Panel (CS)  →  Content Script     内部直接调用（同进程，无需消息）
Settings Page        →  Service Worker     STORAGE_*, AI_TEST_CONNECTION, RULE_*
Service Worker       →  Content Script     CONTEXT_MENU_EXTRACT（右键触发提取）
Content Script       →  Service Worker     EXTRACT_RESULT（给右键菜单回调）
Service Worker       →  AI Provider        直接 fetch（SW 内完成）
```

> 悬浮面板在 Content Script 进程中，与提取引擎共用 JS 上下文——无需消息传递，函数直接调用。只有需要 Service Worker 的能力（AI 调用避免 CORS、文件下载、右键菜单）时才通过消息通信。

---

## 7. 关键算法

### 7.1 正文提取算法（文本密度法）

```
输入：document.body
输出：主内容 DOM Element

算法步骤：
1. 遍历 body 下所有块级元素（div, article, section, main, p 等）
2. 对每个元素计算"内容得分"：
   score = textLength × 1.0
         + paragraphCount × 10
         + (headingElements 含 h1-h3) × 30
         + (headingElements 含 h4-h6) × 10
         - linkDensity × 50           // 链接密度惩罚（导航栏）
         - listDensity × 5            // 纯列表惩罚
         - (adClassMatch ? 200 : 0)   // 广告类名惩罚
3. 取最高分元素作为正文容器
4. 向上下扩展：合并相邻高分兄弟节点
5. 返回净化后的 Element
```

**时间复杂度**：O(n)，n = 页面 DOM 节点数（通常 < 5000），< 100ms

### 7.2 广告检测算法

```
输入：document.body
输出：AdRegion[] （广告区域列表）

检测规则（优先级从高到低）：
1. CSS 类名/ID 关键词匹配（ad, ads, advertise, banner, sponsor, promo, 
   recommend, aside-ad, google-ad, 广告, 推广 等 50+ 关键词）
2. iframe 检测：宽度或高度 ≤ 250px 的 iframe
3. 固定定位弹窗：position:fixed + z-index 高 + 含 ×/关闭 文本
4. 空链接块：纯 <a> 标签区域且无实质文本内容
5. 第三方广告域脚本插入的 DOM（通过 data-* 属性特征）
```

**准确率目标**：≥ 90%（常见中文网站）

### 7.3 图片分类算法

```
输入：ImageElement
输出：ImageCategory

分类规则：
1. 尺寸 < 50×50 px → 'icon'
2. alt/src 含 'logo' / 'avatar' → 'logo'
3. 尺寸 > 400×300 且含 alt 文本 → 'photo'
4. src 含 'chart' / 'graph' / 图片 URL 含 'chart' → 'chart'
5. 在 <figure> 内或紧跟 <figcaption> → 'photo'
6. 默认 → 'other'
```

---

## 8. 文件结构

> 悬浮边沿面板简化架构：面板作为 Content Script 的一部分直接注入页面，Settings 是唯一独立页面。

```
plugin/
├── manifest.json                      # 扩展清单
├── _locales/
│   ├── zh_CN/messages.json           # 中文清单翻译
│   └── en/messages.json              # 英文清单翻译
├── icons/
│   ├── icon16.png                    # 16×16 图标
│   ├── icon48.png                    # 48×48 图标
│   └── icon128.png                   # 128×128 图标
│
├── background/
│   └── service-worker.js             # Service Worker: 右键菜单、AI中转、下载
│
├── content/
│   ├── content.js                    # Content Script 主入口（协调所有注入模块）
│   ├── content.css                   # 注入样式（边沿标签 + 悬浮面板）
│   ├── extractor.js                  # 正文提取引擎
│   ├── ad-filter.js                  # 广告检测与过滤
│   ├── table-parser.js              # 表格识别解析
│   ├── image-collector.js           # 图片收集分类
│   └── floating-panel.js            # ★ 悬浮面板核心（边沿标签+滑入面板+Tab切换+内联编辑+导出）
│
├── pages/
│   └── settings/
│       ├── settings.html            # 设置页面（唯一独立页面）
│       ├── settings.css             # 设置样式
│       └── settings.js              # 设置逻辑（API Key管理+规则管理+语言切换）
│
├── lib/
│   ├── storage.js                   # 存储封装（含加密）
│   ├── i18n.js                      # 国际化
│   ├── ai-providers.js             # AI 供应商封装
│   ├── exporter.js                  # 多格式导出（TXT/MD/Word）
│   ├── rule-engine.js              # 规则引擎
│   ├── markdown.js                  # Markdown 渲染/编辑
│   └── utils.js                     # 通用工具函数
│
├── README.md                         # 安装与使用说明书（中文）
└── README_EN.md                      # 英文版说明书
```

**文件统计预估**：

| 目录 | 文件数 | 预估代码行数 | 说明 |
|------|--------|-------------|------|
| background/ | 1 | ~250 | 精简为 AI 中转 + 下载 + 菜单 |
| content/ | 7 | ~2500 | 含 floating-panel.js (~1000 行，最复杂) |
| pages/settings/ | 3 | ~600 | 唯一独立页面 |
| lib/ | 7 | ~2000 | 共享模块 |
| 其他 | 6 | ~300 | manifest, locales, icons, readme |
| **总计** | **24** | **~5650** | 比原方案减少 10 个文件、~2000 行代码 |

**关键变化**：
- ❌ 移除 `sidebar/`（被 floating-panel.js 替代）
- ❌ 移除 `pages/popup/`（功能合并进 floating-panel.js）
- ❌ 移除 `pages/editor/`（内联编辑器在 floating-panel.js 中）
- ✅ 新增 `content/floating-panel.js`（悬浮面板核心，约 1000 行）
- ✅ 保留 `pages/settings/`（复杂配置需要独立空间）

---

## 9. 安全设计

### 9.1 安全总则

本插件的安全设计遵循三条铁律：

1. **API Key 永不离境**：Key 仅存在于用户本地浏览器加密存储中，任何情况下不发送至除用户指定 AI 供应商外的任何服务器
2. **代码可审计**：纯源码交付，用户可审查每一行代码确认无后门
3. **默认安全**：安全选项默认开启（加密、脱敏、不同步），关闭安全需用户显式操作

### 9.2 API Key 全生命周期安全

#### 9.2.1 Key 输入阶段

```
用户输入 Key → UI 层脱敏
     │
     ├── 输入框类型：type="password"（默认遮罩）
     ├── 提供"显示/隐藏"切换按钮
     ├── 输入时前端验证格式（DeepSeek: sk-*，通义千问: sk-*）
     └── 粘贴时 trim 空白字符
```

#### 9.2.2 Key 存储阶段

```javascript
// lib/storage.js — API Key 安全存储实现

const SECURE_PREFIX = 'secure:'; // 安全键前缀

// 加密存储 API Key
async function saveApiKey(provider, plaintextKey) {
  // 1. 生成设备指纹
  const fingerprint = await deriveDeviceFingerprint();

  // 2. PBKDF2 派生加密密钥（100,000 次迭代）
  const cryptoKey = await deriveEncryptionKey(fingerprint, provider);

  // 3. 生成独立随机 IV（12 字节）
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 4. AES-GCM 256 加密
  const encoded = new TextEncoder().encode(plaintextKey);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, cryptoKey, encoded
  );

  // 5. 存储密文 + IV（不存储明文，不存储派生密钥）
  const securePayload = {
    iv: arrayBufferToBase64(iv),
    data: arrayBufferToBase64(ciphertext),
    alg: 'AES-GCM-256',
    created: Date.now(),
  };

  await chrome.storage.local.set({
    [`${SECURE_PREFIX}api_key_${provider}`]: securePayload
  });

  // 6. 立即从内存清除明文
  plaintextKey = null;
}

// 解密读取 API Key（仅在需要调用 API 时使用）
async function getApiKey(provider) {
  const key = `${SECURE_PREFIX}api_key_${provider}`;
  const result = await chrome.storage.local.get(key);
  const payload = result[key];
  if (!payload) return null;

  const fingerprint = await deriveDeviceFingerprint();
  const cryptoKey = await deriveEncryptionKey(fingerprint, provider);
  const iv = base64ToArrayBuffer(payload.iv);
  const ciphertext = base64ToArrayBuffer(payload.data);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv }, cryptoKey, ciphertext
  );

  return new TextDecoder().decode(plaintext);
  // 调用方负责在使用后立即将返回值置 null
}
```

#### 9.2.3 Key 显示阶段（脱敏规则）

```javascript
// UI 中永远只显示脱敏后的 Key
function maskApiKey(key) {
  if (!key || key.length < 12) return '****';
  // 显示前 4 位 + **** + 后 4 位
  return key.slice(0, 4) + '****' + key.slice(-4);
  // 示例：sk-a1b2c3d4e5f6g7h8i9j0 → sk-a****j0
}

// 脱敏规则：
// - 设置页 / API Key 信息卡片：显示脱敏版
// - 修改 Key 时：输入框为空，要求重新输入完整 Key
// - 导出配置：Key 字段为空字符串 ""
// - 日志/错误信息：涉及 Key 的部分替换为 "[API_KEY]"
```

#### 9.2.4 Key 使用阶段（API 调用）

```javascript
// lib/ai-providers.js — 安全调用模式

async function callAI({ provider, model, messages }) {
  let apiKey = null;
  try {
    // 1. 仅在调用前解密获取 Key
    apiKey = await getApiKey(provider);
    if (!apiKey) throw new Error('API Key not configured');

    // 2. 发起 HTTPS 请求（Key 仅在 Authorization 头中出现）
    const response = await fetch(getEndpoint(provider), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages }),
    });

    return await response.json();
  } finally {
    // 3. 无论成功失败，立即从内存清除 Key
    apiKey = null;
  }
}
```

#### 9.2.5 Key 同步控制

```javascript
// 默认：API Key 不同步到 chrome.storage.sync
// 用户主动开启时需二次确认：

async function enableApiKeySync(provider) {
  // 弹窗警告
  const confirmed = await showConfirmDialog({
    title: '⚠️ 安全风险提示',
    message: `同步 API Key 将把加密后的密钥上传至浏览器账号的云存储。
不同设备的加密密钥不同，其他设备无法解密使用此 Key。
但密文将暴露在浏览器同步服务中。

建议：仅在可信设备上使用，使用完毕后关闭同步。

确定要开启同步吗？`,
    confirmText: '我了解风险，确认开启',
    danger: true,
  });

  if (confirmed) {
    await chrome.storage.sync.set({
      [`secure_sync:api_key_${provider}`]: await chrome.storage.local.get(`secure:api_key_${provider}`)
    });
  }
}
```

### 9.3 数据防泄漏检查清单（代码层面）

```javascript
// eslint 规则转化为代码自查清单，以下模式在代码中禁止出现：

// ❌ 禁止：将 API Key 写入日志
console.log('Using key:', apiKey); // 绝对禁止

// ❌ 禁止：将 API Key 序列化导出
JSON.stringify({ apiKey }); // 绝对禁止

// ❌ 禁止：在非 HTTPS 上下文使用 Key
fetch('http://...', { headers: { Authorization: `Bearer ${key}` } }); // 绝对禁止

// ❌ 禁止：将 Key 存储到非 secure: 前缀的 storage key
chrome.storage.local.set({ api_key: key }); // 绝对禁止

// ✅ 正确：使用安全前缀
chrome.storage.local.set({ 'secure:api_key_deepseek': encryptedPayload });

// ✅ 正确：错误消息脱敏
throw new Error(`AI call failed for provider: ${provider}, key: [API_KEY]`);
```

### 9.4 最小权限原则

```json
{
  "permissions": [
    "activeTab",
    "storage",
    "contextMenus",
    "downloads"
  ],
  "host_permissions": [
    "https://api.deepseek.com/*",
    "https://dashscope.aliyuncs.com/*"
  ]
}
```

**host_permissions 策略**：
- 边沿标签常驻注入用户页面需要 `optional_host_permissions: ["<all_urls>"]`，在用户首次使用时通过 `chrome.permissions.request` 申请，避免安装期强制索取全部权限（与 PRD §6.2.3 一致）
- 用户拒绝 optional 权限时降级为"仅点击图标后经 `chrome.scripting.executeScript` 按需注入"模式
- `host_permissions` 中保留两个 AI 供应商域名，AI fetch 始终在 Service Worker 执行（不受页面 CSP/CORS 约束）
- 已移除 `sidePanel`（采用悬浮边沿面板方案，不经 chrome.sidePanel API）；按需注入需要 `chrome.scripting.executeScript`，故 permissions 中应补充 `"scripting"`，完整修正如下：

```json
{
  "permissions": [
    "activeTab",
    "storage",
    "contextMenus",
    "downloads",
    "scripting"
  ],
  "optional_host_permissions": [
    "<all_urls>"
  ],
  "host_permissions": [
    "https://api.deepseek.com/*",
    "https://dashscope.aliyuncs.com/*"
  ]
}
```

### 9.5 数据安全矩阵

| 数据 | 存储位置 | 加密 | 同步 | 可导出 | 卸载后 |
|------|----------|------|------|--------|--------|
| API Key 明文 | 仅内存，用完即释放 | N/A | ❌ | ❌ | N/A |
| API Key 密文 | `local:secure:api_key_*` | AES-GCM-256 | ❌（默认） | ❌ | ✅ 自动清除 |
| 提取缓存 | `local:last_extraction` | ❌ | ❌ | ❌ | ✅ 自动清除 |
| 用户设置 | `sync:settings` | ❌ | ✅（可选） | ✅ | ❌ 需手动清除 |
| 自定义规则 | `sync:rules` / `local:rules` | ❌ | ✅（可选） | ✅ | ❌ 需手动清除 |
| 语言偏好 | `sync:language` | ❌ | ✅ | ❌ | ❌ 需手动清除 |

### 9.6 CSP（内容安全策略）

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; connect-src https://api.deepseek.com https://dashscope.aliyuncs.com"
  }
}
```
**CSP 适用范围说明**：
- `extension_pages` 的 CSP 仅约束扩展自身页面（设置页等）。**Content Script 运行在宿主页上下文，其 fetch 受宿主页 CSP 约束**，扩展 CSP 无法保护它
- 因此**所有 AI API 调用、跨域图片获取必须经 Service Worker 中转执行**（SW 运行在扩展进程，不受页面 CSP/CORS 限制）；Content Script 禁止直接 fetch AI 端点。§4.1 主提取流程中标注的 `[Floating Panel] ──消息──▶ [Service Worker] ──fetch──▶ [AI API]` 即此约束的体现

### 9.7 代码审计要点

源码交付后用户可自行验证：
1. 全局搜索 `fetch(` → 确认仅向 `api.deepseek.com` 和 `dashscope.aliyuncs.com` 发请求
2. 全局搜索 `console.log` → 确认无 API Key 泄漏
3. 全局搜索 `chrome.storage.sync.set` → 确认无 `secure:` 前缀数据同步
4. 全局搜索 `btoa` / `atob` → 确认无明文 Key 编码
5. 审查 `lib/storage.js` `saveApiKey` 函数 → 确认加密算法正确

---

## 10. 扩展 API 使用清单

| API | 用途 | 必需 |
|-----|------|------|
| `chrome.runtime.sendMessage` | 跨组件通信 | ✅ |
| `chrome.runtime.connect` | 长连接（AI 流式） | ✅ |
| `chrome.runtime.onInstalled` | 首次安装引导 | ✅ |
| `chrome.storage.local` | 本地数据存储 | ✅ |
| `chrome.storage.sync` | 跨设备同步（可选） | ❌ |
| `chrome.runtime.sendMessage` + `window.postMessage` | Content Script ↔ SW/页面通信 | ✅ |
| `chrome.contextMenus` | 右键菜单 | ✅ |
| `chrome.commands` | 键盘快捷键 | ✅ |
| `chrome.downloads` | 文件下载 | ✅ |
| `chrome.tabs.query` | 获取当前标签页 | ✅ |
| `chrome.tabs.create` | 打开编辑器/设置新标签页 | ✅ |
| `chrome.scripting.executeScript` | 动态注入脚本 | ✅ |
| `chrome.i18n` | Manifest 国际化 | ✅ |

---

## 11. UI/UE/UX 实现规范 — 悬浮边沿面板

> 设计系统 CSS Token 和组件（按钮、输入框、Toggle、Dropdown 等）与 PRD §10 一致，此处不再重复。本节专注悬浮面板的技术实现。

### 11.1 悬浮面板 DOM 结构

```html
<!-- 由 Content Script 注入到页面的 DOM -->
<div id="swe-root">
  <!-- 边沿标签 -->
  <div id="swe-edge-tab" class="swe-edge-tab" title="智能提取">
    <svg class="swe-edge-icon">...</svg>
    <span class="swe-edge-text">提取</span>
  </div>

  <!-- 悬浮面板 -->
  <div id="swe-panel" class="swe-panel" hidden>
    <!-- 遮罩层 (4px 阴影渐变，不遮挡内容) -->
    <div class="swe-panel-shadow"></div>

    <!-- 面板主体 -->
    <div class="swe-panel-body">
      <!-- Header -->
      <div class="swe-header">
        <h2 class="swe-header__title" data-i18n="app.name">智能提取器</h2>
        <button class="swe-header__settings" title="设置">⚙</button>
        <button class="swe-header__close" title="关闭">×</button>
      </div>

      <!-- 模板选择 -->
      <div class="swe-templates">
        <button class="swe-template swe-template--active" data-template="brief">文字摘要</button>
        <button class="swe-template" data-template="structured">结构化</button>
        <button class="swe-template" data-template="mindmap">图表化</button>
      </div>

      <!-- 主提取按钮 -->
      <button id="swe-extract-btn" class="swe-btn-extract">
        ⚡ 开始提取
      </button>

      <!-- Tab 切换（提取结果区域） -->
      <div class="swe-tabs" hidden>
        <button class="swe-tab swe-tab--active" data-panel="summary">📄 摘要</button>
        <button class="swe-tab" data-panel="images">🖼 图片 <span class="swe-badge">0</span></button>
        <button class="swe-tab" data-panel="tables">📊 表格 <span class="swe-badge">0</span></button>
        <button class="swe-tab" data-panel="edit">✏️ 编辑</button>
      </div>

      <!-- Tab 内容区 -->
      <div class="swe-content">
        <!-- 摘要面板 -->
        <div id="swe-panel-summary" class="swe-panel-content">
          <div class="swe-summary markdown-body"></div>
        </div>
        <!-- 图片面板 -->
        <div id="swe-panel-images" class="swe-panel-content" hidden>
          <div class="swe-image-grid"></div>
        </div>
        <!-- 表格面板 -->
        <div id="swe-panel-tables" class="swe-panel-content" hidden>
          <div class="swe-table-list"></div>
        </div>
        <!-- 编辑面板 -->
        <div id="swe-panel-edit" class="swe-panel-content" hidden>
          <div class="swe-editor-toolbar">
            <button data-md="bold"><b>B</b></button>
            <button data-md="italic"><i>I</i></button>
            <button data-md="heading">H</button>
            <button data-md="list">•</button>
            <button data-md="quote">❝</button>
          </div>
          <textarea class="swe-editor-textarea"></textarea>
          <div class="swe-chat">
            <div class="swe-chat__messages"></div>
            <div class="swe-chat__input">
              <input type="text" placeholder="输入指令调整摘要..." />
              <button>发送</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer 操作栏 -->
      <div class="swe-footer" hidden>
        <button class="btn btn--secondary btn--sm" id="swe-btn-reextract">🔄 重新提取</button>
        <div class="swe-export-group">
          <label class="swe-export-check"><input type="checkbox" checked> TXT</label>
          <label class="swe-export-check"><input type="checkbox" checked> MD</label>
          <label class="swe-export-check"><input type="checkbox"> Word</label>
          <button class="btn btn--primary btn--sm" id="swe-btn-export">📥 导出</button>
        </div>
      </div>

      <!-- 进度指示器 -->
      <div id="swe-progress" class="swe-progress" hidden>
        <div class="swe-progress__bar"></div>
        <span class="swe-progress__text"></span>
      </div>
    </div>
  </div>
</div>
```

### 11.2 面板状态管理

```javascript
// floating-panel.js — 面板状态机
const PanelState = {
  HIDDEN: 'hidden',       // 面板收起，仅边沿标签可见
  SLIDING_IN: 'sliding_in',   // 面板正在滑入（动画中）
  VISIBLE: 'visible',     // 面板展开
  EXTRACTING: 'extracting',   // 正在提取
  RESULT: 'result',       // 显示结果
  EDITING: 'editing',     // 编辑模式
  SLIDING_OUT: 'sliding_out', // 面板正在滑出
};

class FloatingPanel {
  constructor() {
    this.state = PanelState.HIDDEN;
    this.extractedData = null;
    this.aiResult = null;
  }

  toggle() { /* HIDDEN ↔ VISIBLE */ }
  slideIn() { /* 300ms ease-out */ }
  slideOut() { /* 250ms ease-in */ }
  startExtraction() { /* → EXTRACTING */ }
  showResult(data) { /* → RESULT */ }
  switchTab(tabName) { /* summary | images | tables | edit */ }
  openSettings() { /* 通过 SW 打开设置页标签 */ }
}
```

### 11.3 面板打开/关闭实现

```javascript
// 打开面板（多种触发方式统一入口）
function openPanel(triggerSource) {
  // triggerSource: 'edge-tab' | 'context-menu' | 'keyboard' | 'floating-btn'

  const panel = document.getElementById('swe-panel');

  // 面板从右侧滑入
  panel.hidden = false;
  panel.style.transform = 'translateX(100%)'; // 初始在屏幕外
  requestAnimationFrame(() => {
    panel.style.transition = 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)';
    panel.style.transform = 'translateX(0)';
  });

  // 边沿标签缩小消失
  const tab = document.getElementById('swe-edge-tab');
  tab.classList.add('swe-edge-tab--hidden');

  floatingPanel.state = PanelState.VISIBLE;
}

// 关闭面板
function closePanel() {
  const panel = document.getElementById('swe-panel');
  panel.style.transform = 'translateX(100%)';
  panel.addEventListener('transitionend', () => {
    panel.hidden = true;
  }, { once: true });

  // 边沿标签恢复
  const tab = document.getElementById('swe-edge-tab');
  tab.classList.remove('swe-edge-tab--hidden');

  floatingPanel.state = PanelState.HIDDEN;
}

// 关闭触发：点击面板外 / ESC / 点击× / 提取完成导出后自动收起
document.addEventListener('click', (e) => {
  if (floatingPanel.state === PanelState.VISIBLE
      && !e.target.closest('#swe-panel')
      && !e.target.closest('#swe-edge-tab')) {
    closePanel();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && floatingPanel.state === PanelState.VISIBLE) {
    closePanel();
  }
});
```

### 11.4 边沿标签 CSS 实现

```css
/* 边沿标签 — 浏览器右侧垂直居中 */
#swe-edge-tab {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 120px;
  background: var(--color-primary);
  border-radius: 8px 0 0 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  z-index: 9998;
  opacity: 0.75;
  transition: all 200ms ease;
  writing-mode: vertical-rl;
  color: white;
  font-size: 13px;
  font-weight: 600;
  box-shadow: -2px 0 12px rgba(0,0,0,0.1);
  user-select: none;
}

#swe-edge-tab:hover {
  width: 44px;
  opacity: 1;
  box-shadow: -4px 0 20px rgba(37, 99, 235, 0.3);
}

#swe-edge-tab.swe-edge-tab--hidden {
  opacity: 0;
  pointer-events: none;
}
```

### 11.5 悬浮面板 CSS 实现

```css
/* 悬浮面板 */
#swe-panel {
  position: fixed;
  right: 0;
  top: 0;
  width: 420px;
  height: 100vh;
  z-index: 9999;
  display: flex;
  flex-direction: row;
}

/* 面板阴影过渡带（4px，不遮挡内容）*/
.swe-panel-shadow {
  width: 4px;
  background: linear-gradient(to left, rgba(0,0,0,0.08), transparent);
  flex-shrink: 0;
}

/* 面板主体 */
.swe-panel-body {
  flex: 1;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-shadow: -4px 0 24px rgba(0,0,0,0.12);
  overflow: hidden;
}

/* 响应式：小屏全宽 */
@media (max-width: 480px) {
  #swe-panel { width: 100vw; }
  .swe-panel-shadow { display: none; }
}
```

### 11.6 边沿标签与悬浮按钮的共存策略

```
边沿标签是核心视觉锚点，始终存在。
之前的 "浮动按钮"（右下角圆形按钮）不再单独渲染，
它的功能合并到边沿标签中：

旧设计:  边沿标签 + 右下角浮动按钮（两个 UI 元素，用户困惑）
新设计:  仅边沿标签（单一视觉锚点，点击 = 打开面板 = 开始提取）

右键菜单和键盘快捷键作为辅助触发方式保持不变。
```

### 11.7 面板内 AI 对话实现

```javascript
// 对话式 AI 调整（在编辑 Tab 底部聊天区）
async function sendChatMessage(userInput) {
  const chatMessages = document.querySelector('.swe-chat__messages');

  // 追加用户消息
  chatMessages.appendChild(createChatBubble('user', userInput));

  // 构建上下文：当前摘要 + 原始内容 + 用户指令
  const messages = [
    { role: 'system', content: '你是编辑助手。根据用户指令修改以下摘要。只返回修改后的内容。' },
    { role: 'assistant', content: `当前摘要：\n${currentSummary}` },
    { role: 'user', content: userInput },
  ];

  // 流式调用 AI
  const port = chrome.runtime.connect({ name: 'ai-stream' });
  port.postMessage({ type: 'ai:stream', provider, messages });

  const aiBubble = createChatBubble('ai', '');
  chatMessages.appendChild(aiBubble);

  port.onMessage.addListener((msg) => {
    if (msg.type === 'ai:stream:chunk') {
      aiBubble.textContent += msg.chunk;
      // 同步更新编辑区
      updateEditorContent(aiBubble.textContent);
    } else if (msg.type === 'ai:stream:done') {
      port.disconnect();
    }
  });
}
```

### 11.8 键盘快捷键（简化后）

| 快捷键 | 作用域 | 功能 |
|--------|--------|------|
| `Ctrl+Shift+E` | 全局 | 打开/关闭悬浮面板 |
| `Escape` | 面板内 | 关闭面板 |
| `Ctrl+Enter` | 面板编辑 Tab | 发送 AI 对话 |
| `Tab` | 全局 | 焦点导航 |

**快捷键自定义说明**：Chrome 扩展的 `commands` 快捷键在 `manifest.json` 的 `commands` 字段声明默认值后，扩展自身的代码无法修改它。用户如需自定义，需前往 `chrome://extensions/shortcuts` 浏览器快捷键设置页自行更改。设置页应在"快捷键"一项旁提供跳转链接并说明"键盘快捷键的修改入口在浏览器扩展管理页"，避免用户在设置页内寻找修改入口而困惑。


### 11.9 UI 层文件清单（简化后）

```
content/floating-panel.js   — 悬浮面板核心逻辑（~1000 行）
                              边沿标签渲染、面板滑入/滑出动画、
                              Tab切换、提取流程控制、内联编辑器、
                              内联导出、AI对话、Toast通知、
                              面板状态机、键盘快捷键

content/content.css          — 注入样式（~500 行）
                              边沿标签样式、面板布局、Tab导航、
                              按钮/输入框/卡片等组件（面板内使用）、
                              进度条、Toast、响应式、暗色模式

pages/settings/settings.html — 设置页（唯一独立页面）
pages/settings/settings.css  — 设置页样式（~300 行）
pages/settings/settings.js   — 设置页逻辑（~500 行）
                              API Key 加密管理、规则CRUD、
                              语言切换、触发方式开关
```

### 11.10 注入与隔离

```
Content Script 将悬浮面板 DOM 直接注入到宿主页面。

隔离措施：
1. 所有 CSS 使用 #swe-root 前缀 → .swe-* 命名空间
2. Shadow DOM 可选增强隔离（v1 版本先不用，保持简单）
3. z-index 9998-9999，确保不被页面其他元素遮挡
4. 事件监听器全部挂在面板 DOM 内，防止与页面冲突
5. 面板对宿主页面的 CSS 使用 all: initial 重置
```

---

## 12. 验收清单

> 本清单与 PRD 第 11 节《验收清单》对应，从技术实现角度补充验证方法。

### 12.1 代码结构验收

| # | 验收项 | 标准 | 方法 |
|---|--------|------|------|
| CS-01 | 文件完整性 | 34 个文件全部存在，路径与 8.文件结构 一致 | `ls -R` |
| CS-02 | 零依赖 | 所有代码不含 import 第三方库，无 node_modules | `grep import` |
| CS-03 | ES 模块 | Content Script 和 Page 使用 `<script type="module">`，SW 使用传统脚本 | 检查 HTML/JS |
| CS-04 | 命名空间隔离 | lib/ 模块使用 IIFE 包装，不污染全局命名空间 | 审查代码 |
| CS-05 | 注释覆盖率 | 核心模块（extractor / ai-providers / storage / exporter）注释行 ≥ 30% | `grep -c '//'` |
| CS-06 | 无 console.log 泄漏 Key | 全局搜索 `console.log` 无 Key 相关参数 | `grep console.log` |

### 12.2 API 与通信验收

| # | 验收项 | 标准 | 方法 |
|---|--------|------|------|
| API-01 | 消息类型完整性 | MESSAGE_TYPES 枚举覆盖所有 20 种消息类型 | 检查 service-worker.js |
| API-02 | 消息格式一致 | 所有 sendMessage 消息包含 {type, payload?, tabId?, requestId?} | 代码审查 |
| API-03 | 长连接实现 | AI 流式调用使用 `chrome.runtime.connect`，非轮询 | 检查 editor.js |
| API-04 | 错误响应格式 | 所有 catch 块返回 `{success: false, error: {code, message}}` | 代码审查 |
| API-05 | Host 权限仅 AI 供应商 | manifest.json host_permissions 仅含 deepseek.com + aliyuncs.com | 检查 manifest |

### 12.3 安全实现验收

| # | 验收项 | 标准 | 方法 |
|---|--------|------|------|
| SEC-01 | Key 加密存储 | storage.js 中 saveApiKey 使用 AES-GCM 256 加密 | 代码审查 |
| SEC-02 | Key 解密即清 | ai-providers.js 中 getApiKey 调用后 finally 块置 null | 代码审查 |
| SEC-03 | Key 脱敏显示 | UI 层 maskApiKey 函数显示首 4+尾 4 | 代码审查 |
| SEC-04 | 导出排 Key | exporter.js 中规则导出逻辑排除 secure: 前缀键 | 代码审查 |
| SEC-05 | Sync 二次确认 | enableApiKeySync 函数含 confirm 弹窗 | 代码审查 |
| SEC-06 | CSP 仅允许 API 域 | manifest.json CSP connect-src 仅 2 个 API 域名 | 检查 manifest |
| SEC-07 | 最小权限 | manifest permissions ≤ 5 项，无 cookies/webRequest/history | 检查 manifest |
| SEC-08 | 无 eval | 全局搜索无 eval() / new Function() 调用 | `grep eval` |

### 12.4 性能实现验收

| # | 验收项 | 标准 | 方法 |
|---|--------|------|------|
| PERF-01 | 提取算法 O(n) | extractor.js 中 extract() 为单次 DOM 遍历 | 代码审查 |
| PERF-02 | 图片懒加载 | 图片缩略图使用 loading="lazy" | 检查 HTML |
| PERF-03 | Debounce 搜索 | 输入搜索类操作使用 debounce 300ms | 代码审查 |
| PERF-04 | SW 休眠兼容 | Service Worker 不依赖持久状态，重启后正常恢复 | 审查 SW 代码 |
| PERF-05 | 无同步阻塞 | AI 调用为 async，不阻塞 UI 线程 | 代码审查 |

### 12.5 兼容性实现验收

| # | 验收项 | 标准 | 方法 |
|---|--------|------|------|
| COMP-01 | Manifest V3 合规 | manifest.json 无 V2 字段（background.page 等） | 检查 manifest |
| COMP-02 | Chrome ≥114 | 悬浮面板（Content Script 注入 DOM，无需 chrome.sidePanel） | 检查悬浮面板 inject 逻辑 |
| COMP-03 | 无 FF-only API | 未使用 `browser.*` Promise 风格 API | `grep 'browser\.'` |
| COMP-04 | CSS 兼容 | 未使用仅 Firefox 支持的 CSS（::-moz-* 除外） | 审查 CSS |

### 12.6 文档验收

| # | 验收项 | 标准 | 方法 |
|---|--------|------|------|
| DOC-01 | README 含安装步骤 | 列出 1.打开扩展管理 2.开启开发者模式 3.加载已解压扩展 4.配置 API Key | 阅读 README |
| DOC-02 | 使用说明完整 | 覆盖所有 12 个功能模块的使用方法 | 对照 PRD 功能清单 |
| DOC-03 | 常见问题 FAQ | 包含 ≥ 5 条常见问题和解决方案 | 阅读 README |
| DOC-04 | 中英双语文档 | README.md（中）+ README_EN.md（英） | 文件存在 |

### 12.7 验收统计

| 分类 | 项数 | 对应 PRD |
|------|------|----------|
| 代码结构 | 6 | - |
| API 与通信 | 5 | - |
| 安全实现 | 8 | PRD 安全验收 S-01~S-07 |
| 性能实现 | 5 | PRD 性能验收 P-01~P-04 |
| 兼容性实现 | 4 | PRD 兼容验收 C-01~C-04 |
| 文档 | 4 | PRD 文档验收 D-01~D-04 |
| **总计** | **32** | - |

> **验收通过标准**：32 项全部通过，安全相关项 (SEC-01~08) 必须 100% 通过。

---

> **下一步**：按文件结构开始编写全部源代码
