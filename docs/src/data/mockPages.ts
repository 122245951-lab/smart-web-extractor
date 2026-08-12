import { MockPage } from "../types";

export const MOCK_PAGES: MockPage[] = [
  {
    id: "zhihu-tech",
    title: "2026年大语言模型端侧部署与算力优化指南",
    url: "https://zhuanlan.zhihu.com/p/8827192",
    content: "近年来，大语言模型（LLM）的算力消耗成为制约其商业化的最主要瓶颈。虽然云端API（如GPT-4、Gemini等）能够提供出色的性能，但是在高并发场景下，网络延迟、隐私安全性、高昂的按Token付费成本使端侧（On-Device）部署模型（如Qwen-2.5-7B、Llama-3-8B等）成为更具性价比的选择。\n\n在端侧算力部署中，通常使用4-bit量化（AWQ、GPTQ、GGUF）技术，其基本逻辑是将FP16/BF16的权重系数压缩为4位整型，从而降低高达75%的显存开销。端侧部署的核心优化方向不仅包括量化，还包含KV Cache精简以及推测性解码（Speculative Decoding）。通过小模型预测高概率词并由大模型快速校验，可以使推理生成速度提升接近2倍。\n\n然而，端侧芯片的显存带宽依然是最大痛点。例如，在骁龙8 Gen 3平台上运行精简后的7B模型时，初次载入（Prefill）阶段的显卡利用率高达98%，在生成阶段（Decoding）显存带宽开销占到了91%。这意味着未来的处理器核心优化必须大幅提高高频本地缓存带宽，并研发更高效的硬件解量化单元。\n\n总的来说，端侧部署不是为了彻底替代云端大模型，而是形成一个分级架构：本地端侧模型处理80%的高频简单指令，保障用户隐私和毫秒级响应；复杂的计算和高难度逻辑则无缝流转至云端混合模型。这就是未来无所不在的混合AI架构。",
    htmlContent: `
      <div class="post-content">
        <h1>2026年大语言模型端侧部署与算力优化指南</h1>
        <p class="meta">作者：张知乎 | 发布于：2026-06-15 | 浏览量：124,902</p>
        
        <!-- Ad Banner 1 -->
        <div class="ad-banner bg-amber-50 p-4 rounded-xl my-4 text-center border-2 border-dashed border-amber-300">
          <p class="text-xs text-amber-600 font-bold">【极客特惠广告】买云主机上极客云，新用户限时1折起！32核128G仅需99/月！</p>
          <a href="#" class="text-xs text-blue-600 underline">立即抢购 &gt;</a>
        </div>

        <p>近年来，大语言模型（LLM）的算力消耗成为制约其商业化的最主要瓶颈。虽然云端API（如GPT-4、Gemini等）能够提供出色的性能，但是在高并发场景下，网络延迟、隐私安全性、高昂的按Token付费成本使端侧（On-Device）部署模型（如Qwen-2.5-7B、Llama-3-8B等）成为更具性价比的选择。</p>
        
        <p>在端侧算力部署中，通常使用4-bit量化（AWQ、GPTQ、GGUF）技术，其基本逻辑是将FP16/BF16的权重系数压缩为4位整型，从而降低高达75%的显存开销。端侧部署的核心优化方向不仅包括量化，还包含KV Cache精简以及推测性解码（Speculative Decoding）。通过小模型预测高概率词并由大模型快速校验，可以使推理生成速度提升接近2倍。</p>

        <div class="my-6">
          <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" alt="GPU神经网络模型渲染" class="rounded-xl w-full object-cover max-h-72" />
          <p class="text-xs text-slate-500 text-center mt-2">图1：基于端侧GPU/NPU的异构张量乘法执行流</p>
        </div>

        <p>然而，端侧芯片的显存带宽依然是最大痛点。例如，在骁龙8 Gen 3平台上运行精简后的7B模型时，初次载入（Prefill）阶段的显卡利用率高达98%，在生成阶段（Decoding）显存带宽开销占到了91%。这意味着未来的处理器核心优化必须大幅提高高频本地缓存带宽，并研发更高效的硬件解量化单元。</p>

        <!-- Dynamic Data Table -->
        <h3 class="text-lg font-bold mt-6 mb-2">主流移动端SoC运行7B模型性能实测</h3>
        <table class="min-w-full divide-y divide-slate-200 border border-slate-200 my-4 rounded-lg overflow-hidden">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">芯片平台</th>
              <th class="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">量化精度</th>
              <th class="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">首字延迟(ms)</th>
              <th class="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">生成速率(tok/s)</th>
              <th class="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">平均功耗(W)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr>
              <td class="px-4 py-2 text-sm font-medium text-slate-900">骁龙 8 Gen 3</td>
              <td class="px-4 py-2 text-sm text-slate-500">INT4 AWQ</td>
              <td class="px-4 py-2 text-sm text-slate-500">120ms</td>
              <td class="px-4 py-2 text-sm text-slate-500">22.4</td>
              <td class="px-4 py-2 text-sm text-slate-500">4.8W</td>
            </tr>
            <tr>
              <td class="px-4 py-2 text-sm font-medium text-slate-900">天玑 9300</td>
              <td class="px-4 py-2 text-sm text-slate-500">INT4 GGUF</td>
              <td class="px-4 py-2 text-sm text-slate-500">145ms</td>
              <td class="px-4 py-2 text-sm text-slate-500">20.1</td>
              <td class="px-4 py-2 text-sm text-slate-500">5.2W</td>
            </tr>
            <tr>
              <td class="px-4 py-2 text-sm font-medium text-slate-900">Apple A17 Pro</td>
              <td class="px-4 py-2 text-sm text-slate-500">INT4 AWQ</td>
              <td class="px-4 py-2 text-sm text-slate-500">95ms</td>
              <td class="px-4 py-2 text-sm text-slate-500">26.5</td>
              <td class="px-4 py-2 text-sm text-slate-500">3.9W</td>
            </tr>
          </tbody>
        </table>

        <!-- Sidebar ad -->
        <div class="ad-sidebar bg-rose-50 p-4 rounded-xl my-4 text-center border-2 border-dashed border-rose-300">
          <p class="text-xs text-rose-600 font-bold">【重磅推荐】点击注册，免费送 100 万 token API 额度！</p>
          <button class="bg-rose-500 text-white text-xs px-3 py-1 rounded mt-2">一键领取</button>
        </div>

        <p>总的来说，端侧部署不是为了彻底替代云端大模型，而是形成一个分级架构：本地端侧模型处理80%的高频简单指令，保障用户隐私和毫秒级响应；复杂的计算和高难度逻辑则无缝流转至云端混合模型。这就是未来无所不在的混合AI架构。</p>
      </div>
    `,
    images: [
      {
        id: "img1-1",
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        alt: "GPU神经网络模型渲染",
        category: "chart",
        aiDescription: "这是一张呈现复杂多维神经网络和节点连接的3D艺术抽象图，色调主要为粉蓝与紫色，常用于表示高维向量计算或端侧张量异构计算。",
        dimensions: "800x600"
      },
      {
        id: "img1-2",
        url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
        alt: "半导体集成电路",
        category: "photo",
        aiDescription: "一张展示硅芯片、半导体晶体管微观微电子电路的高清特写图片，象征着现代SoC算力芯片在移动端的深度封装架构。",
        dimensions: "400x300"
      },
      {
        id: "img1-logo",
        url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80",
        alt: "技术指南Logo",
        category: "logo",
        aiDescription: "圆形简约蓝色现代科技小图标，可用作文章或指南的标签标识。",
        dimensions: "150x150"
      }
    ],
    tables: [
      {
        id: "tbl1-1",
        title: "主流移动端SoC运行7B模型性能实测",
        headers: ["芯片平台", "量化精度", "首字延迟(ms)", "生成速率(tok/s)", "平均功耗(W)"],
        rows: [
          ["骁龙 8 Gen 3", "INT4 AWQ", "120ms", "22.4", "4.8W"],
          ["天玑 9300", "INT4 GGUF", "145ms", "20.1", "5.2W"],
          ["Apple A17 Pro", "INT4 AWQ", "95ms", "26.5", "3.9W"]
        ],
        aiAnalysis: "数据分析：苹果 A17 Pro 凭借先进的3nm工艺，不仅取得了 26.5 tok/s 的最高生成速率，首字延迟也做到了低于 100ms（仅为 95ms），功耗亦控制在 3.9W 的优秀水平。而骁龙 8 Gen 3 和天玑 9300 的功耗略高，在推理长文本时可能需要更具侵略性的温控机制以维持长效生成。"
      }
    ]
  },
  {
    id: "product-page",
    title: "VerveX Max 2026款主动降噪无线头戴耳机 - 官方零售价及规格",
    url: "https://www.vervex.com/products/max-headphones",
    content: "VerveX Max 2026无线头戴耳机是声音美学与降噪科技的集大成者。搭载自主研发的 H4 双核主动降噪芯片，其降噪深度最高可达 -48dB，智能精准捕捉环境杂音，让你在喧嚣机场或公交地铁中亦能一秒沉入深海静谧空间。2026款还首创了声场黄金追踪（Spatial Gold Tracker）技术，通过多核惯性陀螺仪实时定位头部的微小倾斜，让3D声场时刻以你为圆心。\n\n该耳机采用了45mm镀铍生物振膜，支持 LDAC、LHDC 5.0、aptX Adaptive 以及 AAC 等高解析度音频编码格式。其续航能力提升到了单次满电可持续播放 65 小时（降噪开启时 45 小时）。快充功能亦实现重大突破：仅需充电 5 分钟，即可支持超长 6 小时的音乐播放。舒适度层面采用顶级蛋白皮与慢回弹记忆海绵，重约 245g，长时间佩戴无明显压耳负荷。\n\n本季度精选好价：经典极夜黑与雪境白版本官方直降¥300，原价¥1,999，现售¥1,699。支持全国24期免息，购买还额外赠送价值¥299的碳纤维抗压便携收纳包。立即登录官方小程序或指定线上旗舰店选购，尊享声学旗舰体验。",
    htmlContent: `
      <div class="product-wrapper p-4 bg-slate-50 rounded-2xl">
        <h1 class="text-2xl font-black text-slate-800">VerveX Max 2026款主动降噪无线头戴耳机</h1>
        <div class="flex gap-4 items-center my-2 text-xs text-slate-400">
          <span>商品型号: VV-MAX-2026</span>
          <span>防伪级别: 官方原装</span>
          <span class="text-green-600 font-bold">● 现货发售</span>
        </div>

        <!-- Ad Box 2 -->
        <div class="ad-banner bg-amber-50 p-3 rounded-lg text-xs border border-dashed border-amber-300 text-slate-700 my-4 flex justify-between items-center">
          <span>🔥 <b>【金融白条开通专享】</b>立即申办联名白条信用卡，首单再减 150 元！</span>
          <a href="#" class="bg-amber-500 text-white font-bold px-2.5 py-1 rounded text-[10px]">一键办卡</a>
        </div>

        <p class="my-3">VerveX Max 2026无线头戴耳机是声音美学与降噪科技的集大成者。搭载自主研发的 H4 双核主动降噪芯片，其降噪深度最高可达 -48dB，智能精准捕捉环境杂音，让你在喧嚣机场或公交地铁中亦能一秒沉入深海静谧空间。2026款还首创了声场黄金追踪（Spatial Gold Tracker）技术，通过多核惯性陀螺仪实时定位头部的微小倾斜，让3D声场时刻以你为圆心。</p>

        <div class="grid grid-cols-2 gap-4 my-4">
          <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80" alt="VerveX Max极夜黑外观展示" class="rounded-lg object-cover w-full h-40" />
          <img src="https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=400&q=80" alt="佩戴人体工学细节" class="rounded-lg object-cover w-full h-40" />
        </div>

        <p class="my-3">该耳机采用了45mm镀铍生物振膜，支持 LDAC、LHDC 5.0、aptX Adaptive 以及 AAC 等高解析度音频编码格式。其续航能力提升到了单次满电可持续播放 65 小时（降噪开启时 45 小时）。快充功能亦实现重大突破：仅需充电 5 分钟，即可支持超长 6 小时的音乐播放。舒适度层面采用顶级蛋白皮与慢回弹记忆海绵，重约 245g，长时间佩戴无明显压耳负荷。</p>

        <h3 class="font-bold text-slate-800 text-lg mt-6">官方渠道配件与主商品价格表</h3>
        <table class="min-w-full divide-y divide-slate-200 border border-slate-200 my-3 rounded-lg overflow-hidden text-xs">
          <thead class="bg-indigo-50">
            <tr>
              <th class="px-4 py-2 text-left font-bold text-slate-700">配置项目</th>
              <th class="px-4 py-2 text-left font-bold text-slate-700">官方指导价</th>
              <th class="px-4 py-2 text-left font-bold text-slate-700">折后秒杀价</th>
              <th class="px-4 py-2 text-left font-bold text-slate-700">增配服务</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr>
              <td class="px-4 py-2 font-medium text-slate-900">VerveX Max 头戴耳机（经典极夜黑）</td>
              <td class="px-4 py-2 text-slate-500">¥1,999</td>
              <td class="px-4 py-2 text-rose-600 font-bold">¥1,699</td>
              <td class="px-4 py-2 text-slate-500">免息24期+赠碳纤维收纳包</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-medium text-slate-900">VerveX Max 头戴耳机（雪境白高阶版）</td>
              <td class="px-4 py-2 text-slate-500">¥1,999</td>
              <td class="px-4 py-2 text-rose-600 font-bold">¥1,699</td>
              <td class="px-4 py-2 text-slate-500">免息24期+赠原厂耳机支架</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-medium text-slate-900">原装多维高解解码音频适配器 Type-C</td>
              <td class="px-4 py-2 text-slate-500">¥299</td>
              <td class="px-4 py-2 text-rose-600 font-bold">¥199</td>
              <td class="px-4 py-2 text-slate-500">配件专享秒杀</td>
            </tr>
          </tbody>
        </table>

        <p class="my-3 text-slate-500 text-xs">本季度精选好价：经典极夜黑与雪境白版本官方直降¥300，原价¥1,999，现售¥1,699。支持全国24期免息，购买还额外赠送价值¥299的碳纤维抗压便携收纳包。立即登录官方小程序或指定线上旗舰店选购，尊享声学旗舰体验。</p>
      </div>
    `,
    images: [
      {
        id: "img2-1",
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
        alt: "VerveX Max极夜黑外观展示",
        category: "photo",
        aiDescription: "这是一张在深色木质背景上拍摄的高档黑色无线头戴耳机的产品陈列图。灯光打在耳罩一侧，突显出细腻的金属光泽和饱满的皮质圆垫。",
        dimensions: "400x300"
      },
      {
        id: "img2-2",
        url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=400&q=80",
        alt: "佩戴人体工学细节",
        category: "photo",
        aiDescription: "微距微黄暖色系下呈现的一组耳机驱动单元和精致海绵垫微距特写，侧面展示降噪麦克风小孔位置。",
        dimensions: "400x300"
      }
    ],
    tables: [
      {
        id: "tbl2-1",
        title: "官方渠道配件与主商品价格表",
        headers: ["配置项目", "官方指导价", "折后秒杀价", "增配服务"],
        rows: [
          ["VerveX Max 头戴耳机（经典极夜黑）", "¥1,999", "¥1,699", "免息24期+赠碳纤维收纳包"],
          ["VerveX Max 头戴耳机（雪境白高阶版）", "¥1,999", "¥1,699", "免息24期+赠原厂耳机支架"],
          ["原装多维高解解码音频适配器 Type-C", "¥299", "¥199", "配件专享秒杀"]
        ],
        aiAnalysis: "价格分析：主耳机享有极高的性价比折扣，直降¥300幅度高达 15%，且附赠价值近¥300的实用收纳配件，相当于实际付¥1,400。配件音频适配器降价100元，适合需要Type-C无损模拟数字转化的发烧友打包购买。"
      }
    ]
  },
  {
    id: "arxiv-paper",
    title: "论文：基于异构注意力多层融合的神经机器翻译加速模型",
    url: "https://arxiv.org/abs/2602.04911",
    content: "本文提出了一种名为 HAF-NMT（Heterogeneous Attention Fusion）的全新神经机器翻译加速机制。传统自注意力模型（如标准 Transformer）在大规模并行句子对训练下，其自注意力图存储开销呈平方级增长（O(N^2)），严重限制了解码长上下文的吞吐能力。\n\n我们设计的 HAF-NMT 在以下两点做出了主要创新：首先，自适应轻量层分级机制，前 1/3 的浅层使用低维局部核线性注意力捕获词法关联，而中间层结合低秩近似（Low-rank Approximation），仅在最后数层部署标准完整的高维全局缩放点积注意力，从而使全局注意力开销大幅缩减为线性开销 O(N)；其次，建立了前向张量与目标多模态对齐融合的自适应软对齐缓存（AlignCache）机制，无需对每一层上下文均重新构建对齐概率分布。\n\n实验结果表明：在 WMT-23 德英、英法翻译数据集上的评测中，HAF-NMT 不仅将 BLEU 指标分数平均拉高了 0.45，其推理吞吐率（Throughput）更惊人地提升了 135%，且使模型前向传播所需显存空间缩减至原本的 38%。该研究为长文本和实时跨语言机器翻译的大规模低延迟部署开拓了新道路。",
    htmlContent: `
      <div class="arxiv-paper-content p-6 font-serif">
        <h1 class="text-xl font-bold text-slate-800 text-center mb-1">HAF-NMT: Accelerating Neural Machine Translation via Heterogeneous Attention Fusion</h1>
        <p class="text-xs text-slate-400 text-center italic mb-4">A. Chen, L. Wang, Y. Zhang, and X. Liu • Institute of Cognitive Computing, AI Labs</p>

        <!-- Academic ad banner -->
        <div class="ad-banner bg-slate-100 p-3 rounded-lg text-xs border border-slate-300 text-slate-600 my-4 text-center">
          <p class="font-bold">🎓 【学术会议招募】2026年国际计算语言与自然语言处理大会正在征稿，截稿日期延长至8月31日！</p>
          <a href="#" class="text-indigo-600 underline">立即查看投稿规范 &gt;</a>
        </div>

        <p class="my-3 leading-relaxed">本文提出了一种名为 HAF-NMT（Heterogeneous Attention Fusion）的全新神经机器翻译加速机制。传统自注意力模型（如标准 Transformer）在大规模并行句子对训练下，其自注意力图存储开销呈平方级增长（O(N^2)），严重限制了解码长上下文的吞吐能力。</p>
        
        <p class="my-3 leading-relaxed">我们设计的 HAF-NMT 在以下两点做出了主要创新：首先，自适应轻量层分级机制，前 1/3 的浅层使用低维局部核线性注意力捕获词法关联，而中间层结合低秩近似（Low-rank Approximation），仅在最后数层部署标准完整的高维全局缩放点积注意力，从而使全局注意力开销大幅缩减为线性开销 O(N)；其次，建立了前向张量与目标多模态对齐融合的自适应软对齐缓存（AlignCache）机制，无需对每一层上下文均重新构建对齐概率分布。</p>

        <h3 class="font-bold font-sans text-slate-800 text-base mt-6 mb-2">HAF-NMT 模型在主流测试数据集上的性能对比</h3>
        <table class="min-w-full divide-y divide-slate-200 border border-slate-200 my-3 rounded-lg overflow-hidden font-sans text-xs">
          <thead class="bg-indigo-50">
            <tr>
              <th class="px-4 py-2 text-left font-bold text-slate-700">模型变体</th>
              <th class="px-4 py-2 text-left font-bold text-slate-700">WMT德-英(BLEU)</th>
              <th class="px-4 py-2 text-left font-bold text-slate-700">WMT英-法(BLEU)</th>
              <th class="px-4 py-2 text-left font-bold text-slate-700">吞吐率 (sent/sec)</th>
              <th class="px-4 py-2 text-left font-bold text-slate-700">显存节省百分比</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr>
              <td class="px-4 py-2 font-medium text-slate-900">Baseline Transformer-Base</td>
              <td class="px-4 py-2 text-slate-500">28.45</td>
              <td class="px-4 py-2 text-slate-500">41.20</td>
              <td class="px-4 py-2 text-slate-500">120 s/s</td>
              <td class="px-4 py-2 text-slate-500">0% (对照组)</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-medium text-indigo-600">HAF-NMT (Ours)</td>
              <td class="px-4 py-2 text-slate-900 font-bold">28.92 (+0.47)</td>
              <td class="px-4 py-2 text-slate-900 font-bold">41.62 (+0.42)</td>
              <td class="px-4 py-2 text-indigo-600 font-bold">282 s/s (+135%)</td>
              <td class="px-4 py-2 text-green-600 font-bold">62% (显存仅占38%)</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-medium text-slate-900">Linear-Transformer (SOTA)</td>
              <td class="px-4 py-2 text-slate-500">27.90 (-0.55)</td>
              <td class="px-4 py-2 text-slate-500">39.80 (-1.40)</td>
              <td class="px-4 py-2 text-slate-500">295 s/s</td>
              <td class="px-4 py-2 text-slate-500">55% (显存占45%)</td>
            </tr>
          </tbody>
        </table>

        <p class="my-3 leading-relaxed">实验结果表明：在 WMT-23 德英、英法翻译数据集上的评测中，HAF-NMT 不仅将 BLEU 指标分数平均拉高了 0.45，其推理吞吐率（Throughput）更惊人地提升了 135%，且使模型前向传播所需显存空间缩减至原本的 38%。该研究为长文本和实时跨语言机器翻译的大规模低延迟部署开拓了新道路。</p>
      </div>
    `,
    images: [
      {
        id: "img3-1",
        url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80",
        alt: "全球数字算力互联",
        category: "photo",
        aiDescription: "高科技感深蓝色抽象宇宙节点网络图，表示跨语言分布式词表映射和多模态神经网络的信息在太空中交融传输。",
        dimensions: "400x300"
      }
    ],
    tables: [
      {
        id: "tbl3-1",
        title: "HAF-NMT 模型在主流测试数据集上的性能对比",
        headers: ["模型变体", "WMT德-英(BLEU)", "WMT英-法(BLEU)", "吞吐率 (sent/sec)", "显存节省百分比"],
        rows: [
          ["Baseline Transformer-Base", "28.45", "41.20", "120 s/s", "0% (对照组)"],
          ["HAF-NMT (Ours)", "28.92 (+0.47)", "41.62 (+0.42)", "282 s/s (+135%)", "62% (显存仅占38%)"],
          ["Linear-Transformer (SOTA)", "27.90 (-0.55)", "39.80 (-1.40)", "295 s/s", "55% (显存占45%)"]
        ],
        aiAnalysis: "翻译性能分析：我们提出的 HAF-NMT 翻译架构，不仅在翻译质量（BLEU）上胜过经典 Linear-Transformer 近 1 个百分点，也比 Baseline 标准 Transformer 平均提升 0.45 左右，同时实现了惊人的 282 s/s 推理吞吐率，成功破解了极速翻译下语言逻辑保真度受损的学术难题。"
      }
    ]
  }
];
