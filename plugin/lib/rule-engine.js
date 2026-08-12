;(function () {
  'use strict';
  var global = typeof window !== 'undefined' ? window : self;
  global.SWE = global.SWE || {};
  var SWE = global.SWE;

  /** 默认规则模板 */
  var SCENE_TEMPLATES = {
    news: {
      name: '新闻/博客文章',
      urlPattern: '',
      description: '提取新闻或博客文章的核心内容',
      prompt: '请用 3-5 句话概括以下网页内容的{lang}核心要点：\n\n{content}',
      extractionMode: 'fullPage',
      summaryLength: 'medium',
      includeImages: true,
      includeTables: false
    },
    product: {
      name: '产品页面',
      urlPattern: '',
      description: '提取产品名称、价格、规格和评价',
      prompt: '请按以下结构提取产品信息（{lang}）：\n\n## 产品名称\n## 价格\n## 规格参数\n## 用户评价摘要\n## 总体评分\n\n{content}',
      extractionMode: 'fullPage',
      summaryLength: 'medium',
      includeImages: true,
      includeTables: true
    },
    academic: {
      name: '学术论文',
      urlPattern: '',
      description: '提取论文摘要、方法、结论和参考文献',
      prompt: '请按以下结构提取学术论文内容（{lang}）：\n\n## 标题\n## 摘要\n## 研究方法\n## 主要发现\n## 结论\n## 参考文献要点\n\n{content}',
      extractionMode: 'fullPage',
      summaryLength: 'long',
      includeImages: true,
      includeTables: true
    },
    social: {
      name: '社交媒体',
      urlPattern: '',
      description: '提取社交媒体帖子的关键信息',
      prompt: '请提取以下社交媒体内容的核心信息（{lang}）：\n\n## 发布者\n## 主要内容\n## 关键评论\n## 互动数据\n\n{content}',
      extractionMode: 'fullPage',
      summaryLength: 'short',
      includeImages: true,
      includeTables: false
    },
    video: {
      name: '视频页面',
      urlPattern: '',
      description: '提取视频标题、简介和评论摘要',
      prompt: '请提取以下视频页面的关键信息（{lang}）：\n\n## 视频标题\n## 频道名称\n## 内容简介\n## 关键时间点\n## 评论摘要\n\n{content}',
      extractionMode: 'fullPage',
      summaryLength: 'medium',
      includeImages: true,
      includeTables: false
    },
    ecommerce: {
      name: '电商榜单',
      urlPattern: '',
      description: '提取电商榜单数据',
      prompt: '请提取以下电商榜单数据（{lang}）：\n\n## 榜单名称\n## 排名列表（商品名+价格+评分）\n## 关键趋势\n\n{content}',
      extractionMode: 'fullPage',
      summaryLength: 'medium',
      includeImages: true,
      includeTables: true
    },
    market: {
      name: '行情数据',
      urlPattern: '',
      description: '提取行情数据',
      prompt: '请提取以下行情数据（{lang}）：\n\n## 行情标题\n## 数据表格摘要\n## 趋势分析\n## 关键指标\n\n{content}',
      extractionMode: 'fullPage',
      summaryLength: 'medium',
      includeImages: false,
      includeTables: true
    }
  };

  SWE.SCENE_TEMPLATES = SCENE_TEMPLATES;

  /** 模板 Prompt 生成 */
  SWE.buildTemplatePrompt = function (template, vars) {
    var lang = SWE.getLang() === 'zh' ? '中文' : 'English';
    var prompt = template.prompt || '请对以下内容进行摘要（{lang}）：\n\n{content}';
    prompt = prompt.replace(/\{title\}/g, vars.title || '');
    prompt = prompt.replace(/\{url\}/g, vars.url || '');
    prompt = prompt.replace(/\{content\}/g, vars.content || '');
    prompt = prompt.replace(/\{images\}/g, vars.images || '');
    prompt = prompt.replace(/\{tables\}/g, vars.tables || '');
    prompt = prompt.replace(/\{lang\}/g, lang);
    return prompt;
  };

  /** 内置模板列表 */
  var BUILTIN_TEMPLATES = {
    brief: {
      name: '文字摘要',
      prompt: '请用 3-5 句话概括以下网页内容的核心要点，语言简洁凝练。\n---\n{content}'
    },
    structured: {
      name: '结构化摘要',
      prompt: '请按以下结构提取网页内容：\n## 核心观点\n## 关键论据\n## 重要数据\n## 结论/启示\n---\n{content}'
    },
    mindmap: {
      name: '图表化摘要',
      prompt: '请将以下内容转化为 Mermaid 思维导图（mindmap）语法：\n---\n{content}'
    }
  };

  SWE.BUILTIN_TEMPLATES = BUILTIN_TEMPLATES;

  /** 获取内置模板 prompt */
  SWE.getBuiltinPrompt = function (templateId, vars) {
    var template = BUILTIN_TEMPLATES[templateId];
    if (!template) template = BUILTIN_TEMPLATES.brief;
    var lang = SWE.getLang() === 'zh' ? '中文' : 'English';
    var prompt = template.prompt;
    prompt = prompt.replace(/\{title\}/g, vars.title || '');
    prompt = prompt.replace(/\{url\}/g, vars.url || '');
    prompt = prompt.replace(/\{content\}/g, vars.content || '');
    prompt = prompt.replace(/\{images\}/g, vars.images || '');
    prompt = prompt.replace(/\{tables\}/g, vars.tables || '');
    prompt = prompt.replace(/\{lang\}/g, lang);
    return prompt;
  };

  /**
   * 查找匹配 URL 的规则
   * @param {string} url - 当前页面 URL
   * @param {Array} rules - 规则列表
   * @returns {Object|null} - 匹配的规则，若无返回 null
   */
  SWE.matchRule = function (url, rules) {
    if (!url || !rules || !rules.length) return null;
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (!rule.enabled || !rule.urlPattern) continue;
      if (SWE.matchUrlPattern(url, rule.urlPattern)) {
        return rule;
      }
    }
    return null;
  };

  /** 验证规则对象 */
  SWE.validateRule = function (rule) {
    if (!rule) return { valid: false, error: '规则为空' };
    if (!rule.name) return { valid: false, error: '规则名称不能为空' };
    return { valid: true };
  };

  /** 导出规则为 JSON */
  SWE.exportRulesToJson = function (rules) {
    // 排除 API Key
    var cleanRules = rules.map(function (rule) {
      var r = JSON.parse(JSON.stringify(rule));
      delete r.id;
      return r;
    });
    var json = JSON.stringify({ version: 1, exportedAt: Date.now(), rules: cleanRules }, null, 2);
    var blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    SWE.downloadFile(blob, 'swe_rules_' + SWE.formatDate() + '.json');
  };

  /** 导入规则 JSON */
  SWE.importRulesFromJson = function (jsonStr) {
    try {
      var data = JSON.parse(jsonStr);
      if (!data.rules || !Array.isArray(data.rules)) {
        return { success: false, error: '无效的规则文件格式' };
      }
      var imported = data.rules.map(function (rule) {
        rule.id = SWE.uuid();
        rule.enabled = rule.enabled !== false;
        return rule;
      });
      return { success: true, rules: imported };
    } catch (e) {
      return { success: false, error: 'JSON 解析失败: ' + e.message };
    }
  };
})();
