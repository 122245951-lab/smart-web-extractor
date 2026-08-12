;(function () {
  'use strict';
  var global = typeof window !== 'undefined' ? window : self;
  global.SWE = global.SWE || {};

  var SWE = global.SWE;

  /** 生成 UUID v4 */
  SWE.uuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  /** 防抖 */
  SWE.debounce = function (fn, delay) {
    var timer = null;
    return function () {
      var ctx = this, args = arguments;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, delay || 300);
    };
  };

  /** 节流 */
  SWE.throttle = function (fn, interval) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= (interval || 200)) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  };

  /** HTML 转义 */
  SWE.escapeHtml = function (str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str || ''));
    return div.innerHTML;
  };

  /** 文本截断 */
  SWE.truncate = function (text, maxLen) {
    if (!text || text.length <= maxLen) return text || '';
    return text.substring(0, maxLen) + '...';
  };

  /** 文件大小格式化 */
  SWE.formatFileSize = function (bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  /** 日期格式化 */
  SWE.formatDate = function (date) {
    if (!date) date = new Date();
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  };

  /** 从文件名中移除非法字符 */
  SWE.safeFilename = function (name) {
    return (name || 'export').replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_').substring(0, 200);
  };

  /** 数组按 chunk 分组 */
  SWE.chunkArray = function (arr, size) {
    var result = [];
    for (var i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  /** 判断元素是否在视口中 */
  SWE.isElementVisible = function (el) {
    var rect = el.getBoundingClientRect();
    var vw = window.innerWidth || document.documentElement.clientWidth;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.left < vw && rect.right > 0 && rect.top < vh && rect.bottom > 0;
  };

  /** URL glob 模式转正则 */
  SWE.globToRegex = function (pattern) {
    if (!pattern) return null;
    var escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    var regexStr = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
    return new RegExp('^' + regexStr + '$', 'i');
  };

  /** URL 是否匹配模式 */
  SWE.matchUrlPattern = function (url, pattern) {
    var regex = SWE.globToRegex(pattern);
    return regex ? regex.test(url) : false;
  };

  /** 安全 JSON 解析 */
  SWE.safeParse = function (str, fallback) {
    if (!str) return fallback;
    try { return JSON.parse(str); } catch (e) { return fallback; }
  };

  /** Base64 工具 */
  SWE.arrayBufferToBase64 = function (buffer) {
    var bytes = new Uint8Array(buffer);
    var binary = '';
    for (var i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  SWE.base64ToArrayBuffer = function (base64) {
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  /** 全局 Toast 通知 */
  SWE.showToast = function (message, type, duration) {
    var container = document.getElementById('swe-root');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'swe-toast swe-toast--' + (type || 'info');
    toast.textContent = message;
    container.appendChild(toast);
    var dur = duration || 3000;
    setTimeout(function () {
      toast.classList.add('swe-toast--exit');
      setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    }, dur);
  };
})();
