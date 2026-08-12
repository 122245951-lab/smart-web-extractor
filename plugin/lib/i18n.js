;(function () {
  'use strict';
  var global = typeof window !== 'undefined' ? window : self;
  global.SWE = global.SWE || {};
  var SWE = global.SWE;

  /** 语言包 */
  var messages = {
    zh: {
      'app.name': '智能网页信息提取器',
      'app.tagline': '一键提取网页精华',
      'edge.tab.title': '点击提取网页精华',
      'edge.tab.text': '智能提取器',
      'panel.header.title': '智能提取器',
      'panel.open.settings': '设置',
      'panel.close': '关闭',
      'template.brief': '文字摘要',
      'template.structured': '结构化',
      'template.mindmap': '图表化',
      'template.custom': '自定义',
      'btn.extract': '⚡ 开始提取',
      'btn.reextract': '🔄 重新提取',
      'btn.export': '📥 导出',
      'btn.export_zip': '📦 下载 ZIP',
      'btn.save': '保存',
      'btn.cancel': '取消',
      'btn.config': '立即配置',
      'btn.test_connection': '测试连接',
      'btn.skip': '稍后配置',
      'btn.retry': '重试',
      'btn.send': '发送',
      'tab.summary': '📄 摘要',
      'tab.images': '🖼 图片',
      'tab.tables': '📊 表格',
      'tab.qa': '💬 问答',
      'label.txt': 'TXT',
      'label.md': 'MD',
      'label.word': 'Word',
      'label.short': '简短',
      'label.medium': '适中',
      'label.long': '详细',
      'progress.extracting': '正在提取页面内容...',
      'progress.filtering': '正在过滤广告...',
      'progress.collecting_images': '正在收集图片...',
      'progress.parsing_tables': '正在解析表格...',
      'progress.ai_connecting': '正在连接 AI...',
      'progress.ai_analyzing': '正在分析内容...',
      'progress.ai_summarizing': '正在生成摘要...',
      'progress.done': '提取完成 ✓',
      'progress.error': '提取失败',
      'state.welcome_title': '🎉 欢迎使用！',
      'state.welcome_desc': '我是你的网页智能助手，帮你快速提取网页精华。',
      'state.config_prompt': '开始前需要配置 AI 服务：',
      'state.api_provider': '选择 AI 供应商',
      'state.api_key': 'API Key',
      'state.encrypted_hint': '🔒 加密存储在本地',
      'state.no_content': '未检测到正文内容，尝试选中区域提取？',
      'state.no_images': '未检测到有效图片',
      'state.no_tables': '未检测到表格数据',
      'state.need_config_first': '请先在设置页配置 API Key 后使用',
      'state.need_permission': '需要<all_urls>权限以在任意页面显示面板',
      'state.extract_ready': '准备就绪，点击开始提取',
      'state.summary_empty': '尚无摘要内容',
      'qa.placeholder': '输入问题，基于网页内容回答...',
      'qa.hint': '你可以针对该网页内容进行提问，模型只根据该网页中的内容作为RAG的范围。',
      'qa.clear': '清除对话',
      'qa.cleared': '对话已清除',
      'image.filter_all': '全部',
      'image.filter_photo': '配图',
      'image.filter_chart': '图表',
      'image.filter_logo': 'Logo',
      'image.filter_other': '其他',
      'image.ai_desc': 'AI 描述（请先提取）',
      'image.download_selected': '下载选中图片',
      'image.n_selected': '{n} 张已选',
      'export.select_format': '选择导出格式',
      'export.downloading': '正在下载...',
      'export.success': '导出成功',
      'error.network': '网络连接失败，请检查网络',
      'error.timeout': '请求超时，请稍后重试',
      'error.api_key_invalid': 'API Key 无效，请检查配置',
      'error.rate_limit': '请求过于频繁，请稍后重试',
      'error.server': 'AI 服务暂时不可用，请稍后重试',
      'error.context_too_large': '内容过长，已自动截断，请重试',
      'error.unknown': '发生未知错误，请重试',
      'error.cross_origin_images': '部分图片因跨域无法打包',
      'settings.title': '设置',
      'settings.api': 'API 配置',
      'settings.api_provider': 'AI 供应商',
      'settings.api_key': 'API Key',
      'settings.api_key_placeholder': '输入 API Key',
      'settings.save_success': '保存成功',
      'settings.test_success': '连接成功',
      'settings.test_fail': '连接失败',
      'settings.language': '界面语言',
      'settings.trigger': '触发方式',
      'settings.trigger_edge_tab': '边沿标签',
      'settings.trigger_context_menu': '右键菜单',
      'settings.trigger_keyboard': '键盘快捷键',
      'settings.trigger_floating_btn': '浮动按钮',
      'settings.default_template': '默认摘要模板',
      'settings.summary_length': '摘要长度',
      'settings.include_images': '提取图片',
      'settings.include_tables': '提取表格',
      'settings.export_formats': '默认导出格式',
      'settings.rules': '自定义规则',
      'settings.add_rule': '添加规则',
      'settings.import_rules': '导入规则',
      'settings.export_rules': '导出规则',
      'settings.about': '关于',
      'settings.version': '版本',
      'settings.shortcut_link': '键盘快捷键设置',
      'settings.shortcut_hint': '键盘快捷键在浏览器扩展管理页修改',
      'rule.name': '规则名称',
      'rule.url_pattern': 'URL 模式',
      'rule.prompt': '提取提示词',
      'rule.save': '保存规则',
      'rule.delete': '删除',
      'rule.delete_confirm': '确定删除此规则？',
      'common.loading': '加载中...',
      'common.save': '保存',
      'common.cancel': '取消',
      'common.confirm': '确定',
      'common.close': '关闭',
      'common.copy': '复制',
      'common.copied': '已复制',
      'onboarding.welcome': '🎉 欢迎使用智能网页信息提取器！',
      'onboarding.desc': '请先配置 API Key 即可开始使用',
      'onboarding.go_settings': '去设置',
      'permission.title': '需要额外权限',
      'permission.desc': '为了在任意网页显示提取面板，需要申请<all_urls>权限',
      'permission.grant': '授权',
      'permission.deny': '拒绝（降级模式）',
      'permission.deny_hint': '降级后仅在点击工具栏图标后注入面板',
      'toast.extracted': '内容提取完成',
      'toast.exported': '文件已导出',
      'toast.copied': '已复制到剪贴板',
      'toast.saved': '保存成功',
      'toast.error': '操作失败',
      'settings.not_configured': '未配置',
      'settings.update': '更新',
      'settings.saved': '设置已保存',
      'settings.config_first': '请先配置 API Key',
      'settings.testing': '测试中...',
      'settings.connection_ok': '连接成功',
      'settings.connection_failed': '连接失败: ',
      'settings.no_rules': '暂无规则。点击「添加规则」创建一条。',
      'settings.edit': '编辑',
      'settings.delete': '删除',
      'settings.all_pages': '所有页面',
      'settings.edit_rule': '编辑规则',
      'settings.add_rule_form': '添加规则',
      'settings.rule_name_required': '请输入规则名称',
      'settings.rule_saved': '规则已保存',
      'settings.rule_deleted': '规则已删除',
      'settings.delete_confirm': '确定删除此规则？',
      'settings.import_failed': '导入失败: ',
      'settings.rules_imported': '规则已导入',
      'settings.lang_switched': '语言已切换。刷新页面以查看变更。',
      'settings.api_key_saved': 'API Key 已保存'
    },
    en: {
      'app.name': 'Smart Web Extractor',
      'app.tagline': 'Extract Web Highlights with One Click',
      'edge.tab.title': 'Click to extract web page highlights',
      'edge.tab.text': 'Extract',
      'panel.header.title': 'Smart Extractor',
      'panel.open.settings': 'Settings',
      'panel.close': 'Close',
      'template.brief': 'Brief',
      'template.structured': 'Structured',
      'template.mindmap': 'Mindmap',
      'template.custom': 'Custom',
      'btn.extract': '⚡ Start Extract',
      'btn.reextract': '🔄 Re-extract',
      'btn.export': '📥 Export',
      'btn.export_zip': '📦 Download ZIP',
      'btn.save': 'Save',
      'btn.cancel': 'Cancel',
      'btn.config': 'Configure Now',
      'btn.test_connection': 'Test Connection',
      'btn.skip': 'Set Up Later',
      'btn.retry': 'Retry',
      'btn.send': 'Send',
      'tab.summary': '📄 Summary',
      'tab.images': '🖼 Images',
      'tab.tables': '📊 Tables',
      'tab.edit': '✏️ Edit',
      'label.txt': 'TXT',
      'label.md': 'MD',
      'label.word': 'Word',
      'label.short': 'Short',
      'label.medium': 'Medium',
      'label.long': 'Long',
      'progress.extracting': 'Extracting page content...',
      'progress.filtering': 'Filtering ads...',
      'progress.collecting_images': 'Collecting images...',
      'progress.parsing_tables': 'Parsing tables...',
      'progress.ai_connecting': 'Connecting to AI...',
      'progress.ai_analyzing': 'Analyzing content...',
      'progress.ai_summarizing': 'Generating summary...',
      'progress.done': 'Extraction complete ✓',
      'progress.error': 'Extraction failed',
      'state.welcome_title': '🎉 Welcome!',
      'state.welcome_desc': 'Your web smart assistant for quick extraction.',
      'state.config_prompt': 'Configure AI service to get started:',
      'state.api_provider': 'Select AI Provider',
      'state.api_key': 'API Key',
      'state.encrypted_hint': '🔒 Encrypted & stored locally',
      'state.no_content': 'No content detected. Try selecting text?',
      'state.no_images': 'No valid images found',
      'state.no_tables': 'No table data found',
      'state.need_config_first': 'Please configure API Key in settings first',
      'state.need_permission': 'Need <all_urls> permission to show panel on any page',
      'state.extract_ready': 'Ready. Click to start extraction.',
      'state.summary_empty': 'No summary yet',
      'qa.placeholder': 'Ask a question based on page content...',
      'qa.hint': 'Ask questions about this page. The AI will answer using only the page content as context.',
      'qa.clear': 'Clear Chat',
      'qa.cleared': 'Chat cleared',
      'image.filter_all': 'All',
      'image.filter_photo': 'Photo',
      'image.filter_chart': 'Chart',
      'image.filter_logo': 'Logo',
      'image.filter_other': 'Other',
      'image.ai_desc': 'AI Description (extract first)',
      'image.download_selected': 'Download Selected',
      'image.n_selected': '{n} selected',
      'export.select_format': 'Select Format',
      'export.downloading': 'Downloading...',
      'export.success': 'Export successful',
      'error.network': 'Network connection failed. Please check.',
      'error.timeout': 'Request timed out. Please retry.',
      'error.api_key_invalid': 'Invalid API Key. Please check settings.',
      'error.rate_limit': 'Too many requests. Please wait.',
      'error.server': 'AI service temporarily unavailable.',
      'error.context_too_large': 'Content too long. Please try a shorter question.',
      'error.unknown': 'An unknown error occurred.',
      'error.cross_origin_images': 'Some images could not be packed due to CORS',
      'settings.title': 'Settings',
      'settings.api': 'API Configuration',
      'settings.api_provider': 'AI Provider',
      'settings.api_key': 'API Key',
      'settings.api_key_placeholder': 'Enter API Key',
      'settings.save_success': 'Saved successfully',
      'settings.test_success': 'Connection successful',
      'settings.test_fail': 'Connection failed',
      'settings.language': 'Language',
      'settings.trigger': 'Trigger Methods',
      'settings.trigger_edge_tab': 'Edge Tab',
      'settings.trigger_context_menu': 'Context Menu',
      'settings.trigger_keyboard': 'Keyboard Shortcut',
      'settings.trigger_floating_btn': 'Floating Button',
      'settings.default_template': 'Default Template',
      'settings.summary_length': 'Summary Length',
      'settings.include_images': 'Extract Images',
      'settings.include_tables': 'Extract Tables',
      'settings.export_formats': 'Default Export Formats',
      'settings.rules': 'Custom Rules',
      'settings.add_rule': 'Add Rule',
      'settings.import_rules': 'Import Rules',
      'settings.export_rules': 'Export Rules',
      'settings.about': 'About',
      'settings.version': 'Version',
      'settings.shortcut_link': 'Keyboard Shortcut Settings',
      'settings.shortcut_hint': 'Modify shortcuts in browser extension management page',
      'rule.name': 'Rule Name',
      'rule.url_pattern': 'URL Pattern',
      'rule.prompt': 'Extraction Prompt',
      'rule.save': 'Save Rule',
      'rule.delete': 'Delete',
      'rule.delete_confirm': 'Are you sure you want to delete this rule?',
      'common.loading': 'Loading...',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.confirm': 'Confirm',
      'common.close': 'Close',
      'common.copy': 'Copy',
      'common.copied': 'Copied',
      'onboarding.welcome': '🎉 Welcome to Smart Web Extractor!',
      'onboarding.desc': 'Configure API Key to get started',
      'onboarding.go_settings': 'Go to Settings',
      'permission.title': 'Additional Permission Needed',
      'permission.desc': 'Need <all_urls> permission to show panel on any page',
      'permission.grant': 'Grant',
      'permission.deny': 'Deny (Degraded Mode)',
      'permission.deny_hint': 'Panel will only show after clicking toolbar icon',
      'toast.extracted': 'Content extracted',
      'toast.exported': 'File exported',
      'toast.copied': 'Copied to clipboard',
      'toast.saved': 'Saved successfully',
      'toast.error': 'Operation failed',
      'settings.not_configured': 'Not configured',
      'settings.update': 'Update',
      'settings.saved': 'Settings saved',
      'settings.config_first': 'Configure API Key first',
      'settings.testing': 'Testing...',
      'settings.connection_ok': 'Connection OK',
      'settings.connection_failed': 'Failed: ',
      'settings.no_rules': 'No rules yet. Click Add Rule to create one.',
      'settings.edit': 'Edit',
      'settings.delete': 'Delete',
      'settings.all_pages': 'All pages',
      'settings.edit_rule': 'Edit Rule',
      'settings.add_rule_form': 'Add Rule',
      'settings.rule_name_required': 'Rule name required',
      'settings.rule_saved': 'Rule saved',
      'settings.rule_deleted': 'Rule deleted',
      'settings.delete_confirm': 'Delete this rule?',
      'settings.import_failed': 'Import failed: ',
      'settings.rules_imported': 'Rules imported',
      'settings.lang_switched': 'Language switched. Refresh to see changes.',
      'settings.api_key_saved': 'API Key saved'
    }
  };

  var currentLang = 'zh';

  /** 获取当前语言 */
  SWE.getLang = function () { return currentLang; };

  /** 设置语言 */
  SWE.setLang = function (lang) {
    if (messages[lang]) {
      currentLang = lang;
      return true;
    }
    return false;
  };

  /** 加载保存的语言偏好 */
  SWE.loadLang = function (callback) {
    chrome.storage.sync.get('sync:language', function (result) {
      var lang = result['sync:language'];
      if (lang && messages[lang]) {
        currentLang = lang;
      } else {
        // 根据浏览器语言自动选择
        var navLang = (navigator.language || '').toLowerCase();
        currentLang = navLang.startsWith('zh') ? 'zh' : 'en';
      }
      if (callback) callback(currentLang);
    });
  };

  /** 保存语言偏好 */
  SWE.saveLang = function (lang, callback) {
    currentLang = lang;
    chrome.storage.sync.set({ 'sync:language': lang }, callback || function () {});
  };

  /** 翻译单个 key */
  SWE.t = function (key) {
    var msg = messages[currentLang] && messages[currentLang][key];
    return msg || messages['en'][key] || key;
  };

  /** 翻译并替换变量。用法：SWE.tt('image.n_selected', {n: 5}) */
  SWE.tt = function (key, vars) {
    var text = SWE.t(key);
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, function (_, name) {
      return vars[name] !== undefined ? vars[name] : '{' + name + '}';
    });
  };

  /** 翻译 DOM 中所有 data-i18n 属性 */
  SWE.translateDom = function (root) {
    root = root || document;
    var els = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      els[i].textContent = SWE.t(key);
    }
  };
})();
