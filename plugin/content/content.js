;(function () {
  'use strict';

  // 检查是否在扩展页面上（避免重复注入）
  if (document.documentElement.getAttribute('data-swe-injected') === 'true') return;
  document.documentElement.setAttribute('data-swe-injected', 'true');

  var SWE = window.SWE;

  /**
   * Content Script 主入口
   * 协调各子模块：初始化、消息监听、提取流程控制
   */

  var floatingPanel = null;

  /** 初始化 */
  function initialize() {
    // 加载语言并创建悬浮面板
    SWE.loadLang(function () {
      if (window.SWEFloatingPanel) {
        floatingPanel = new window.SWEFloatingPanel();
        floatingPanel.init();
      }
      // 检查主题
      detectTheme();
      // 根据设置决定是否创建浮动按钮
      createFloatingButton();
    });

    // 监听来自 Service Worker 的消息
    chrome.runtime.onMessage.addListener(handleMessage);
  }

  /** 检测并应用暗色主题 */
  function detectTheme() {
    var isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var root = document.getElementById('swe-root');
    if (root) {
      root.setAttribute('data-swe-theme', isDark ? 'dark' : 'light');
    }
  }

  /** 创建底部悬浮按钮（备用入口） */
  function createFloatingButton() {
    if (document.getElementById('swe-floating-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'swe-floating-btn';
    btn.className = 'swe-floating-btn';
    btn.innerHTML = '&#9881;';
    btn.title = SWE.t('panel.open.settings');
    btn.addEventListener('click', function () {
      if (floatingPanel) {
        floatingPanel.state = 4; // PanelState.CONFIGURING
        floatingPanel.panel.classList.add('swe-panel--open');
        floatingPanel.tab.classList.add('swe-edge-tab--hidden');
        floatingPanel.showConfig();
      } else if (window.SWEFloatingPanel) {
        floatingPanel = new window.SWEFloatingPanel();
        floatingPanel.init();
        floatingPanel.state = 4; // PanelState.CONFIGURING
        floatingPanel.panel.classList.add('swe-panel--open');
        floatingPanel.tab.classList.add('swe-edge-tab--hidden');
        floatingPanel.showConfig();
      }
    });
    document.body.appendChild(btn);
  }

  /** 处理来自 Service Worker 的消息 */
  function handleMessage(request, sender, sendResponse) {
    switch (request.type) {
      case 'extract:trigger':
        handleExtractTrigger(request.payload, sendResponse);
        return true;
      case 'extract:selection':
        handleExtractSelection(sendResponse);
        return true;
      case 'panel:toggle':
        if (floatingPanel) floatingPanel.toggle();
        sendResponse({ success: true });
        break;
      case 'panel:open':
        if (floatingPanel) floatingPanel.slideIn();
        sendResponse({ success: true });
        break;
      case 'panel:close':
        if (floatingPanel) floatingPanel.slideOut();
        sendResponse({ success: true });
        break;
      case 'ad:clear_preview':
        SWE.AdFilter.clearPreview();
        sendResponse({ success: true });
        break;
    }
  }

  /** 处理提取触发（来自右键菜单/快捷键等） */
  function handleExtractTrigger(payload, sendResponse) {
    if (!floatingPanel) {
      sendResponse({ success: false, error: 'Panel not initialized' });
      return;
    }
    // 打开面板并开始提取
    floatingPanel.slideIn();
    // 如果有 payload 参数（来自右键菜单）
    if (payload && payload.mode === 'selection') {
      floatingPanel.startExtraction('selection');
    } else {
      floatingPanel.startExtraction('fullPage');
    }
  }

  /** 处理选中内容提取 */
  function handleExtractSelection(sendResponse) {
    var selection = SWE.ContentExtractor.extractSelection();
    if (selection) {
      if (floatingPanel) {
        floatingPanel.slideIn();
        floatingPanel.showResult(selection, '');
      }
      sendResponse({ success: true, data: selection });
    } else {
      sendResponse({ success: false, error: 'No text selected' });
    }
  }

  /** 执行完整的提取流程 */
  SWE.runExtraction = function (mode, onProgress, onComplete) {
    mode = mode || 'fullPage';
    var result = { title: '', content: '', images: [], tables: [], adRegions: [] };

    try {
      // 步骤 1: 提取正文
      if (onProgress) onProgress('extracting');
      var extracted;
      if (mode === 'selection') {
        extracted = SWE.ContentExtractor.extractSelection();
      } else {
        extracted = SWE.ContentExtractor.extract();
      }
      if (!extracted) {
        if (onComplete) onComplete(null, 'NO_CONTENT');
        return;
      }
      result.title = extracted.title;
      result.content = extracted.content;
      result.truncated = extracted.truncated || false;

      // 步骤 2: 广告检测与过滤
      if (onProgress) onProgress('filtering');
      var adRegions = SWE.AdFilter.detectAds(document.body);
      if (adRegions.length > 0) {
        var filteredContent = SWE.AdFilter.filterContent(result.content, adRegions);
        result.content = filteredContent;
      }
      result.adRegions = adRegions;

      // 步骤 3: 收集图片
      if (onProgress) onProgress('collecting_images');
      var images = SWE.ImageCollector.collect();
      result.images = images || [];

      // 步骤 4: 解析表格
      if (onProgress) onProgress('parsing_tables');
      var tables = SWE.TableParser.findTables(document);
      result.tables = tables || [];

      // 完成
      if (onProgress) onProgress('done');
      if (onComplete) onComplete(result, null);

    } catch (err) {
      console.error('[SWE] Extraction error:', err);
      if (onProgress) onProgress('error');
      if (onComplete) onComplete(null, err);
    }
  };

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
