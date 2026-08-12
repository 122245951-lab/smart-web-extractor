import React from "react";
import { 
  Monitor, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Sliders 
} from "lucide-react";
import { MockPage } from "../types";

interface BrowserSimulatorProps {
  currentPage: MockPage;
  activePageId: string;
  setActivePageId: (id: string) => void;
  adMode: "silent" | "preview";
  setAdMode: (mode: "silent" | "preview") => void;
  purifyActive: boolean;
  setPurifyActive: (active: boolean) => void;
  dismissedAds: string[];
  setDismissedAds: (ads: string[]) => void;
  lang: "zh" | "en";
  t: (key: any) => string;
  showToast: (msg: string) => void;
}

export default function BrowserSimulator({
  currentPage,
  activePageId,
  setActivePageId,
  adMode,
  setAdMode,
  purifyActive,
  setPurifyActive,
  dismissedAds,
  setDismissedAds,
  lang,
  t,
  showToast
}: BrowserSimulatorProps) {

  // Dynamic CSS injector for simulated Ad Filter modes
  const isSilentMode = adMode === "silent" || purifyActive;
  
  return (
    <div className="flex-1 bg-[#f5f5f5] rounded-xl border border-[#d9d9d9] shadow-md overflow-hidden flex flex-col min-h-[680px]">
      {/* Dynamic Style block to control active ads rendering inside HTML content */}
      <style>{`
        .webpage-preview-content .ad-banner, 
        .webpage-preview-content .ad-sidebar {
          transition: all 0.3s ease;
        }
        ${isSilentMode ? `
          .webpage-preview-content .ad-banner, 
          .webpage-preview-content .ad-sidebar {
            display: none !important;
          }
        ` : ""}
        ${adMode === "preview" && !isSilentMode ? `
          .webpage-preview-content .ad-banner, 
          .webpage-preview-content .ad-sidebar {
            border: 2px dashed #ff4d4f !important;
            background-color: #fff2f0 !important;
            position: relative !important;
            padding-top: 28px !important;
            opacity: 0.9;
          }
          .webpage-preview-content .ad-banner::before, 
          .webpage-preview-content .ad-sidebar::before {
            content: '🛡️ AI 检测到广告区域 (AD BLOCK HIGHLIGHT)';
            position: absolute;
            top: 4px;
            left: 8px;
            font-size: 10px;
            font-weight: bold;
            color: #ff4d4f;
            background: #fff2f0;
            padding: 2px 6px;
            border-radius: 4px;
            border: 1px solid #ffccc7;
            font-family: system-ui, sans-serif;
            z-index: 10;
          }
        ` : ""}
      `}</style>

      {/* Simulated Browser OS Header */}
      <div className="bg-[#f0f2f5] border-b border-[#d9d9d9] px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left Side: Window Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-3 h-3 rounded-full bg-[#ff4d4f] inline-block cursor-pointer opacity-85 hover:opacity-100"></span>
          <span className="w-3 h-3 rounded-full bg-[#ffec3d] inline-block cursor-pointer opacity-85 hover:opacity-100"></span>
          <span className="w-3 h-3 rounded-full bg-[#52c41a] inline-block cursor-pointer opacity-85 hover:opacity-100"></span>
          
          {/* Navigation Arrows */}
          <div className="flex items-center gap-1 ml-3 text-slate-400">
            <button className="p-1 hover:bg-[#0000000a] rounded cursor-not-allowed">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:bg-[#0000000a] rounded cursor-not-allowed">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => {
                setDismissedAds([]);
                showToast(lang === "zh" ? "🔄 已重新载入模拟页面！" : "🔄 Simulated page reloaded!");
              }} 
              className="p-1 hover:bg-[#0000000a] rounded text-slate-600 active:rotate-180 transition-transform duration-300"
              title="刷新页面"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Website Tabs (Ant Design styled) */}
        <div className="flex bg-[#00000009] p-0.5 rounded-lg shrink-0">
          <button 
            onClick={() => setActivePageId("zhihu-tech")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activePageId === "zhihu-tech" ? "bg-white text-[#1677ff] shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"}`}
          >
            {lang === "zh" ? "知乎专栏" : "Zhihu Tech"}
          </button>
          <button 
            onClick={() => setActivePageId("product-page")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activePageId === "product-page" ? "bg-white text-[#1677ff] shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"}`}
          >
            {lang === "zh" ? "VerveX 商城" : "VerveX Mall"}
          </button>
          <button 
            onClick={() => setActivePageId("arxiv-paper")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activePageId === "arxiv-paper" ? "bg-white text-[#1677ff] shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"}`}
          >
            {lang === "zh" ? "arXiv 论文" : "arXiv Paper"}
          </button>
        </div>

        {/* Right Side: URL Address Bar */}
        <div className="flex-1 max-w-md bg-white border border-[#d9d9d9] hover:border-[#4096ff] transition-colors rounded-md px-2.5 py-1 flex items-center justify-between text-xs text-slate-500 font-mono shadow-inner">
          <div className="flex items-center gap-1.5 truncate">
            <Lock className="w-3 h-3 text-[#52c41a] shrink-0" />
            <span className="truncate select-all">{currentPage.url}</span>
          </div>
          <span className="px-1.5 py-0.2 bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f] rounded text-[9px] font-bold tracking-wider">SECURE</span>
        </div>
      </div>

      {/* Ad Purifier control banner inside the webpage simulator header */}
      <div className="bg-[#e6f4ff] border-b border-[#91caee] px-4 py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#1677ff]" />
          <div>
            <h4 className="text-xs font-semibold text-[#003a8c] flex items-center gap-1">
              {t("adFilterMode")}
            </h4>
            <p className="text-[10px] text-[#0050b3] mt-0.5">
              {adMode === "preview" 
                ? "💡 预览净化模式：在下方模拟网页上红框高亮显示检测到的广告，您可以手动点击 [X] 消除，或一键开启智能过滤。" 
                : "🛡️ 静默净化模式：系统自动在页面底层擦除全部可疑广告快，确保一尘不染！"}
            </p>
          </div>
        </div>

        {/* Ad Filter buttons styled in Ant Design style */}
        <div className="flex gap-1.5 self-end sm:self-auto">
          <button 
            onClick={() => {
              setAdMode("silent");
              setPurifyActive(true);
              showToast(lang === "zh" ? "🛡️ 已开启【静默过滤】模式，自动清除所有可疑广告！" : "🛡️ Ad Silent Filter activated! Cleaned web container.");
            }}
            className={`px-3 py-1 text-[11px] font-medium rounded border transition ${
              adMode === "silent" || purifyActive
                ? "bg-[#1677ff] border-[#1677ff] text-white" 
                : "bg-white border-[#d9d9d9] text-slate-600 hover:text-[#4096ff] hover:border-[#4096ff]"
            }`}
          >
            {lang === "zh" ? "静默净化" : "Silent Filter"}
          </button>
          <button 
            onClick={() => {
              setAdMode("preview");
              setPurifyActive(false);
              showToast(lang === "zh" ? "💡 已启用【预览高亮】模式，并在下方红框标记广告区" : "💡 Preview highlights enabled on the webpage.");
            }}
            className={`px-3 py-1 text-[11px] font-medium rounded border transition ${
              adMode === "preview" && !purifyActive
                ? "bg-[#1677ff] border-[#1677ff] text-white" 
                : "bg-white border-[#d9d9d9] text-slate-600 hover:text-[#4096ff] hover:border-[#4096ff]"
            }`}
          >
            {lang === "zh" ? "预览净化" : "Preview Highlight"}
          </button>
        </div>
      </div>

      {/* Simulated Website Viewport Frame */}
      <div className="flex-1 bg-white p-6 md:p-8 overflow-y-auto max-h-[580px] relative font-sans text-slate-800" id="swe-host-webpage">
        {/* Render webpage with actual styled classes */}
        <div className="webpage-preview-content max-w-3xl mx-auto prose prose-slate">
          {/* Header Title */}
          <div className="border-b border-[#f0f0f0] pb-4 mb-5">
            <h1 className="text-2xl font-black text-[#1f1f1f] leading-tight mb-2">
              {currentPage.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-mono">
              <span>URL: <span className="text-[#1677ff] underline">{currentPage.url}</span></span>
              <span>•</span>
              <span>{lang === "zh" ? "自动匹配模式: 开启" : "Auto-match rule: active"}</span>
            </div>
          </div>

          {/* Actual Rich Web Content */}
          <div 
            className="text-sm text-[#434343] leading-relaxed space-y-4 font-sans"
            dangerouslySetInnerHTML={{ __html: currentPage.htmlContent }} 
          />
        </div>
      </div>

      {/* Simulated Footer of the Web Browser */}
      <div className="bg-[#f0f2f5] border-t border-[#d9d9d9] px-5 py-3 text-[10px] text-slate-400 font-mono flex flex-wrap justify-between items-center gap-2">
        <span>RENDER ENGINE: CHROMIUM SIMULATOR MV3 • HOST: OK</span>
        <div className="flex gap-4">
          <span>COOKIE: DOMAIN_ONLY</span>
          <span>LATENCY: 12ms</span>
        </div>
      </div>
    </div>
  );
}
