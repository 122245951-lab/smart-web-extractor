;(function () {
  'use strict';
  var global = typeof window !== 'undefined' ? window : self;
  global.SWE = global.SWE || {};
  var SWE = global.SWE;

  /**
   * 广告检测与过滤模块
   * 检测广告区域并支持静默过滤与预览净化双模式
   */

  /** 广告类名/ID 关键词 */
  var AD_KEYWORDS = [
    'ad', 'ads', 'advert', 'advertisement', 'advertising', 'ad-slot',
    'ad-container', 'ad-wrapper', 'ad-box', 'ad-banner', 'ad-label',
    'banner', 'sponsor', 'sponsored', 'promo', 'promotion',
    'recommend', 'recommended', 'aside-ad', 'google-ad', 'dfp-ad',
    'side-ad', 'top-ad', 'bottom-ad', 'mid-ad', 'in-content-ad',
    'native-ad', 'text-ad', 'display-ad', 'ad-unit', 'ad-placeholder',
    'ad-area', 'ad-section', 'ad-component', 'ad-module', 'ad-block',
    '广告', '推广', '推荐', '广告位', '推广链接', '赞助',
    'advertisement-label', 'ad-indicator', 'ad-notice'
  ];

  /** 已知广告 script 域名关键词 */
  var AD_DOMAINS = [
    'doubleclick.net', 'googleadservices.com', 'googlesyndication.com',
    'google-analytics.com', 'googletagmanager.com', 'amazon-adsystem.com',
    'cpro.baidustatic.com', 'pos.baidu.com', 'cbjs.baidu.com'
  ];

  /** 广告尺寸模式（iframe） */
  var AD_IFRAME_SIZES = [
    { w: 300, h: 250 }, { w: 336, h: 280 }, { w: 728, h: 90 },
    { w: 160, h: 600 }, { w: 300, h: 600 }, { w: 320, h: 50 },
    { w: 320, h: 100 }, { w: 468, h: 60 }, { w: 120, h: 600 },
    { w: 250, h: 250 }, { w: 200, h: 200 }
  ];

  /**
   * 检测元素是否为广告区域
   * @param {Element} element
   * @returns {boolean}
   */
  function isAdElement(element) {
    if (!element || !element.tagName) return false;
    var tag = element.tagName.toLowerCase();

    // 排除非容器标签
    if (['script', 'style', 'noscript'].indexOf(tag) !== -1) return false;

    // 1. CSS 类名/ID 关键词匹配
    var classStr = ((element.className || '') + ' ' + (element.id || '')).toLowerCase();
    for (var i = 0; i < AD_KEYWORDS.length; i++) {
      if (classStr.indexOf(AD_KEYWORDS[i]) !== -1) return true;
    }

    // 2. iframe 检测
    if (tag === 'iframe') {
      var width = parseInt(element.getAttribute('width')) || element.clientWidth;
      var height = parseInt(element.getAttribute('height')) || element.clientHeight;
      for (var j = 0; j < AD_IFRAME_SIZES.length; j++) {
        var adSize = AD_IFRAME_SIZES[j];
        // 允许 10px 误差
        if (Math.abs(width - adSize.w) <= 10 && Math.abs(height - adSize.h) <= 10) {
          return true;
        }
      }
      // 小 iframe（< 250px 两边）标记为可疑
      if (width <= 250 && height <= 250) return true;
    }

    // 3. 固定定位弹窗检测
    if (tag === 'div' || tag === 'aside') {
      var style = window.getComputedStyle(element);
      if (style.position === 'fixed') {
        var zIndex = parseInt(style.zIndex);
        if (zIndex > 100) {
          var text = element.textContent.toLowerCase();
          if (text.indexOf('×') !== -1 || text.indexOf('x') !== -1 ||
              text.indexOf('close') !== -1 || text.indexOf('关闭') !== -1 ||
              text.indexOf('ad') !== -1 || text.indexOf('跳过') !== -1) {
            return true;
          }
        }
      }
    }

    // 4. 文本极少但链接/图片密集
    if (tag === 'div' || tag === 'section') {
      var textLen = (element.textContent || '').replace(/\s/g, '').length;
      var links = element.querySelectorAll('a');
      var imgs = element.querySelectorAll('img');
      if (textLen < 50 && (links.length > 3 || imgs.length > 2)) return true;
    }

    return false;
  }

  /**
   * 查找元素内所有子广告区域
   * @param {Element} root
   * @returns {Element[]}
   */
  function findAdRegions(root) {
    if (!root) return [];
    var regions = [];
    var candidates = root.querySelectorAll('div, section, aside, iframe, figure');
    for (var i = 0; i < candidates.length; i++) {
      if (isAdElement(candidates[i])) {
        regions.push(candidates[i]);
      }
    }
    return regions;
  }

  /**
   * 从内容中过滤广告区域
   * @param {string} content - 原始提取内容文本
   * @param {Element[]} adRegions - 检测到的广告区域
   * @returns {string} 过滤后的内容
   */
  function filterAdContent(content, adRegions) {
    if (!adRegions || adRegions.length === 0) return content;
    // 收集广告区域的文本
    var adTexts = [];
    for (var i = 0; i < adRegions.length; i++) {
      var text = adRegions[i].textContent.trim();
      if (text && text.length > 5) adTexts.push(text);
    }
    // 从内容中移除广告文本
    var filtered = content;
    for (var j = 0; j < adTexts.length; j++) {
      filtered = filtered.replace(adTexts[j], '');
    }
    return filtered;
  }

  /**
   * 预览模式：高亮标记广告区域
   * @param {Element} root
   * @param {Element[]} adRegions
   */
  function highlightAdRegions(root, adRegions) {
    if (!root || !adRegions) return;
    var styleId = 'swe-ad-highlight-style';
    if (!document.getElementById(styleId)) {
      var style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .swe-ad-highlight {
          outline: 3px solid #DC2626 !important;
          outline-offset: 2px !important;
          background: rgba(220, 38, 38, 0.08) !important;
          position: relative !important;
        }
        .swe-ad-highlight::after {
          content: "⚠ 广告区域";
          position: absolute;
          top: 0;
          left: 0;
          background: #DC2626;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          z-index: 99999;
          border-radius: 0 0 4px 0;
        }
        .swe-ad-highlight.swe-ad-cleared::after {
          content: "✓ 已排除";
          background: #16A34A;
        }
        .swe-ad-highlight.swe-ad-cleared {
          outline-color: #16A34A !important;
          background: rgba(22, 163, 74, 0.05) !important;
        }
      `;
      document.head.appendChild(style);
    }

    for (var i = 0; i < adRegions.length; i++) {
      adRegions[i].classList.add('swe-ad-highlight');
      adRegions[i].setAttribute('data-swe-ad', 'true');
    }
  }

  /** 清除高亮 */
  function clearHighlight() {
    var highlighted = document.querySelectorAll('.swe-ad-highlight');
    for (var i = 0; i < highlighted.length; i++) {
      highlighted[i].classList.remove('swe-ad-highlight', 'swe-ad-cleared');
      highlighted[i].removeAttribute('data-swe-ad');
    }
  }

  /** 获取广告区域的文本 */
  function getAdRegionTexts(regions) {
    return regions.map(function (el) { return el.textContent.trim(); }).filter(function (t) { return t.length > 5; });
  }

  /** AdFilter API */
  SWE.AdFilter = {
    /** 检测广告区域 */
    detectAds: function (root) {
      root = root || document.body;
      return findAdRegions(root);
    },

    /** 从文本内容中移除广告文字 */
    filterContent: function (content, adRegions) {
      return filterAdContent(content, adRegions);
    },

    /** 预览模式下高亮标记 */
    previewCleanPage: function (root, adRegions) {
      root = root || document.body;
      if (!adRegions) adRegions = findAdRegions(root);
      highlightAdRegions(root, adRegions);
    },

    /** 清除高亮标记 */
    clearPreview: clearHighlight,

    /** 检测单个元素是否为广告 */
    isAdElement: isAdElement,

    /** 获取广告区域文本列表 */
    getAdTexts: function (regions) {
      return getAdRegionTexts(regions);
    }
  };
})();
