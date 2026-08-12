import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" }));

const PORT = 3000;

// Initialize Google Gen AI client server-side only
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// API: Perform AI page summary
app.post("/api/extract", async (req, res) => {
  try {
    const { title, url, content, templateType, customPrompt } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    if (!ai) {
      // Return a very realistic, nice mock summary if API Key is not set up in environment,
      // so the preview is fully functional even without a configured server key.
      console.log("GEMINI_API_KEY is not configured on the server, returning a smart template summary.");
      
      const mockResult = generateMockSummary(title, url, content, templateType, customPrompt);
      return res.json({ text: mockResult, isMock: true });
    }

    // Build the system and user instructions based on templateType
    let systemInstruction = "You are an expert AI Web Information Extractor. Your task is to analyze the provided web page content and extract its key essence in clean Markdown format. Focus purely on high-value facts, data points, and findings. Strictly avoid generic marketing fluff and ads.";
    let userPrompt = "";

    if (templateType === "brief") {
      userPrompt = `Please generate a concise 3-5 sentence summary of this web page.
Title: ${title}
URL: ${url}
Content:
${content}`;
    } else if (templateType === "structured") {
      userPrompt = `Please analyze the following page content and provide a structured summary in Markdown under these precise headers:
## 核心观点 (Core Viewpoint)
## 关键论据 (Key Arguments)
## 重要数据 (Important Data)
## 结论/启示 (Conclusions & Takeaways)

Title: ${title}
URL: ${url}
Content:
${content}`;
    } else if (templateType === "mindmap") {
      systemInstruction = "You are an expert at mapping web content structure into Mermaid mindmap syntax. Generate ONLY the raw Mermaid mindmap markdown block, wrapped in \`\`\`mermaid ... \`\`\` code block. Do not write any other conversational text.";
      userPrompt = `Transform the core ideas and subsections of this article into a clean Mermaid mindmap.
Title: ${title}
URL: ${url}
Content:
${content}`;
    } else if (templateType === "custom" && customPrompt) {
      userPrompt = `${customPrompt.replace("{title}", title).replace("{url}", url).replace("{content}", content)}`;
    } else {
      userPrompt = `Summarize the key information of this page in an elegant, structured Markdown document.
Title: ${title}
URL: ${url}
Content:
${content}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    res.json({ text: response.text || "No response text generated." });
  } catch (error: any) {
    console.error("Gemini API Error in /api/extract:", error);
    res.status(500).json({ error: error.message || "Internal server error calling AI" });
  }
});

// API: Dialogue / AI chatbot adjustment
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, currentSummary } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    if (!ai) {
      // Handle fallback chat adjustments
      const lastMessage = messages[messages.length - 1]?.content || "";
      return res.json({ 
        text: `[模拟助手] 收到调整指令：“${lastMessage}”。\n\n根据您的指令，以下是调整后的部分摘要内容：\n\n* **新增重点**：此内容已根据您的需求进行了微调。\n* **优化文本**：对原文的要点进行了精简和格式化，使其更贴合您的指令需求。\n\n您可以使用真正的 Gemini API Key（或配置本地 Chrome 插件自带 API Key）体验完全真实的对话修改。`, 
        isMock: true 
      });
    }

    // Build chat context
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: "You are an expert editorial assistant. Your task is to modify the current summary according to the user's natural language command. You MUST return the complete, revised summary in Markdown format. Keep the style professional, elegant, and structured. Do not write any conversational intro or outro; output only the updated Markdown content.",
      },
    });

    // Seed chat history or context
    await chat.sendMessage({ 
      message: `Here is the current Markdown summary we are working with:\n\n${currentSummary}\n\nI will now give you a command on how to modify, refine, or translate it. Please output the fully updated Markdown summary.` 
    });

    const userCommand = messages[messages.length - 1]?.content || "Please improve the summary.";
    const response = await chat.sendMessage({ message: userCommand });

    res.json({ text: response.text || "No response text generated." });
  } catch (error: any) {
    console.error("Gemini API Error in /api/chat:", error);
    res.status(500).json({ error: error.message || "Internal server error in AI chat adjustments" });
  }
});

// Mock summary helper when process.env.GEMINI_API_KEY is not set
function generateMockSummary(title: string, url: string, content: string, templateType: string, customPrompt?: string): string {
  const dateStr = new Date().toISOString().split('T')[0];
  
  if (templateType === "mindmap") {
    return `\`\`\`mermaid
mindmap
  root((${title || '网页核心'}))
    核心论点
      发展趋势
      技术突破
    关键数据
      效率提速 80%
      准确率 95%以上
    应用场景
      知识库整理
      论文速读
      竞品分析
    未来展望
      多模态融合
      端侧模型普及
\`\`\``;
  }

  if (templateType === "structured") {
    return `## 核心观点
本文探讨了 **${title || '网页核心内容'}** 在现代数字化转型中的核心作用。作者指出，随着海量信息爆炸，传统的手工筛选和「稍后阅读」正迅速失效。构建基于 AI 的智能提取与分析系统（如 Smart Web Extractor）是解决知识焦虑、提高信息消费效率（10倍速度获取 90% 价值）的必然趋势。

## 关键论据
1. **信息过载痛点严重**：高达 85% 的长文在被放入收藏夹后“再也没有被打开过”，造成了严重的认知负荷与资源浪费。
2. **正文及结构化提取的技术优势**：通过精准的文本密度、类名黑名单和启发式布局分析算法，可在 200ms 内洗净侧边栏、广告和杂讯，还原出最干净的 H1-H6 正文。
3. **AI 总结的革命性变革**：结合用户自定义 Prompt 与站点规则（如 *://*.zhihu.com/*），让 AI 将原本冗长的万字长文在 5 秒内精准浓缩为 3-5 句大纲或 Mermaid 导图。

## 重要数据
* **90% 耗时缩减**：用户阅读同一篇文章的平均耗时从 10 分钟压缩至 **30秒以内**。
* **85% 识别准确率**：无需人工干预，即可完美识别绝大多数中英文主流资讯站点的正文区域。
* **50MB 极低内存**：纯原生 JS 架构不仅保障了零加载、零构建，在常驻边沿标签模式下的空闲内存占用甚至低于 50MB。

## 结论/启示
网页智能提取技术已进入成熟期。通过 **“边沿常驻标签 + 滑出式全功能面板”** 的产品形态，将极大缓解现代知识工作者的信息获取焦虑。在未来，结合多模态模型对图片/表格的深度理解，将彻底重塑知识消费的整体链路。`;
  }

  // default / brief
  return `### 💡 智能浓缩速读
* **本页主题**：本文围绕「**${title || '该网页'}**」展开，深入探讨了其核心价值主张、功能清单和设计理念。
* **核心价值**：提出了一种全新的信息提取范式，旨在通过“边沿悬浮标签”提供零打断、一屏完成的提取预览体验，帮助用户在 30 秒内吸收 90% 的干货，彻底解决收藏夹吃灰的痛点。
* **技术亮点**：采用纯原生 JS 零依赖构建，极速解析 DOM 节点文本得分，过滤高达 90% 的悬浮与侧边栏广告，提供本地 AES-GCM 加密机制以最大化保护用户的 API Key 安全，并支持 TXT、Markdown 和 Word 的一键批量打包导出。`;
}

// Set up server and Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
