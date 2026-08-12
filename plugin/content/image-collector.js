;(function () {
  'use strict';
  var global = typeof window !== 'undefined' ? window : self;
  global.SWE = global.SWE || {};
  var SWE = global.SWE;

  /**
   * 图片收集与分类模块
   */

  /** 图片分类枚举 */
  var ImageCategory = {
    ICON: 'icon',
    LOGO: 'logo',
    PHOTO: 'photo',
    CHART: 'chart',
    OTHER: 'other'
  };

  /**
   * 分类单张图片
   * @param {HTMLImageElement} img
   * @returns {string}
   */
  function classifyImage(img) {
    if (!img) return ImageCategory.OTHER;

    var w = img.naturalWidth || img.width || 0;
    var h = img.naturalHeight || img.height || 0;
    var src = (img.getAttribute('src') || '').toLowerCase();
    var alt = (img.getAttribute('alt') || '').toLowerCase();
    var cls = (img.className || '').toLowerCase();
    var id = (img.id || '').toLowerCase();

    // 图标：小尺寸
    if (w < 50 && h < 50) return ImageCategory.ICON;

    // Logo：alt/src 含 logo
    if (alt.indexOf('logo') !== -1 || src.indexOf('logo') !== -1 ||
        cls.indexOf('logo') !== -1 || id.indexOf('logo') !== -1) {
      return ImageCategory.LOGO;
    }

    // 图表：src 含 chart/graph
    if (src.indexOf('chart') !== -1 || src.indexOf('graph') !== -1 ||
        src.indexOf('figure') !== -1 || src.indexOf('统计') !== -1 ||
        src.indexOf('plot') !== -1) {
      return ImageCategory.CHART;
    }

    // 配图：大尺寸
    if (w > 400 && h > 300) return ImageCategory.PHOTO;

    // 在 <figure> 内或后有 <figcaption>
    if (img.closest('figure')) return ImageCategory.PHOTO;

    // 默认
    return ImageCategory.OTHER;
  }

  /**
   * 收集页面的图片
   * @param {Document} doc
   * @param {Element} contentArea - 限定在正文区域内（可选）
   * @returns {Object[]}
   */
  function collectImages(doc, contentArea) {
    if (!doc) return [];

    // 收集所有 img 元素
    var imgElements;
    if (contentArea) {
      imgElements = contentArea.querySelectorAll('img');
    } else {
      imgElements = doc.querySelectorAll('img');
    }

    var images = [];
    var seenSrcs = {};

    for (var i = 0; i < imgElements.length; i++) {
      var img = imgElements[i];
      var src = img.getAttribute('src') || '';

      // base64 图跳过
      if (src.startsWith('data:')) continue;

      // 空 src 跳过
      if (!src.trim()) continue;

      // 去重
      if (seenSrcs[src]) continue;
      seenSrcs[src] = true;

      var w = img.naturalWidth || img.width || 0;
      var h = img.naturalHeight || img.height || 0;

      // 排除小图标（< 50x50）
      if (w > 0 && h > 0 && w < 50 && h < 50) continue;

      var category = classifyImage(img);
      var alt = img.getAttribute('alt') || '';

      images.push({
        src: src,
        width: w,
        height: h,
        alt: alt,
        category: category,
        selected: false,
        aiDescription: '',
        loadingAiDesc: false
      });
    }

    return images;
  }

  /**
   * 生成图片的上下文文本（用于文字推断降级）
   * @param {Object} img
   * @returns {string}
   */
  function getImageContext(img) {
    var parts = [];
    if (img.alt) parts.push('alt: ' + img.alt);
    if (img.width && img.height) parts.push(img.width + 'x' + img.height);
    // 从 src 推测
    var srcName = img.src.split('/').pop() || '';
    if (srcName) parts.push('filename: ' + srcName);
    return parts.join(', ');
  }

  /**
   * 生成图片列表的 Markdown 文本
   * @param {Object[]} images
   * @returns {string}
   */
  function imagesToMarkdown(images) {
    if (!images || images.length === 0) return '';
    var lines = [];
    for (var i = 0; i < images.length; i++) {
      var img = images[i];
      var desc = img.aiDescription || img.alt || ('Image ' + (i + 1));
      lines.push('![' + desc + '](' + img.src + ')');
      if (img.aiDescription) lines.push('> ' + img.aiDescription);
    }
    return lines.join('\n\n');
  }

  /**
   * 构建图片上下文文本（用于 AI 分析时的图片信息）
   * @param {Object[]} images
   * @returns {string}
   */
  function imagesToTextSummary(images) {
    if (!images || images.length === 0) return '';
    var parts = [];
    for (var i = 0; i < images.length; i++) {
      var img = images[i];
      parts.push('图片' + (i + 1) + ': ' + (img.alt || '(无描述)') +
        ' [' + img.width + 'x' + img.height + '] ' +
        (img.category ? '(' + img.category + ')' : ''));
    }
    return '\n[页面图片列表]\n' + parts.join('\n');
  }

  /** ImageCollector API */
  SWE.ImageCollector = {
    collect: function (contentArea) {
      return collectImages(document, contentArea);
    },

    classify: classifyImage,

    getImageContext: getImageContext,

    imagesToMarkdown: imagesToMarkdown,

    imagesToTextSummary: imagesToTextSummary,

    ImageCategory: ImageCategory
  };
})();
