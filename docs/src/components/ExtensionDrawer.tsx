import React from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Table as TableIcon, 
  Settings, 
  Sliders, 
  Download, 
  MessageSquare, 
  Trash2, 
  Upload, 
  FolderDown, 
  Key, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Cpu, 
  Layers, 
  HelpCircle,
  Copy,
  FolderOpen
} from "lucide-react";
import { 
  MockPage, 
  ActiveTab, 
  TemplateType, 
  PanelState, 
  ExtractionRule, 
  ChatMessage 
} from "../types";

interface ExtensionDrawerProps {
  panelState: PanelState;
  setPanelState: (state: PanelState) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentPage: MockPage;
  summaryMarkdown: string;
  setSummaryMarkdown: (text: string) => void;
  isMockAi: boolean;
  extractionProgress: number;
  progressText: string;
  selectedTemplate: TemplateType;
  setSelectedTemplate: (type: TemplateType) => void;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  imageCategoryFilter: string;
  setImageCategoryFilter: (filter: string) => void;
  exportFormatSelection: { txt: boolean; md: boolean; word: boolean };
  setExportFormatSelection: React.Dispatch<React.SetStateAction<{ txt: boolean; md: boolean; word: boolean }>>;
  siteRules: ExtractionRule[];
  setSiteRules: React.Dispatch<React.SetStateAction<ExtractionRule[]>>;
  newRuleName: string;
  setNewRuleName: (name: string) => void;
  newRulePattern: string;
  setNewRulePattern: (pattern: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  showApiKey: boolean;
  setShowApiKey: (show: boolean) => void;
  isKeySaved: boolean;
  setIsKeySaved: (saved: boolean) => void;
  chatInput: string;
  setChatInput: (input: string) => void;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  lang: "zh" | "en";
  t: (key: any) => string;
  showToast: (msg: string) => void;
  handleExtract: (isAuto?: boolean) => void;
  handleSendMessage: () => void;
  handleExportFiles: () => void;
  handleZipImages: () => void;
  handleExportCsv: (table: any) => void;
  handleAddRule: (e: React.FormEvent) => void;
  handleExportRulesJson: () => void;
  handleImportRulesMock: () => void;
  handleCopyText: (text: string) => void;
  handleInsertMarkdownTag: (tag: string) => void;
  setShowShortcutModal: (show: boolean) => void;
}

export default function ExtensionDrawer({
  panelState,
  setPanelState,
  activeTab,
  setActiveTab,
  currentPage,
  summaryMarkdown,
  setSummaryMarkdown,
  isMockAi,
  extractionProgress,
  progressText,
  selectedTemplate,
  setSelectedTemplate,
  customPrompt,
  setCustomPrompt,
  imageCategoryFilter,
  setImageCategoryFilter,
  exportFormatSelection,
  setExportFormatSelection,
  siteRules,
  setSiteRules,
  newRuleName,
  setNewRuleName,
  newRulePattern,
  setNewRulePattern,
  apiKey,
  setApiKey,
  showApiKey,
  setShowApiKey,
  isKeySaved,
  setIsKeySaved,
  chatInput,
  setChatInput,
  chatMessages,
  isChatLoading,
  lang,
  t,
  showToast,
  handleExtract,
  handleSendMessage,
  handleExportFiles,
  handleZipImages,
  handleExportCsv,
  handleAddRule,
  handleExportRulesJson,
  handleImportRulesMock,
  handleCopyText,
  handleInsertMarkdownTag,
  setShowShortcutModal
}: ExtensionDrawerProps) {

  return (
    <motion.div 
      id="swe-panel" 
      className="absolute top-0 right-0 w-[420px] h-full bg-white border-l border-[#f0f0f0] shadow-[0_9px_28px_8px_rgba(0,0,0,0.05),0_6px_16px_0_rgba(0,0,0,0.08)] z-40 flex flex-col justify-between font-sans"
      initial={{ x: "100%", opacity: 0.95 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 30, mass: 0.8 }}
    >
      {/* Drawer Header (Ant Design Style) */}
      <div className="border-b border-[#f0f0f0] px-4.5 py-3 flex justify-between items-center bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6.5 h-6.5 bg-[#1677ff] rounded-md flex items-center justify-center shadow-xs shadow-blue-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-xs.5 text-[#1f1f1f] tracking-wide uppercase">
              {lang === "zh" ? "智能网页信息提取器" : "Smart Web Extractor Pro"}
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">AI Browser Companion MV3</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setPanelState("hidden")} 
            className="p-1 hover:bg-[#0000000a] text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
            title={lang === "zh" ? "隐藏面板" : "Hide Panel"}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* State: Extracting loading indicators */}
      {panelState === "extracting" && (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-[#fafafa]">
          <div className="relative w-14 h-14 mb-4">
            <div className="absolute inset-0 border-[3.5px] border-[#f0f0f0] rounded-full"></div>
            <div className="absolute inset-0 border-[3.5px] border-[#1677ff] rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h3 className="font-semibold text-sm text-[#1f1f1f] mb-1">
            {lang === "zh" ? "正在调用 AI 智能进行多模态分析..." : "Analyzing webpage content via Gemini..."}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">{progressText}</p>
          
          {/* Ant Design styled progress bar */}
          <div className="w-48 bg-[#f5f5f5] h-1.5 rounded-full mt-5 overflow-hidden border border-[#f0f0f0]">
            <div className="bg-[#1677ff] h-full transition-all duration-300" style={{ width: `${extractionProgress}%` }}></div>
          </div>
          <span className="text-[10px] text-[#1677ff] font-bold mt-1.5">{extractionProgress}%</span>
        </div>
      )}

      {/* State: Normal/Result content display */}
      {(panelState === "result" || panelState === "settings") && (
        <>
          {/* Metrics header */}
          <div className="bg-[#f0f7ff] border-b border-[#e6f4ff] px-4.5 py-2 text-[10px] text-[#0050b3] font-medium flex items-center justify-between shrink-0">
            <span>{lang === "zh" ? "📊 本地 DOM 精华要素：" : "📊 Local elements indexed:"}</span>
            <span className="font-semibold">
              {currentPage.content.length} {lang === "zh" ? "字" : "chars"} | {currentPage.images.length} {lang === "zh" ? "图" : "imgs"} | {currentPage.tables.length} {lang === "zh" ? "表" : "tbls"}
            </span>
          </div>

          {/* Ant Design styled Segmented Tab Bar */}
          <div className="flex border-b border-[#f0f0f0] bg-[#fafafa] text-xs shrink-0">
            <button 
              onClick={() => { setActiveTab("summary"); setPanelState("result"); }}
              className={`flex-1 py-2.5 text-center transition-all relative font-medium ${
                activeTab === "summary" && panelState === "result" 
                  ? "text-[#1677ff] bg-white font-semibold" 
                  : "text-[#555555] hover:text-slate-800"
              }`}
            >
              📄 {lang === "zh" ? "结构摘要" : "Summary"}
              {activeTab === "summary" && panelState === "result" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1677ff]"></span>
              )}
            </button>
            <button 
              onClick={() => { setActiveTab("images"); setPanelState("result"); }}
              className={`flex-1 py-2.5 text-center transition-all relative font-medium ${
                activeTab === "images" && panelState === "result" 
                  ? "text-[#1677ff] bg-white font-semibold" 
                  : "text-[#555555] hover:text-slate-800"
              }`}
            >
              🖼️ {lang === "zh" ? "多模配图" : "Images"}
              <span className="ml-1 bg-slate-100 text-slate-500 rounded px-1.2 py-0.2 text-[9px]">
                {currentPage.images.length}
              </span>
              {activeTab === "images" && panelState === "result" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1677ff]"></span>
              )}
            </button>
            <button 
              onClick={() => { setActiveTab("tables"); setPanelState("result"); }}
              className={`flex-1 py-2.5 text-center transition-all relative font-medium ${
                activeTab === "tables" && panelState === "result" 
                  ? "text-[#1677ff] bg-white font-semibold" 
                  : "text-[#555555] hover:text-slate-800"
              }`}
            >
              📊 {lang === "zh" ? "结构表格" : "Tables"}
              <span className="ml-1 bg-slate-100 text-slate-500 rounded px-1.2 py-0.2 text-[9px]">
                {currentPage.tables.length}
              </span>
              {activeTab === "tables" && panelState === "result" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1677ff]"></span>
              )}
            </button>
            <button 
              onClick={() => { setActiveTab("edit"); setPanelState("result"); }}
              className={`flex-1 py-2.5 text-center transition-all relative font-medium ${
                activeTab === "edit" && panelState === "result" 
                  ? "text-[#1677ff] bg-white font-semibold" 
                  : "text-[#555555] hover:text-slate-800"
              }`}
            >
              ✏️ {lang === "zh" ? "交互修改" : "Editor"}
              {activeTab === "edit" && panelState === "result" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1677ff]"></span>
              )}
            </button>
            <button 
              onClick={() => setPanelState("settings")}
              className={`flex-1 py-2.5 text-center transition-all relative font-medium ${
                panelState === "settings" 
                  ? "text-[#1677ff] bg-white font-semibold" 
                  : "text-[#555555] hover:text-slate-800"
              }`}
            >
              ⚙️ {lang === "zh" ? "高级配置" : "Config"}
              {panelState === "settings" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1677ff]"></span>
              )}
            </button>
          </div>

          {/* Tab Viewport Contents */}
          <div className="flex-1 overflow-y-auto p-4.5 bg-[#fafafa] space-y-4">
            
            {/* Ant Design Alert inside drawer */}
            {isMockAi && panelState === "result" && (
              <div className="bg-[#fffbe6] border border-[#ffe58f] text-[#d46b08] rounded-md px-3.5 py-2 text-[11px] leading-relaxed flex items-start gap-2 shadow-2xs">
                <span className="mt-0.5 shrink-0">💡</span>
                <div>
                  <p className="font-semibold">{lang === "zh" ? "Gemini 仿真沙盒预览激活" : "Gemini Simulator Active"}</p>
                  <p className="opacity-90 mt-0.5">
                    {lang === "zh" 
                      ? "服务器尚未连接真实的 API Key。为了保证高可用体验，系统已经自动为您启用了高拟真推理沙箱，所有交互、对话和规则均顺畅执行！"
                      : "Server API Key missing. Emulation sandbox enabled for a smooth local testing experience."}
                  </p>
                </div>
              </div>
            )}

            {/* --- CASE 1: SUMMARY TAB --- */}
            {activeTab === "summary" && panelState === "result" && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {/* Ant Card for summary Markdown representation */}
                <div className="bg-white rounded-lg border border-[#f0f0f0] p-4.5 shadow-sm text-xs text-[#262626] leading-relaxed">
                  
                  {/* Top utility row */}
                  <div className="flex justify-between items-center border-b border-[#f5f5f5] pb-2 mb-3 shrink-0">
                    <span className="bg-[#e6f4ff] border border-[#91caee] text-[#096dd9] text-[9.5px] font-bold px-1.8 py-0.5 rounded uppercase tracking-wider font-mono">
                      {selectedTemplate === "structured" 
                        ? "Structured Summary" 
                        : selectedTemplate === "brief" 
                        ? "Brief Summary" 
                        : selectedTemplate === "mindmap" 
                        ? "Mermaid Mindmap" 
                        : "Custom Template"}
                    </span>
                    <button 
                      onClick={() => handleCopyText(summaryMarkdown)}
                      className="text-[#1677ff] hover:text-[#4096ff] font-medium hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {lang === "zh" ? "一键复制" : "Copy"}
                    </button>
                  </div>

                  {/* Rendered Summary with headers and styling */}
                  <div className="space-y-3.5 max-w-full overflow-hidden">
                    {summaryMarkdown.startsWith("```mermaid") ? (
                      <div className="font-mono bg-slate-900 text-emerald-400 p-3 rounded-md text-[10px] whitespace-pre-wrap overflow-x-auto shadow-inner leading-normal border border-slate-800">
                        {summaryMarkdown}
                      </div>
                    ) : (
                      summaryMarkdown.split("\n\n").map((p, idx) => {
                        if (p.startsWith("## ")) {
                          return (
                            <h3 key={idx} className="font-bold text-[#1f1f1f] text-sm border-l-3 border-[#1677ff] pl-2.5 pt-0.5 mt-4.5 mb-2.5">
                              {p.substring(3)}
                            </h3>
                          );
                        }
                        if (p.startsWith("### ")) {
                          return (
                            <h4 key={idx} className="font-semibold text-slate-800 text-xs.5 mt-3 mb-1.5">
                              {p.substring(4)}
                            </h4>
                          );
                        }
                        if (p.startsWith("* ") || p.startsWith("- ")) {
                          return (
                            <ul key={idx} className="list-disc pl-4.5 space-y-1.5 my-2">
                              {p.split("\n").map((li, liIdx) => (
                                <li key={liIdx} className="text-slate-600">
                                  {li.startsWith("* ") ? li.substring(2) : li.startsWith("- ") ? li.substring(2) : li}
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        return <p key={idx} className="text-slate-600 leading-relaxed">{p}</p>;
                      })
                    )}
                  </div>
                </div>

                {/* Quick actions for re-extracting */}
                <div className="flex gap-2.5 pt-1">
                  <button 
                    onClick={() => handleExtract(false)}
                    className="flex-1 bg-[#1677ff] hover:bg-[#4096ff] active:bg-[#096dd9] text-white font-medium text-xs py-2.5 rounded shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {lang === "zh" ? "⚡ 重新智能提取" : "⚡ Force AI Extract"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- CASE 2: IMAGES TAB --- */}
            {activeTab === "images" && panelState === "result" && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {/* Ant-style segmented selector for image filters */}
                <div className="flex bg-[#00000005] border border-[#f0f0f0] p-0.5 rounded text-[10px] font-medium shrink-0">
                  {["all", "chart", "photo", "logo"].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setImageCategoryFilter(cat)}
                      className={`flex-1 py-1 rounded text-center transition-all cursor-pointer ${
                        imageCategoryFilter === cat 
                          ? "bg-white text-[#1677ff] shadow-2xs font-semibold" 
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {cat === "all" ? t("imageClassAll") : cat === "chart" ? t("imageClassChart") : cat === "photo" ? t("imageClassPhoto") : t("imageClassLogo")}
                    </button>
                  ))}
                </div>

                {/* Images grid in bento/card styling */}
                <div className="grid grid-cols-2 gap-3.5">
                  {currentPage.images
                    .filter(img => imageCategoryFilter === "all" || img.category === imageCategoryFilter)
                    .map(img => (
                      <div key={img.id} className="bg-white rounded-lg border border-[#f0f0f0] overflow-hidden shadow-2xs flex flex-col justify-between hover:border-[#1677ff] transition-all">
                        <div className="relative group">
                          <img 
                            src={img.url} 
                            alt={img.alt} 
                            referrerPolicy="no-referrer"
                            className="w-full h-24.5 object-cover bg-slate-50" 
                          />
                          <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                            {img.category}
                          </span>
                          <span className="absolute bottom-1 right-1.5 bg-black/50 text-white text-[8.5px] font-mono px-1 rounded">
                            {img.dimensions}
                          </span>
                        </div>
                        <div className="p-2.5 text-[10.5px]">
                          <p className="font-semibold text-slate-800 truncate" title={img.alt}>
                            Alt: {img.alt || "N/A"}
                          </p>
                          <p className="text-slate-400 leading-normal mt-1 border-t border-[#f5f5f5] pt-1.5 font-sans">
                            {img.aiDescription || "AI description is unavailable."}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Zip download simulation */}
                <button 
                  onClick={handleZipImages}
                  className="w-full bg-white border border-[#d9d9d9] hover:border-[#1677ff] hover:text-[#1677ff] text-slate-600 font-medium text-xs py-2.5 rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FolderDown className="w-4 h-4" />
                  {lang === "zh" ? "批量打包下载网页图片 (.zip)" : "Zip & Download Page Images"}
                </button>
              </motion.div>
            )}

            {/* --- CASE 3: TABLES TAB --- */}
            {activeTab === "tables" && panelState === "result" && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {currentPage.tables.map(table => (
                  <div key={table.id} className="bg-white rounded-lg border border-[#f0f0f0] overflow-hidden shadow-2xs p-3.5 space-y-3">
                    
                    {/* Header with Export button */}
                    <div className="flex justify-between items-center border-b border-[#f5f5f5] pb-2 shrink-0">
                      <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <TableIcon className="w-4 h-4 text-[#1677ff]" />
                        {table.title}
                      </span>
                      <button 
                        onClick={() => handleExportCsv(table)}
                        className="text-[#1677ff] hover:text-[#4096ff] hover:underline font-semibold text-[10.5px] flex items-center gap-0.8 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        {lang === "zh" ? "导出 CSV" : "Export CSV"}
                      </button>
                    </div>

                    {/* Table display */}
                    <div className="overflow-x-auto max-h-56 border border-[#f0f0f0] rounded">
                      <table className="min-w-full divide-y divide-[#f0f0f0] text-[10.5px]">
                        <thead className="bg-[#fafafa] font-bold text-slate-500">
                          <tr>
                            {table.headers.map((h, hIdx) => (
                              <th key={hIdx} className="px-2.5 py-1.8 text-left uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0f0f0] bg-white text-slate-600">
                          {table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-2.5 py-1.8 truncate max-w-[120px]" title={cell}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Table AI trend analysis */}
                    {table.aiAnalysis && (
                      <div className="bg-[#f9f0ff] border border-[#efdbff] rounded px-3 py-2.5 text-[10.5px] text-[#531dab] leading-relaxed">
                        <p className="font-bold flex items-center gap-1.2 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#722ed1]" />
                          {t("tableAiAnalysis")}
                        </p>
                        <p>{table.aiAnalysis}</p>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {/* --- CASE 4: RICH EDITOR WITH CHAT ADJUSTMENT --- */}
            {activeTab === "edit" && panelState === "result" && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                
                {/* Formatting toolbar in Ant style */}
                <div className="flex items-center gap-1 bg-white border border-[#f0f0f0] p-1.5 rounded-lg shadow-2xs shrink-0">
                  <button onClick={() => handleInsertMarkdownTag("bold")} className="w-7 h-7 hover:bg-slate-100 text-xs font-bold rounded flex items-center justify-center cursor-pointer text-slate-700" title="加粗">B</button>
                  <button onClick={() => handleInsertMarkdownTag("italic")} className="w-7 h-7 hover:bg-slate-100 text-xs italic rounded flex items-center justify-center cursor-pointer text-slate-700" title="斜体">I</button>
                  <button onClick={() => handleInsertMarkdownTag("header")} className="w-7 h-7 hover:bg-slate-100 text-xs font-bold rounded flex items-center justify-center cursor-pointer text-slate-700" title="二级标题">H2</button>
                  <button onClick={() => handleInsertMarkdownTag("list")} className="w-7 h-7 hover:bg-slate-100 text-xs font-bold rounded flex items-center justify-center cursor-pointer text-slate-700" title="无序列表">•</button>
                  <button onClick={() => handleInsertMarkdownTag("quote")} className="w-7 h-7 hover:bg-slate-100 text-xs font-serif font-black rounded flex items-center justify-center cursor-pointer text-slate-700" title="引用">“</button>
                </div>

                {/* Markdown text area */}
                <textarea 
                  value={summaryMarkdown}
                  onChange={(e) => setSummaryMarkdown(e.target.value)}
                  className="w-full h-52 bg-white border border-[#d9d9d9] focus:border-[#4096ff] focus:outline-hidden text-xs rounded-lg p-3 text-slate-800 placeholder-slate-400 font-mono resize-y shadow-inner"
                />

                {/* AI Chat adjustment panel */}
                <div className="bg-[#141414] rounded-lg p-4 text-white flex flex-col gap-3 shadow-md relative">
                  <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 shrink-0">
                    <MessageSquare className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <h4 className="text-xs font-semibold text-slate-200">
                      {lang === "zh" ? "🌌 Dialogue AI 智能修剪器" : "🌌 Conversational AI Editor"}
                    </h4>
                  </div>

                  {/* Chat logs */}
                  <div className="space-y-3 max-h-36 overflow-y-auto text-[10px] p-2 bg-white/5 rounded">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <span className="text-[8px] text-slate-400 mb-0.5">{msg.role === "user" ? "User" : "Companion AI"}</span>
                        <div className={`p-2 rounded-lg max-w-[85%] leading-normal ${msg.role === "user" ? "bg-[#1677ff] text-white" : "bg-white/10 text-slate-200"}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="text-[10px] text-indigo-300 italic flex items-center gap-1 animate-pulse">
                        <span>🧬 {lang === "zh" ? "正在按指令微调重组 Markdown 文本..." : "Refining text on instruction..."}</span>
                      </div>
                    )}
                  </div>

                  {/* Input row */}
                  <div className="flex gap-2 shrink-0">
                    <input 
                      type="text"
                      placeholder={t("chatPlaceholder")}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                      }}
                      className="flex-1 bg-white/5 border border-white/10 focus:border-[#4096ff] focus:outline-hidden text-xs rounded px-3 py-2 text-white placeholder-slate-500 font-sans"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="bg-[#1677ff] hover:bg-[#4096ff] text-white font-semibold text-xs px-3.5 py-1.8 rounded transition-all cursor-pointer"
                    >
                      {lang === "zh" ? "微调" : "Send"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- CASE 5: SETTINGS TAB (ADVANCED PLUGINS CONFIG) --- */}
            {panelState === "settings" && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                
                {/* Stat Loads Widget */}
                <div className="bg-white rounded-lg border border-[#f0f0f0] p-4 shadow-2xs">
                  <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-widest mb-3">
                    {lang === "zh" ? "🔧 浏览器扩展核心监控" : "🔧 Extension Core Metrics"}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 text-[#1677ff] rounded-lg">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">{t("cpuLoad")}</p>
                        <p className="text-sm font-bold text-slate-800">1.8%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-50 text-[#52c41a] rounded-lg">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">{t("memLoad")}</p>
                        <p className="text-sm font-bold text-slate-800">28.4 MB</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AES SECURE API KEY VAULT (F6 Compliant) */}
                <div className="bg-slate-900 text-white rounded-lg p-4.5 space-y-3.5 relative overflow-hidden shadow-md">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#1677ff]/10 rounded-full blur-xl"></div>
                  
                  <div className="flex justify-between items-start mb-1 relative z-10">
                    <div className="flex items-center gap-1.8">
                      <Key className="w-4 h-4 text-indigo-400" />
                      <h3 className="font-semibold text-xs.5">{t("apiKeySettings")}</h3>
                    </div>
                    <span className="bg-[#1677ff]/20 text-[#1677ff] border border-[#1677ff]/30 text-[8.5px] font-bold font-mono px-1.5 py-0.2 rounded">
                      AES-GCM-256
                    </span>
                  </div>

                  <div className="relative z-10 space-y-3">
                    <div className="relative">
                      <input 
                        type={showApiKey ? "text" : "password"}
                        placeholder={isKeySaved ? "sk-a1b2••••••••9z2x" : t("apiKeyPlaceholder")}
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          setIsKeySaved(false);
                        }}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#4096ff] focus:outline-hidden text-xs rounded px-3 py-2.2 pr-10 text-white placeholder-slate-500 font-mono"
                      />
                      <button 
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2.5 top-2.2 text-slate-400 hover:text-white"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setIsKeySaved(true);
                          setApiKey("");
                          showToast(lang === "zh" ? "🔑 秘钥已通过 AES-GCM 算法在本地加密储存！" : "🔑 Secret Key encrypted locally!");
                        }}
                        className="flex-1 bg-[#1677ff] hover:bg-[#4096ff] text-white font-semibold text-[11px] py-1.8 rounded transition"
                      >
                        {lang === "zh" ? "加密保存" : "Encrypt Key"}
                      </button>
                      {isKeySaved && (
                        <button 
                          onClick={() => {
                            setIsKeySaved(false);
                            setApiKey("");
                            showToast(lang === "zh" ? "🗑️ 密钥已安全清除" : "🗑️ Key cleared safely");
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold px-2.5 py-1.8 rounded transition"
                          title="删除秘钥"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {t("obfuscationDesc")}
                    </p>
                  </div>
                </div>

                {/* Prompt Formula Select */}
                <div className="bg-white rounded-lg border border-[#f0f0f0] p-4.5 space-y-3 shadow-2xs">
                  <h3 className="font-semibold text-xs.5 text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#1677ff]" />
                    {t("selectTemplate")}
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    {["brief", "structured", "mindmap", "custom"].map(temp => (
                      <button
                        key={temp}
                        onClick={() => setSelectedTemplate(temp as TemplateType)}
                        className={`py-1.8 px-2 text-xs font-semibold rounded border transition ${
                          selectedTemplate === temp 
                            ? "bg-[#e6f4ff] border-[#91caee] text-[#1677ff]" 
                            : "bg-[#fafafa] border-[#d9d9d9] text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {temp === "brief" ? t("templateBrief") : temp === "structured" ? t("templateStructured") : temp === "mindmap" ? t("templateMindmap") : t("templateCustom")}
                      </button>
                    ))}
                  </div>

                  {selectedTemplate === "custom" && (
                    <div className="space-y-1.5 pt-1.5 animate-in slide-in-from-top-1 duration-150">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("customPromptLabel")}</label>
                      <textarea 
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="w-full h-22 bg-[#fafafa] border border-[#d9d9d9] focus:border-[#4096ff] focus:outline-hidden text-xs rounded p-2 text-slate-800 placeholder-slate-400 resize-none font-sans"
                      />
                      <span className="text-[9px] text-slate-400 block leading-tight">{t("customPromptHelp")}</span>
                    </div>
                  )}
                </div>

                {/* Site rules creation & presets */}
                <div className="bg-white rounded-lg border border-[#f0f0f0] p-4.5 space-y-3 shadow-2xs">
                  <div className="flex justify-between items-center shrink-0">
                    <h3 className="font-semibold text-xs.5 text-slate-800 flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4 text-[#1677ff]" />
                      {lang === "zh" ? "站点专属匹配规则" : "Custom Site Rules"}
                    </h3>
                    <button 
                      onClick={handleImportRulesMock}
                      className="text-[#1677ff] hover:text-[#4096ff] font-bold text-[10px] hover:underline cursor-pointer"
                    >
                      {lang === "zh" ? "模拟导入" : "Import"}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {siteRules.map(rule => (
                      <div key={rule.id} className="p-2.5 bg-[#fafafa] border border-[#f0f0f0] rounded text-xs hover:border-[#1677ff] transition-colors relative group">
                        <div className="flex justify-between items-start mb-0.5">
                          <span className="font-semibold text-slate-800">{rule.name}</span>
                          <span className="text-[9.5px] font-mono bg-slate-200 text-slate-600 px-1.2 py-0.2 rounded">
                            {rule.urlPattern}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 leading-normal">{rule.description}</p>
                        <button 
                          onClick={() => {
                            setSiteRules(prev => prev.filter(r => r.id !== rule.id));
                            showToast(lang === "zh" ? "🗑️ 站点专属规则已移除" : "🗑️ Custom rule deleted successfully");
                          }}
                          className="absolute right-2.5 bottom-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="删除规则"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddRule} className="border-t border-[#f5f5f5] pt-3.5 space-y-2.5">
                    <h4 className="text-[11px] font-bold text-slate-700">{t("createRule")}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text"
                        placeholder={t("ruleName")}
                        value={newRuleName}
                        onChange={(e) => setNewRuleName(e.target.value)}
                        className="bg-[#fafafa] border border-[#d9d9d9] focus:border-[#4096ff] focus:outline-hidden text-[11px] rounded p-1.8 text-slate-800 placeholder-slate-400"
                      />
                      <input 
                        type="text"
                        placeholder={t("ruleUrlPattern")}
                        value={newRulePattern}
                        onChange={(e) => setNewRulePattern(e.target.value)}
                        className="bg-[#fafafa] border border-[#d9d9d9] focus:border-[#4096ff] focus:outline-hidden text-[11px] rounded p-1.8 text-slate-800 placeholder-slate-400"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-[#1677ff] hover:bg-[#4096ff] text-white font-semibold text-[11px] py-1.8 rounded transition"
                    >
                      + {t("saveRule")}
                    </button>
                  </form>
                </div>

              </motion.div>
            )}

          </div>

          {/* Exporter Footer Panel (F10 Multi-format check Ant Design style) */}
          <div className="bg-white border-t border-[#f0f0f0] p-4 flex flex-col gap-3 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>{t("exportTitle")}</span>
                <span className="text-[9px] text-[#1677ff] font-medium font-mono">MV3 LOCAL COMPILE</span>
              </h4>
              <div className="flex gap-5 text-xs font-medium text-slate-600">
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#1677ff] select-none">
                  <input 
                    type="checkbox" 
                    checked={exportFormatSelection.txt} 
                    onChange={(e) => setExportFormatSelection(prev => ({ ...prev, txt: e.target.checked }))}
                    className="accent-[#1677ff] w-3.5 h-3.5 cursor-pointer rounded"
                  />
                  TXT (纯文本)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#1677ff] select-none">
                  <input 
                    type="checkbox" 
                    checked={exportFormatSelection.md} 
                    onChange={(e) => setExportFormatSelection(prev => ({ ...prev, md: e.target.checked }))}
                    className="accent-[#1677ff] w-3.5 h-3.5 cursor-pointer rounded"
                  />
                  Markdown
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#1677ff] select-none">
                  <input 
                    type="checkbox" 
                    checked={exportFormatSelection.word} 
                    onChange={(e) => setExportFormatSelection(prev => ({ ...prev, word: e.target.checked }))}
                    className="accent-[#1677ff] w-3.5 h-3.5 cursor-pointer rounded"
                  />
                  Word (.doc)
                </label>
              </div>
            </div>

            <button 
              onClick={handleExportFiles}
              className="w-full bg-[#1677ff] hover:bg-[#4096ff] active:bg-[#096dd9] text-white font-bold text-xs.5 py-2.8 rounded shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {t("exportBtn")}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
