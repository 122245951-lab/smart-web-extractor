import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI | null {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });
  }
  return ai;
}

export function generateMockSummary(title: string, url: string, content: string, templateType: string, customPrompt?: string): string {
  if (templateType === "mindmap") {
    return "```mermaid\nmindmap\n  root((" + (title || "网页核心") + "))\n    核心论点\n      发展趋势\n      技术突破\n    关键数据\n      效率提速 80%\n      准确率 95%以上\n    应用场景\n      知识库整理\n      论文速读\n      竞品分析\n    未来展望\n      多模态融合\n      端侧模型普及\n```";
  }
  if (templateType === "structured") {
    return [
      "## 核心观点",
      "本文探讨了 **" + (title || "网页核心内容") + "** 在现代数字化转型中的核心作用。",
      "",
      "## 关键论据",
      "1. 信息过载痛点严重：高达 85% 的长文被收藏后从未被打开。",
      "2. 正文及结构化提取的技术优势：精准解析正文区域。",
      "3. AI 总结的革命性变革：万字长文 5 秒精准浓缩。",
      "",
      "## 重要数据",
      "- 90% 耗时缩减：从 10 分钟压缩至 30 秒以内。",
      "- 85% 识别准确率：自动识别主流资讯站点正文。",
      "- 50MB 极低内存：纯原生 JS 架构。",
      "",
      "## 结论",
      "网页智能提取技术已进入成熟期。"
    ].join("\n");
  }
  return [
    "### 智能浓缩速读",
    "- **本页主题**：本文围绕 " + (title || "该网页") + " 展开。",
    "- **核心价值**：帮助用户在 30 秒内吸收 90% 的干货。",
    "- **技术亮点**：纯原生 JS，过滤广告，一键导出。"
  ].join("\n");
}