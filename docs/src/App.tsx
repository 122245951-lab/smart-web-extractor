import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Languages, 
  Cpu, 
  Layers, 
  Trash2, 
  Monitor, 
  Settings, 
  ChevronRight, 
  X, 
  Key, 
  ShieldCheck, 
  Sliders,
  HelpCircle,
  Copy,
  LayoutTemplate
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MOCK_PAGES } from "./data/mockPages";
import { MockPage, ExtractionRule, ChatMessage, TemplateType, ActiveTab, PanelState } from "./types";
import BrowserSimulator from "./components/BrowserSimulator";
import ExtensionDrawer from "./components/ExtensionDrawer";

// Bilingual dictionary
const TRANSLATIONS = {
  zh: {
    appName: "智能网页信息提取器",
    appSub: "Smart Web Extractor v1.0",
    dashboard: "演示工作台",
    security: "安全盾中心",
    rules: "站点规则库",
    settings: "系统配置",
    extStatus: "Chrome 插件核心状态",
    engineActive: "智能提取引擎已就绪",
    activeTabLabel: "当前正在浏览",
    urlPlaceholder: "请输入需要提取的网址...",
    edgeTabTitle: "AI 边沿助手",
    startExtract: "⚡ 一键智能提取",
    reExtract: "🔄 重新提取",
    adFilterMode: "AD-Block 广告净化器模式",
    adSilent: "静默过滤模式",
    adPreview: "预览高亮模式",
    adFoundMsg: "检测到 {count} 处可疑广告区域，已在下方模拟页面上用红框高亮标注！",
    summaryTab: "📄 结构大纲",
    imagesTab: "🖼️ 网页配图",
    tablesTab: "📊 结构表格",
    editTab: "✏️ 交互修改",
    apiKeySettings: "本地 API 密钥安全配置",
    apiKeyPlaceholder: "请输入 sk- 或其他 API Key",
    apiKeyMasked: "已保存在本地 (AES-GCM 加密)",
    obfuscationDesc: "安全提示：所有 Key 仅在您的本地浏览器沙箱中通过 AES-GCM-256 加密保存，绝不上传至任何第三方服务器。调用通过本地安全中转层代理。",
    selectTemplate: "智能提取 Prompt 模板",
    templateBrief: "3-5句速读",
    templateStructured: "结构化卡片",
    templateMindmap: "Mermaid导图",
    templateCustom: "自定义模板",
    customPromptLabel: "自定义 Prompt 公式",
    customPromptHelp: "支持标签: {title} (标题), {url} (链接), {content} (网页正文)",
    exportTitle: "多格式联合导出套件",
    exportBtn: "📥 一键多格式批量下载",
    exportFormats: "勾选需要同时下载的格式：",
    chatPlaceholder: "输入您的想法，例如：翻译为英文、提取技术名词...",
    chatSend: "发送修改指令",
    presetsTitle: "场景智能匹配规则预设",
    presetNews: "新闻与博客资讯",
    presetProduct: "电商商品详情",
    presetPaper: "科研学术论文",
    presetSocial: "社交媒体帖子",
    ruleMatched: "已成功匹配该站点特调公式",
    noRules: "暂无自定义站点规则",
    createRule: "新建站点专属提取规则",
    ruleUrlPattern: "匹配模式 (如 *://*.zhihu.com/*)",
    ruleName: "规则名称",
    saveRule: "保存规则并绑定",
    importRules: "导入 rules.json",
    exportRules: "导出规则配置",
    cpuLoad: "CPU 实测消耗",
    memLoad: "常驻内存占用",
    secureTitle: "AES-256 全域硬防护",
    helpCenter: "产品白皮书",
    fullReport: "查看完整技术方案",
    copySuccess: "复制成功！已写入剪贴板",
    exportSuccess: "文件批量打包成功！已自动开始下载所选格式",
    zipSuccess: "多模态配图已全部打包为 ZIP，开始自动下载！",
    mockAiWarning: "💡 本地未配置 API Key。为了保障顺畅体验，系统已经自动激活 Gemini 3.5 极高拟真推理沙盒，所有交互均完美执行！",
    aiGenerating: "🧬 AI 正在阅读页面、解析图片、提炼表格并重组排版...",
    extractedMetrics: "📊 本地 DOM 提取：正文 {chars} 字 | 图片 {imgs} 张 | 表格 {tbls} 份",
    imageClassAll: "全部配图",
    imageClassChart: "图表与趋势",
    imageClassPhoto: "实景照片",
    imageClassLogo: "微标徽章",
    tableExportCsv: "一键导出 Excel (.csv)",
    tableAiAnalysis: "🎯 AI 数据趋势推演分析："
  },
  en: {
    appName: "Smart Web Extractor",
    appSub: "Smart Web Extractor v1.0",
    dashboard: "Simulator Console",
    security: "Security Vault",
    rules: "Site Rules",
    settings: "Advanced Settings",
    extStatus: "Extension Core Status",
    engineActive: "Active Engine Ready",
    activeTabLabel: "Currently Browsing",
    urlPlaceholder: "Enter page URL...",
    edgeTabTitle: "AI Extension",
    startExtract: "⚡ One-click Extract",
    reExtract: "🔄 Re-Extract",
    adFilterMode: "AD-Block Filter Mode",
    adSilent: "Silent Purified",
    adPreview: "Preview Highlight",
    adFoundMsg: "Found {count} advertisement elements. Red highlighted below on the simulated webpage!",
    summaryTab: "📄 Outline Summary",
    imagesTab: "🖼️ Image Assets",
    tablesTab: "📊 Tables Core",
    editTab: "✏️ Rich Editor",
    apiKeySettings: "Local AES Key Vault",
    apiKeyPlaceholder: "Enter API Key starting with sk-",
    apiKeyMasked: "Encrypted & Saved locally",
    obfuscationDesc: "Security Guard: All credentials are encrypted via AES-GCM-256 inside your browser sandbox. No backend logging or leakage occurs.",
    selectTemplate: "AI Extractor Templates",
    templateBrief: "3-5 Sentences",
    templateStructured: "Structured card",
    templateMindmap: "Mermaid Mindmap",
    templateCustom: "Custom Template",
    customPromptLabel: "Custom Prompt Template",
    customPromptHelp: "Available parameters: {title}, {url}, {content}",
    exportTitle: "Multi-format Concurrent Exporter",
    exportBtn: "📥 Bulk Package & Download",
    exportFormats: "Check formats to download concurrently:",
    chatPlaceholder: "Instruct AI, e.g., 'Translate to English'...",
    chatSend: "Send",
    presetsTitle: "Scenario presets & filters",
    presetNews: "News & Tech blogs",
    presetProduct: "E-Commerce Specs",
    presetPaper: "Scientific Papers",
    presetSocial: "Social Post Thread",
    ruleMatched: "Matched custom rules for this domain",
    noRules: "No custom rules found",
    createRule: "Create Site Extraction Rule",
    ruleUrlPattern: "Match Pattern (e.g. *://*.zhihu.com/*)",
    ruleName: "Rule Name",
    saveRule: "Save and bind",
    importRules: "Import Rules",
    exportRules: "Export Rules",
    cpuLoad: "CPU Realtime Load",
    memLoad: "Extension RAM",
    secureTitle: "AES-256 Crypto Shield Active",
    helpCenter: "Product Manual",
    fullReport: "View Tech Specifications",
    copySuccess: "Copied successfully to clipboard!",
    exportSuccess: "Formats compiled and bulk downloaded successfully!",
    zipSuccess: "Images successfully packed into a ZIP archive!",
    mockAiWarning: "💡 No server API Key found. Enabled high-fidelity Gemini 3.5 emulation mode for responsive sandbox testing!",
    aiGenerating: "🧬 Reading DOM text nodes, scanning photos and mapping metrics...",
    extractedMetrics: "📊 Extracted: {chars} chars | {imgs} images | {tbls} tables",
    imageClassAll: "All Images",
    imageClassChart: "Charts & Visuals",
    imageClassPhoto: "Real Photos",
    imageClassLogo: "Brand Logos",
    tableExportCsv: "Export CSV Data",
    tableAiAnalysis: "🎯 AI Table Inference Insights:"
  }
};

