import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAiClient, generateMockSummary } from "./_gemini";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { title, url, content, templateType, customPrompt } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required" });
    const ai = getAiClient();
    if (!ai) {
      const mockResult = generateMockSummary(title, url, content, templateType, customPrompt);
      return res.json({ text: mockResult, isMock: true });
    }
    let systemInstruction = "You are an expert AI Web Information Extractor.";
    let userPrompt = "Summarize the key information in elegant Markdown.";
    if (templateType === "brief") {
      userPrompt = "Please generate a concise 3-5 sentence summary of this page.\nTitle: " + title + "\nURL: " + url + "\nContent:\n" + content;
    } else if (templateType === "structured") {
      systemInstruction = "You are an expert at structured content extraction.";
      userPrompt = "Please analyze the page content and provide a structured summary in Markdown under these headers: ## Core Viewpoint, ## Key Arguments, ## Important Data, ## Conclusions.\nTitle: " + title + "\nURL: " + url + "\nContent:\n" + content;
    } else if (templateType === "mindmap") {
      systemInstruction = "You are an expert at Mermaid mindmap syntax. Output ONLY the mermaid code block.";
      userPrompt = "Transform the core ideas of this article into a clean Mermaid mindmap.\nTitle: " + title + "\nURL: " + url + "\nContent:\n" + content;
    } else if (templateType === "custom" && customPrompt) {
      userPrompt = customPrompt.replace("{title}", title || "").replace("{url}", url || "").replace("{content}", content);
    } else {
      userPrompt = "Summarize the key information of this page in an elegant, structured Markdown document.\nTitle: " + title + "\nURL: " + url + "\nContent:\n" + content;
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: { systemInstruction, temperature: 0.2 },
    });
    res.json({ text: response.text || "No response." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}