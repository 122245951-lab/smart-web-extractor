;(function () {
  'use strict';
  var global = typeof window !== 'undefined' ? window : self;
  global.SWE = global.SWE || {};
  var SWE = global.SWE;

  /**
   * 正文提取引擎 — 基于文本密度算法
   * 类名以 CE_ 前缀避免与页面变量冲突
   */

  /** 广告/无关区域类名黑名单 */
  var AD_CLASS_PATTERNS = [
    'ad', 'ads', 'advert', 'advertisement', 'banner', 'sponsor', 'promo',
    'recommend', 'aside-ad', 'google-ad', 'sidebar', 'nav', 'navbar',
    'navigation', 'menu', 'header', 'footer', 'comment', 'comments',
    'social', 'share', 'related', 'widget', 'cookie', 'popup',
    'modal', 'overlay', 'subscribe', 'newsletter', 'aside', 'toolbar',
    '广告', '推广', '推荐'
  ];

  /** 正文候选标签 */
  var CONTENT_TAGS = ['article', 'main', 'section', 'div', 'p'];

  /**
   * 计算元素文本密度分数
   * @param {Element} element
   * @returns {number}
   */
  function computeTextDensity(element) {
    if (!element || !element.tagName) return 0;

    var tag = element.tagName.toLowerCase();
    var text = element.textContent || '';
    var textLen = text.replace(/\s+/g, ' ').trim().length;

    // 排除 min 标签和过小元素
    if (['script', 'style', 'noscript', 'iframe', 'br', 'hr',
         'input', 'select', 'textarea', 'button', 'label', 'option',
         'svg', 'path', 'canvas', 'img', 'video', 'audio'].indexOf(tag) !== -1) return -100;

    if (textLen < 20) return -1;

    var score = 0;

    // 基础文本分
    score += textLen * 1.0;

    // 段落加分
    var paragraphs = element.querySelectorAll('p');
    score += paragraphs.length * 10;

    // 标题加分
    var headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (var i = 0; i < headings.length; i++) {
      var hTag = headings[i].tagName.toLowerCase();
      if (['h1', 'h2', 'h3'].indexOf(hTag) !== -1) score += 30;
      else score += 10;
    }

    // 列表加分（有序/无序列表说明是有结构内容）
    var lists = element.querySelectorAll('ul, ol');
    score += lists.length * 5;

    // 链接密度惩罚
    var links = element.querySelectorAll('a');
    var linkText = '';
    for (var j = 0; j < links.length; j++) {
      linkText += links[j].textContent || '';
    }
    var linkDensity = textLen > 0 ? linkText.replace(/\s/g, '').length / textLen : 0;
    if (linkDensity > 0.5) score -= linkDensity * 100;

    // 广告类名惩罚
    var classStr = (element.className || '') + ' ' + (element.id || '');
    for (var k = 0; k < AD_CLASS_PATTERNS.length; k++) {
      if (classStr.toLowerCase().indexOf(AD_CLASS_PATTERNS[k]) !== -1) {
        score -= 200;
        break;
      }
    }

    // 小元素惩罚（避免强制布局重流，使用 offsetWidth/offsetHeight 代替 getBoundingClientRect）
    var w = element.offsetWidth || 0;
    var h = element.offsetHeight || 0;
    if (w > 0 && h > 0 && (w < 200 || h < 50)) score -= 500;

    return score;
  }

  /**
   * 查找页面的主内容区域
   * @param {Document} document
   * @returns {Element|null}
   */
  function findMainContent(document) {
    // 首先尝试 article / main 标签
    var article = document.querySelector('article');
    if (article) return article;
    var main = document.querySelector('main');
    if (main) return main;

    // 然后尝试使用文本密度评分找出最佳内容区域
    var candidates = [];

    // 遍历所有 div 及语义标签
    var allElements = document.querySelectorAll('div, section, article, main');
    for (var i = 0; i < allElements.length; i++) {
      var el = allElements[i];
      var score = computeTextDensity(el);
      if (score > 0) {
        candidates.push({ element: el, score: score });
      }
    }

    // 按分数从高到低排序
    candidates.sort(function (a, b) { return b.score - a.score; });

    if (candidates.length === 0) return null;

    var best = candidates[0].element;

    // 向上下扩展：合并相邻高分兄弟节点
    if (best.parentElement) {
      var parent = best.parentElement;
      var children = Array.prototype.filter.call(parent.children, function (child) {
        return child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE' && child.tagName !== 'NOSCRIPT';
      });
      var bestIndex = children.indexOf(best);

      // 扩展: 合并前后兄弟节点
      var mergeResults = [];
      mergeResults.push(best);

      // 向后扩展
      for (var ci = bestIndex + 1; ci < children.length; ci++) {
        var sibling = children[ci];
        if (sibling.tagName === 'P' || sibling.tagName === 'FIGURE' ||
            sibling.tagName === 'TABLE' || sibling.tagName === 'BLOCKQUOTE' ||
            sibling.tagName === 'PRE' || sibling.tagName === 'UL' ||
            sibling.tagName === 'OL' || sibling.tagName === 'H1' ||
            sibling.tagName === 'H2' || sibling.tagName === 'H3' ||
            sibling.tagName === 'H4' || sibling.tagName === 'H5' ||
            sibling.tagName === 'H6') {
          mergeResults.push(sibling);
        } else {
          break;
        }
      }

      // 向前扩展
      for (var ci = bestIndex - 1; ci >= 0; ci--) {
        var sibling = children[ci];
        if (sibling.tagName === 'P' || sibling.tagName === 'FIGURE' ||
            sibling.tagName === 'TABLE' || sibling.tagName === 'BLOCKQUOTE' ||
            sibling.tagName === 'PRE' || sibling.tagName === 'UL' ||
            sibling.tagName === 'OL' || sibling.tagName === 'H1' ||
            sibling.tagName === 'H2' || sibling.tagName === 'H3' ||
            sibling.tagName === 'H4' || sibling.tagName === 'H5' ||
            sibling.tagName === 'H6') {
          mergeResults.unshift(sibling);
        } else {
          break;
        }
      }

      // 创建合并容器
      var container = document.createElement('div');
      for (var mi = 0; mi < mergeResults.length; mi++) {
        container.appendChild(mergeResults[mi].cloneNode(true));
      }
      return container;
    }

    return best;
  }

  /**
   * 从元素中提取结构化内容
   * @param {Element} element
   * @returns {Object} { title, content, paragraphs }
   */
  function extractContentFromElement(element) {
    if (!element) return { title: '', content: '', paragraphs: [] };

    var title = '';
    var titleEl = document.querySelector('h1') || document.querySelector('title');
    if (titleEl) title = titleEl.textContent.trim();

    var paragraphs = [];
    var blockElements = element.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, pre, blockquote, figure, table, ul, ol');

    // 如果没有找到块级元素，取整个文本
    if (blockElements.length === 0) {
      var text = element.textContent.trim();
      if (text) paragraphs.push({ type: 'text', content: text });
    } else {
      for (var i = 0; i < blockElements.length; i++) {
        var el = blockElements[i];
        var tag = el.tagName.toLowerCase();
        var text = el.textContent.trim();
        if (!text) continue;

        if (tag.match(/^h[1-6]$/)) {
          paragraphs.push({ type: 'heading', level: parseInt(tag[1]), content: text });
        } else if (tag === 'li') {
          paragraphs.push({ type: 'list', content: text });
        } else if (tag === 'pre') {
          paragraphs.push({ type: 'code', content: text });
        } else if (tag === 'blockquote') {
          paragraphs.push({ type: 'quote', content: text });
        } else if (tag === 'figure') {
          paragraphs.push({ type: 'figure', content: text });
        } else if (tag === 'table') {
          // 表格内容仅在 table-parser 中详细处理，这里只记录存在
        } else if (tag === 'img') {
          var alt = el.getAttribute('alt') || '';
          paragraphs.push({ type: 'image', content: alt, src: el.getAttribute('src') });
        } else {
          paragraphs.push({ type: 'text', content: text });
        }
      }
    }

    // 构建纯文本内容（用于 AI 分析）
    var content = paragraphs.map(function (p) {
      if (p.type === 'heading') return '#'.repeat(p.level) + ' ' + p.content;
      return p.content;
    }).join('\n\n');

    return { title: title, content: content, paragraphs: paragraphs };
  }

  /**
   * 提取选中的内容
   * @param {Selection} selection
   * @returns {Object}
   */
  function extractSelection(selection) {
    if (!selection || !selection.rangeCount) return null;
    var range = selection.getRangeAt(0);
    var container = document.createElement('div');
    container.appendChild(range.cloneContents());
    var text = container.textContent.trim();
    if (!text) return null;
    return { title: document.title || '', content: text, paragraphs: [{ type: 'text', content: text }] };
  }

  /** 正文提取 API */
  SWE.ContentExtractor = {
    /** 提取整页 */
    extract: function () {
      var startTime = performance.now();
      var mainContent = findMainContent(document);
      if (!mainContent) {
        // 无正文区域，返回整个 body 的文本
        var allText = document.body.textContent.trim();
        if (!allText) return null;
        return {
          title: document.title || '',
          content: allText.substring(0, 100000),
          paragraphs: [{ type: 'text', content: allText }]
        };
      }
      var result = extractContentFromElement(mainContent);
      var elapsed = performance.now() - startTime;
      // 性能日志（不含用户数据）
      if (elapsed > 500) console.warn('[SWE] Extract took ' + elapsed.toFixed(0) + 'ms');
      // 截断超长内容
      if (result.content.length > 100000) {
        result.content = result.content.substring(0, 100000);
        result.truncated = true;
      }
      return result;
    },

    /** 提取选中的文本 */
    extractSelection: function () {
      return extractSelection(window.getSelection());
    },

    /** 提取指定选择器区域 */
    extractFromSelector: function (selector) {
      var el = document.querySelector(selector);
      if (!el) return null;
      return extractContentFromElement(el);
    },

    /** 计算文本密度（公开以便调试） */
    computeTextDensity: computeTextDensity
  };
})();