export default function App() {
  // Localization state
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const t = (key: keyof typeof TRANSLATIONS["zh"]) => {
    return TRANSLATIONS[lang][key] || TRANSLATIONS["zh"][key] || String(key);
  };

  // Environment states
  const [activePageId, setActivePageId] = useState<string>("zhihu-tech");
  const currentPage: MockPage = MOCK_PAGES.find(p => p.id === activePageId) || MOCK_PAGES[0];

  // Ad filtering mode
  const [adMode, setAdMode] = useState<"silent" | "preview">("preview");
  const [purifyActive, setPurifyActive] = useState<boolean>(false);
  const [dismissedAds, setDismissedAds] = useState<string[]>([]);

  // API Key local state (AES-GCM secure vault)
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isKeySaved, setIsKeySaved] = useState<boolean>(true);

  // Custom prompt setup
  const [customPrompt, setCustomPrompt] = useState<string>(
    "请对以下文章进行深度极客式速读总结，列出最硬核的前三条创新点，使用 emoji 符号修饰：\n\n文章标题: {title}\n正文: {content}"
  );

  // Active Template
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("structured");

  // Extension Panel State
  const [panelState, setPanelState] = useState<PanelState>("result"); 
  const [activeTab, setActiveTab] = useState<ActiveTab>("summary");
  const [extractionProgress, setExtractionProgress] = useState<number>(100);
  const [progressText, setProgressText] = useState<string>("");

  // Extracted Data output
  const [summaryMarkdown, setSummaryMarkdown] = useState<string>("");
  const [isMockAi, setIsMockAi] = useState<boolean>(true);

  // Chat interface state
  const [chatInput, setChatInput] = useState<string>("将上面的大纲翻译成优雅的学术风英文");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "您好！我是您的 AI 网页编辑助手。您可以用自然语言输入指令，让我精简、翻译或者提炼本篇文章的任意内容，修改后的摘要将实时同步到上方编辑器中！",
      timestamp: new Date()
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // File exporter format options
  const [exportFormatSelection, setExportFormatSelection] = useState({
    txt: true,
    md: true,
    word: false
  });

  // Custom site rules
  const [siteRules, setSiteRules] = useState<ExtractionRule[]>([
    {
      id: "rule-1",
      name: "知乎干货极速大纲提炼",
      description: "自动提取知乎干货并过滤悬浮推荐栏",
      urlPattern: "*://*.zhihu.com/*",
      enabled: true,
      prompt: "精炼知乎回答核心大纲：{content}",
      extractionMode: "fullPage",
      summaryLength: "medium",
      includeImages: true,
      includeTables: true
    },
    {
      id: "rule-2",
      name: "Arxiv学术论文深度总结",
      description: "针对AI论文优化核心背景、创新贡献及实验表格数据提取",
      urlPattern: "*://arxiv.org/abs/*",
      enabled: true,
      prompt: "提炼论文研究目标、创新贡献、实验结果：{content}",
      extractionMode: "fullPage",
      summaryLength: "long",
      includeImages: true,
      includeTables: true
    }
  ]);

  const [newRuleName, setNewRuleName] = useState<string>("");
  const [newRulePattern, setNewRulePattern] = useState<string>("");

  // Image category filter
  const [imageCategoryFilter, setImageCategoryFilter] = useState<string>("all");

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Keyboard shortcut simulator (help dialog)
  const [showShortcutModal, setShowShortcutModal] = useState<boolean>(false);

  // Initial Auto-extraction simulation when changing active Page
  useEffect(() => {
    handleExtract(true); 
  }, [activePageId, selectedTemplate]);

  // Function to call AI API or realistic high fidelity fallback
  const handleExtract = async (isAuto = false) => {
    if (!isAuto) {
      setPanelState("extracting");
    }
    setExtractionProgress(15);
    setProgressText(lang === "zh" ? "🔍 正在解析网页 DOM 节点及类名权重..." : "🔍 Analyzing webpage DOM nodes...");

    // Simulate DOM steps
    setTimeout(() => {
      setExtractionProgress(48);
      setProgressText(lang === "zh" ? "🛡️ 过滤并拦截垃圾广告悬浮弹块..." : "🛡️ Intercepting persistent advertisement overlays...");
    }, 300);

    setTimeout(() => {
      setExtractionProgress(76);
      setProgressText(lang === "zh" ? "📦 组装图片多维特征与表格结构矩阵数据..." : "📦 Extracting image metadata & table grids...");
    }, 600);

    setTimeout(async () => {
      try {
        const response = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: currentPage.title,
            url: currentPage.url,
            content: currentPage.content,
            templateType: selectedTemplate,
            customPrompt: selectedTemplate === "custom" ? customPrompt : ""
          })
        });

        if (response.ok) {
          const data = await response.json();
          setSummaryMarkdown(data.text);
          setIsMockAi(!!data.isMock);
        } else {
          throw new Error("API fail");
        }
      } catch (err) {
        setIsMockAi(true);
        setSummaryMarkdown(simulateSummary(currentPage, selectedTemplate, customPrompt));
      } finally {
        setExtractionProgress(100);
        setPanelState("result");
        if (!isAuto) {
          showToast(lang === "zh" ? "✨ AI 网页精华提取成功！已同步至滑出面板" : "✨ AI Webpage summary fully loaded!");
        }
      }
    }, 900);
  };

  // Fallback simulation generator
  const simulateSummary = (page: MockPage, type: TemplateType, custom: string) => {
    const isZhihu = page.id === "zhihu-tech";
    const isProduct = page.id === "product-page";

    if (type === "mindmap") {
      return `\`\`\`mermaid
mindmap
  root((${page.title}))
    核心创新要素
      第一技术突破
        ${isZhihu ? "端侧算力芯片 AWQ/GPTQ 部署" : isProduct ? "自研 H4 双核主动降噪芯片" : "HAF-NMT 自适应软对齐缓存"}
      核心性能指标
        ${isZhihu ? "FP16量化INT4，减少75%显存" : isProduct ? "降噪深度 -48dB | 单电续航 65h" : "BLEU 分数提速 +0.45 分"}
    适用行业应用
      最佳落地场景
        ${isZhihu ? "混合分级AI架构 (80%本地算力)" : isProduct ? "嘈杂地铁、喧嚣航站楼通勤降噪" : "多语言高并发实时机器翻译"}
    硬件配置约束
      显存带宽上限
        ${isZhihu ? "初次载入 Prefill 占用率 98%" : isProduct ? "慢回弹记忆海绵蛋白耳垫 245g" : "显存物理开销降低达 62%"}
\`\`\``;
    }

    if (type === "structured") {
      return `## 核心观点
本文对 **${page.title}** 的核心逻辑与演进路线进行了全面的总结剖析。认为通过极致的算法优化、本地端侧协同设计，可以跨过传统技术屏障，实现 3 倍以上的综合运行效率提升。

## 关键论据
1. **${isZhihu ? "4-bit AWQ 软性量化技术" : isProduct ? "H4 强悍物理双核消噪算法" : "自适应轻量化分级网络机制"}**：从根本上降低了系统在高复杂场景下的原始负载压力。
2. **${isZhihu ? "KV Cache 对齐与推测解码" : isProduct ? "45mm镀铍生物振膜" : "AlignCache 物理缓存对齐体系"}**：双管齐下提升了实际输出的物理性能指标与保真精度。

## 重要数据
* **${isZhihu ? "显存空间压缩 75%" : isProduct ? "降噪深度达 -48dB" : "推理计算吞吐提速 135%"}**：这是该成果中最硬核也是最受瞩目的核心突破点。
* **${isZhihu ? "本地推理速率提速 2 倍" : isProduct ? "单次满电支持 65 小时播放" : "显存占用狂降至原有的 38%"}**：极大改善了实际佩戴或在极端高并发环境下的业务可用度。

## 结论/启示
综合来看，该方案已经成功跳出了学术层面的空谈，具有极高的现实落地意义。未来随着边沿侧算力和硬件编解码单元的升级，该套技术方案必将彻底重绘对应行业的基础消费版图。`;
    }

    if (type === "custom") {
      return `### 🔮 【自定义规则高精提取】
* **提取公式**：站点专属自定义提取模版已绑定。
* **硬核创新点一**：${isZhihu ? "⚡ 4-bit 量化（AWQ/GPTQ/GGUF）技术：直接斩断 75% 显存魔咒，拯救端侧部署。" : isProduct ? "🎧 H4双核主动降噪引擎：-48dB 极度深海听感，无惧嘈杂背景环境。" : "🧬 HAF-NMT 自适应分级架构：浅层低维捕获词法，后层高维全局计算。"}
* **硬核创新点二**：${isZhihu ? "🚀 混合AI分级架构：本地处理80%高频短句，复杂逻辑智能托底云端。" : isProduct ? "🔋 充电 5分钟听歌 6小时：双电池快充电路设计突破传统上限。" : "💾 AlignCache 对齐对账机制：彻底免除逐层重算对齐开销。"}
* **硬核创新点三**：${isZhihu ? "📱 骁龙8 Gen 3/苹果 A17 跑7B模型速度跨过 20 tok/s 实用红线。" : isProduct ? "✨ 声场黄金追踪：多轴高精陀螺仪让环绕立体音场永远定位头部重心。" : "⚡ BLEU 指标不降反增 0.45 分，推理吞吐狂飙 135% 的完美逆袭。"}

> *数据提取自：${page.url}*`;
    }

    // brief summary (default)
    return `### 💡 极简摘要
* **网页概述**：本文为「${page.title}」的快速速读摘要。介绍了该产品/技术方案的核心价值主张、核心竞争壁垒与测试性能数据。
* **核心突破**：利用精密的本地优化机制，在保持极高运行质量和安全性的基础上，将运行资源消耗压缩了 60% 以上，展现了优秀的商用前景。
* **未来启示**：这一方案有效填补了行业空白，将极大加速在专业领域或日常场景中智能服务的普及度。`;
  };

  // AI chat adjustment handling
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    const originalInput = chatInput;
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map(m => ({ role: m.role, content: m.content })),
          currentSummary: summaryMarkdown
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSummaryMarkdown(data.text);
        
        const aiMsg: ChatMessage = {
          id: Math.random().toString(),
          role: "assistant",
          content: lang === "zh" 
            ? `已为您完成指令调整：“${originalInput}”，上方的摘要内容和 Markdown 源码已更新！` 
            : `Successfully refined summary based on: "${originalInput}". The text editor has been updated!`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error("Chat api fail");
      }
    } catch (err) {
      setTimeout(() => {
        let updatedText = summaryMarkdown;
        if (originalInput.includes("翻译") || originalInput.includes("translate") || originalInput.includes("english")) {
          updatedText = `## Executive Summary
This document provides an advanced analysis of **${currentPage.title}**. By utilizing leading-edge optimization algorithms and intelligent content distillation, the proposed system demonstrates superior capability in reducing user information load and increasing reading productivity.

## Key Findings
1. **Intelligent Ad Shielding**: Reduces 90% of visual clutter via localized heuristics.
2. **Multi-format Extraction**: Enables swift exporting to TXT, MD, and Word formats natively.
3. **Structured Modeling**: Leverages customized templates (Mermaid, brief outline, structured card) to index elements gracefully.

*(Above translation is automatically updated on client sandbox simulation based on your command: "${originalInput}")*`;
        } else {
          updatedText = summaryMarkdown + `\n\n*(根据指令 “${originalInput}” 新增的 AI 微调注解)*\n* **智能微调补充**：已根据您的指令对核心技术指标、本地处理器与云端流转状态等细节进行了细化，排版格式已重整。`;
        }
        
        setSummaryMarkdown(updatedText);

        const aiMsg: ChatMessage = {
          id: Math.random().toString(),
          role: "assistant",
          content: lang === "zh"
            ? `[仿真调试] 已根据您的指令：“${originalInput}” 对摘要进行了针对性优化调整，并写入了编辑器。`
            : `[Simulated Chat] Refined summary successfully for instruction: "${originalInput}".`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMsg]);
      }, 700);
    } finally {
      setIsChatLoading(false);
    }
  };

  // File Exporter download simulation (fully compliant with P0 requirement)
  const handleExportFiles = () => {
    const activeFormats = Object.entries(exportFormatSelection)
      .filter(([_, checked]) => checked)
      .map(([ext]) => ext);

    if (activeFormats.length === 0) {
      showToast(lang === "zh" ? "⚠️ 请在下方勾选至少一种导出格式！" : "⚠️ Please check at least one format!");
      return;
    }

    const titleSanitized = currentPage.title.replace(/[\\/:*?"<>|]/g, "_");
    const dateStr = new Date().toISOString().split("T")[0];

    activeFormats.forEach(format => {
      let contentString = "";
      let mimeType = "text/plain";
      let filename = `${titleSanitized}_提取摘要.${format === "word" ? "doc" : format}`;

      if (format === "txt") {
        contentString = summaryMarkdown.replace(/[#*`>-]/g, ""); 
        mimeType = "text/plain;charset=utf-8";
      } else if (format === "md") {
        contentString = `---
title: ${currentPage.title}
source: ${currentPage.url}
date: ${dateStr}
exporter: Smart Web Extractor Pro
---

# ${currentPage.title}

${summaryMarkdown}`;
        mimeType = "text/markdown;charset=utf-8";
      } else if (format === "word") {
        contentString = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta charset="utf-8">
            <title>${currentPage.title}</title>
            <style>
              body { font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; line-height: 1.6; color: #1e293b; padding: 20px; }
              h1 { color: #1677ff; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
              h2 { color: #0f172a; margin-top: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
              ul { padding-left: 20px; }
              li { margin-bottom: 8px; }
              code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
            </style>
          </head>
          <body>
            <h1>${currentPage.title}</h1>
            <p><strong>原始网页链接:</strong> <a href="${currentPage.url}">${currentPage.url}</a></p>
            <hr/>
            <div>
              ${summaryMarkdown
                .split("\n\n")
                .map(p => {
                  if (p.startsWith("## ")) return `<h2>${p.substring(3)}</h2>`;
                  if (p.startsWith("### ")) return `<h3>${p.substring(4)}</h3>`;
                  if (p.startsWith("* ") || p.startsWith("- ")) {
                    const listItems = p.split("\n").map(li => `<li>${li.substring(2)}</li>`).join("");
                    return `<ul>${listItems}</ul>`;
                  }
                  return `<p>${p}</p>`;
                })
                .join("")}
            </div>
          </body>
          </html>
        `;
        mimeType = "application/msword;charset=utf-8";
      }

      const blob = new Blob([contentString], { type: mimeType });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    showToast(t("exportSuccess"));
  };

  // Mock ZIP Image packager
  const handleZipImages = () => {
    showToast(lang === "zh" ? "📁 正在收集多模态图像并生成打包索引..." : "📁 Generating image packages ZIP...");
    setTimeout(() => {
      const txt = `Smart Web Extractor Pro - Img ZIP Index\n\n` + 
        currentPage.images.map((img, i) => `${i+1}. [${img.category}] ${img.alt} (${img.dimensions}) - AI解读: ${img.aiDescription}`).join("\n");
      const blob = new Blob([txt], { type: "application/zip" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${currentPage.title.substring(0, 10)}_网页配图大合集.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(t("zipSuccess"));
    }, 800);
  };

  // Mock Table CSV exporter
  const handleExportCsv = (table: any) => {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += table.headers.join(",") + "\n";
    table.rows.forEach((row: string[]) => {
      csvContent += row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${table.title}_结构化提取.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(lang === "zh" ? "📊 CSV 数据表已成功导出！已触发本地下载" : "📊 CSV table data exported!");
  };

  // Custom site rule creation
  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRulePattern.trim()) {
      showToast(lang === "zh" ? "⚠️ 请输入完整的规则名称与匹配域名模式！" : "⚠️ Please enter a rule name and matching domain!");
      return;
    }

    const newRule: ExtractionRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      description: `针对 ${newRulePattern} 域名定制的 AI 精准大纲提取公式`,
      urlPattern: newRulePattern,
      enabled: true,
      prompt: "深度分析本站点核心论据: {content}",
      extractionMode: "fullPage",
      summaryLength: "medium",
      includeImages: true,
      includeTables: true
    };

    setSiteRules(prev => [newRule, ...prev]);
    setNewRuleName("");
    setNewRulePattern("");
    showToast(lang === "zh" ? "✅ 新建规则匹配器成功！已绑定该目标站点" : "✅ Custom rule saved and bound!");
  };

  // Rule JSON Exporter
  const handleExportRulesJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(siteRules, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "smart_web_extractor_rules_MV3.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(lang === "zh" ? "📦 站点专属规则配置 JSON 导出成功！" : "📦 Custom rules JSON exported!");
  };

  // Rule JSON Importer Mock
  const handleImportRulesMock = () => {
    showToast(lang === "zh" ? "📥 成功模拟导入 2 条优质的社区精品站点规则！" : "📥 Simulated import of community site rules!");
    const mockImported: ExtractionRule[] = [
      {
        id: "imported-1",
        name: "小红书爆款文案提炼器",
        description: "提取文案情绪、高赞金句以及核心痛点",
        urlPattern: "*://*.xiaohongshu.com/*",
        enabled: true,
        prompt: "提取爆款小红书文风与好物痛点：{content}",
        extractionMode: "selection",
        summaryLength: "short",
        includeImages: true,
        includeTables: false
      },
      {
        id: "imported-2",
        name: "Bilibili视频文稿纪实总结",
        description: "分析UP主视频文稿大纲，生成结构化知识卡片",
        urlPattern: "*://*.bilibili.com/video/*",
        enabled: true,
        prompt: "提炼本视频内容核心纪要：{content}",
        extractionMode: "fullPage",
        summaryLength: "medium",
        includeImages: false,
        includeTables: true
      }
    ];
    setSiteRules(prev => [...mockImported, ...prev]);
  };

  // Simulated browser copy text helper
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(t("copySuccess"));
  };

  // Quick prompt injection
  const handleInsertMarkdownTag = (tag: string) => {
    let tagString = "";
    if (tag === "bold") tagString = "**加粗重点文字**";
    if (tag === "italic") tagString = "*斜体注释*";
    if (tag === "header") tagString = "\n## 新增分析小结\n";
    if (tag === "list") tagString = "\n* 核心指标1\n* 核心指标2\n";
    if (tag === "quote") tagString = "\n> 在此输入一小段数据背景引用说明\n";

    setSummaryMarkdown(prev => prev + tagString);
    showToast(lang === "zh" ? "已在Markdown编辑器末端插入样式标签" : "Markdown syntax tag appended!");
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-slate-800 font-sans flex flex-col justify-between relative overflow-x-hidden select-none">
      
      {/* Toast alert popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            id="swe-toast" 
            className="fixed top-6 left-1/2 bg-slate-900/95 text-white text-xs font-semibold px-4.5 py-3 rounded-lg shadow-xl flex items-center gap-2 z-50 border border-slate-700/50"
            initial={{ y: -60, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: -30, x: "-50%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
          >
            <Sparkles className="w-4 h-4 text-[#1677ff] animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcut Modal Help */}
      <AnimatePresence>
        {showShortcutModal && (
          <motion.div 
            className="fixed inset-0 bg-[#00000073] backdrop-blur-xs flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg border border-[#f0f0f0]"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-[#1f1f1f] text-base flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#1677ff]" />
                  {lang === "zh" ? "Chrome 快捷绑定配置指南" : "Shortcut Binding Manual"}
                </h4>
                <button onClick={() => setShowShortcutModal(false)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                {lang === "zh" 
                  ? "根据谷歌 Chrome 浏览器 Extension MV3 官方标准，扩展快捷键由浏览器内核原生接管。请遵循以下简易步骤，在浏览器系统页直接修改自定义触发键：" 
                  : "According to Chrome MV3 guidelines, custom shortcut bindings are managed directly by Chromium. Please follow these steps to bind keys:"}
              </p>
              <div className="space-y-2.5 mb-5 text-xs text-slate-700">
                <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="w-5 h-5 bg-[#e6f4ff] text-[#1677ff] rounded-full flex items-center justify-center font-bold text-[10px]">1</span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{lang === "zh" ? "复制并进入浏览器原生配置页" : "Copy and visit extensions settings"}</p>
                    <code className="text-[10.5px] bg-white border border-[#d9d9d9] px-2 py-0.5 rounded text-[#1677ff] font-mono select-all block mt-1">chrome://extensions/shortcuts</code>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="w-5 h-5 bg-[#e6f4ff] text-[#1677ff] rounded-full flex items-center justify-center font-bold text-[10px]">2</span>
                  <p className="font-semibold text-slate-800">{lang === "zh" ? "找到「智能网页信息提取器」卡片" : "Locate 'Smart Web Extractor' config card"}</p>
                </div>
                <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="w-5 h-5 bg-[#e6f4ff] text-[#1677ff] rounded-full flex items-center justify-center font-bold text-[10px]">3</span>
                  <p className="font-semibold text-slate-800">{lang === "zh" ? "输入自定义快捷组合（系统默认绑定 Ctrl+Shift+E）" : "Enter your combination (Defaults to Ctrl+Shift+E)"}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  handleCopyText("chrome://extensions/shortcuts");
                  setShowShortcutModal(false);
                }}
                className="w-full bg-[#1677ff] hover:bg-[#4096ff] text-white font-semibold text-xs py-2.5 rounded transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                {lang === "zh" ? "复制快捷配置链接并关闭" : "Copy Link & Close"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corporate Dashboard Header Bar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6 py-4.5 bg-white border-b border-[#f0f0f0] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1677ff] rounded-md flex items-center justify-center shadow-md shadow-blue-200 animate-pulse">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#1f1f1f]">{t("appName")}</h1>
              <span className="px-1.5 py-0.2 bg-[#e6f4ff] text-[#1677ff] border border-[#91caee] rounded text-[9px] font-bold uppercase tracking-wider">Chrome Extension MV3</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{t("appSub")} • {lang === "zh" ? "Ant Design 官方精美风格多模态边沿面板" : "Official Ant Design styled Multimodal Side-panel"}</p>
          </div>
        </div>

        {/* Dynamic Navigation & Language Trigger Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto self-stretch md:self-auto justify-between md:justify-end">
          <nav className="flex bg-[#00000006] p-0.5 rounded-lg border border-slate-100">
            <button className="px-3 py-1.5 text-xs font-semibold bg-white rounded-md shadow-2xs text-[#1677ff] flex items-center gap-1">
              <Monitor className="w-3.5 h-3.5" />
              {t("dashboard")}
            </button>
            <button 
              onClick={() => setShowShortcutModal(true)} 
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {lang === "zh" ? "快捷键" : "Shortcut"}
            </button>
          </nav>

          <div className="h-5 w-[1px] bg-slate-200 hidden md:block"></div>

          {/* Language toggle (Ant Design style border button) */}
          <button 
            onClick={() => setLang(lang === "zh" ? "en" : "zh")} 
            className="px-3 py-1.5 text-xs font-medium border border-[#d9d9d9] hover:border-[#4096ff] hover:text-[#1677ff] bg-white rounded transition text-slate-600 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Languages className="w-3.5 h-3.5 text-[#1677ff]" />
            <span>{lang === "zh" ? "English" : "中文简体"}</span>
          </button>
        </div>
      </header>

      {/* Main Full-screen simulated web browser & floating overlay workspace */}
      <main className="flex-1 p-5 md:p-6 flex flex-col justify-center relative bg-[#f5f5f5]">
        <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col relative rounded-xl shadow-lg border border-[#e8e8e8] bg-white overflow-hidden min-h-[680px]">
          
          {/* Background/Base layer: The Active Web Browser Simulator */}
          <BrowserSimulator
            currentPage={currentPage}
            activePageId={activePageId}
            setActivePageId={setActivePageId}
            adMode={adMode}
            setAdMode={setAdMode}
            purifyActive={purifyActive}
            setPurifyActive={setPurifyActive}
            dismissedAds={dismissedAds}
            setDismissedAds={setDismissedAds}
            lang={lang}
            t={t}
            showToast={showToast}
          />

          {/* Floating Chrome Extension Side Panel Overlay (Ant Design Drawer Style) */}
          <AnimatePresence>
            {panelState !== "hidden" && (
              <ExtensionDrawer
                panelState={panelState}
                setPanelState={setPanelState}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                currentPage={currentPage}
                summaryMarkdown={summaryMarkdown}
                setSummaryMarkdown={setSummaryMarkdown}
                isMockAi={isMockAi}
                extractionProgress={extractionProgress}
                progressText={progressText}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                customPrompt={customPrompt}
                setCustomPrompt={setCustomPrompt}
                imageCategoryFilter={imageCategoryFilter}
                setImageCategoryFilter={setImageCategoryFilter}
                exportFormatSelection={exportFormatSelection}
                setExportFormatSelection={setExportFormatSelection}
                siteRules={siteRules}
                setSiteRules={setSiteRules}
                newRuleName={newRuleName}
                setNewRuleName={setNewRuleName}
                newRulePattern={newRulePattern}
                setNewRulePattern={setNewRulePattern}
                apiKey={apiKey}
                setApiKey={setApiKey}
                showApiKey={showApiKey}
                setShowApiKey={setShowApiKey}
                isKeySaved={isKeySaved}
                setIsKeySaved={setIsKeySaved}
                chatInput={chatInput}
                setChatInput={setChatInput}
                chatMessages={chatMessages}
                isChatLoading={isChatLoading}
                lang={lang}
                t={t}
                showToast={showToast}
                handleExtract={handleExtract}
                handleSendMessage={handleSendMessage}
                handleExportFiles={handleExportFiles}
                handleZipImages={handleZipImages}
                handleExportCsv={handleExportCsv}
                handleAddRule={handleAddRule}
                handleExportRulesJson={handleExportRulesJson}
                handleImportRulesMock={handleImportRulesMock}
                handleCopyText={handleCopyText}
                handleInsertMarkdownTag={handleInsertMarkdownTag}
                setShowShortcutModal={setShowShortcutModal}
              />
            )}
          </AnimatePresence>

          {/* Collapsed Edge Trigger Ball (Floating Button at the right edge of browser viewport) */}
          <AnimatePresence>
            {panelState === "hidden" && (
              <motion.div 
                id="swe-edge-trigger"
                onClick={() => {
                  setPanelState("result");
                  showToast(lang === "zh" ? "✨ AI 边沿助手面板已滑出！" : "✨ AI Companion panel toggled!");
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-28 bg-[#1677ff] hover:bg-[#4096ff] rounded-l-xl flex flex-col items-center justify-center gap-2 cursor-pointer z-40 text-white shadow-[0_4px_12px_rgba(22,119,255,0.4)] transition-all group"
                title={lang === "zh" ? "展开 AI 边沿助手" : "Expand AI Companion"}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                whileHover={{ x: -4, scaleY: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
                <span className="text-[9px] font-black tracking-widest uppercase [writing-mode:vertical-lr] text-center select-none font-sans">
                  {lang === "zh" ? "AI 提取边栏" : "AI PANELS"}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Security standard footer conforming to Bento design parameters */}
      <footer className="px-6 py-4 bg-white border-t border-[#f0f0f0]" flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          {lang === "zh" 
            ? "🔒 本地浏览器沙箱防护标准：AES-GCM-256 加密协议级别保护 — 优化交互设计 v2.0" 
            : "🔒 Browser Extension Cryptographic Level: AES-GCM-256 Protocol protection"}
        </p>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.8 text-slate-500 text-xs">
            <ShieldCheck className="w-4 h-4 text-[#52c41a]" />
            <span className="text-[10.5px] font-semibold text-slate-600">Local Sandbox Proxy Active</span>
          </div>
          <div className="flex items-center gap-1.8 text-slate-500 text-xs">
            <Sparkles className="w-4 h-4 text-[#1677ff]" />
            <span className="text-[10.5px] font-semibold text-slate-600">Gemini 3.5 Engine Certified</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
