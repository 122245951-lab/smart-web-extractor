import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAiClient } from "./_gemini";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { messages, currentSummary } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }
    const ai = getAiClient();
    if (!ai) {
      const lastMessage = messages[messages.length - 1]?.content || "";
      return res.json({
        text: "[Mock] Received command: " + lastMessage + ".\n\nBased on your request, the summary has been adjusted.",
        isMock: true
      });
    }
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: "You are an expert editorial assistant. Modify the summary per user command. Return complete revised Markdown only.",
      },
    });
    await chat.sendMessage({
      message: "Current summary:\n\n" + currentSummary + "\n\nModify it per the next command.",
    });
    const userCommand = messages[messages.length - 1]?.content || "Please improve.";
    const response = await chat.sendMessage({ message: userCommand });
    res.json({ text: response.text || "No response." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}