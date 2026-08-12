;(function () {
  'use strict';
  var global = typeof window !== 'undefined' ? window : self;
  global.SWE = global.SWE || {};
  var SWE = global.SWE;

  /** 轻量 Markdown -> HTML 渲染器 */
  SWE.markdownToHtml = function (md) {
    if (!md) return '';
    var html = md;

    // 转义 HTML 特殊字符（防止 XSS）
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // 代码块（pre > code）
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function (_, lang, code) {
      var langClass = lang ? ' class="language-' + SWE.escapeHtml(lang) + '"' : '';
      return '<pre><code' + langClass + '>' + SWE.escapeHtml(code.trim()) + '</code></pre>';
    });

    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 图片
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');

    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // 加粗
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 斜体
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // 删除线
    html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // 标题
    html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // 引用
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // 无序列表
    html = html.replace(/^[\s]*[-*+] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)\n<li>/gs, '$1</li>\n<li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // 有序列表
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)\s*(?=<\/ul>|$)/g, function (m) {
      if (m.indexOf('<ol>') === -1) return '<ol>' + m + '</ol>';
      return m;
    });

    // 水平线
    html = html.replace(/^---$/gm, '<hr>');

    // 段落（连续两换行分割）
    var lines = html.split('\n');
    var result = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) {
        if (result.length > 0 && !result[result.length - 1].match(/<\/?(ul|ol|li|pre|blockquote|h[1-6]|hr|table)[^>]*>$/)) {
          result.push('</p>');
        }
        continue;
      }

      // 跳过已经被包裹在块级标签中的行
      if (line.match(/^<(h[1-6]|li|pre|blockquote|ul|ol|hr|table|tr|th|td)[>\s]/) ||
          line.match(/<\/(h[1-6]|li|pre|blockquote|ul|ol|hr|table|tr|th|td)>$/)) {
        result.push(line);
        continue;
      }

      // 已经是段落的延续
      if (result.length > 0 && !result[result.length - 1].endsWith('</p>') &&
          !result[result.length - 1].match(/<\/(ul|ol|li|pre|blockquote|h[1-6]|hr)>/)) {
        result[result.length - 1] = result[result.length - 1] + ' ' + line;
      } else {
        result.push('<p>' + line);
      }
    }

    // 闭合最后一个段落
    if (result.length > 0 && !result[result.length - 1].endsWith('</p>') &&
        !result[result.length - 1].match(/<\/(ul|ol|li|pre|blockquote|h[1-6]|hr)>/)) {
      result[result.length - 1] += '</p>';
    }

    html = result.join('\n');

    return html;
  };

  /** 去除 Markdown 标记，获取纯文本 */
  SWE.markdownToPlainText = function (md) {
    if (!md) return '';
    var text = md;
    text = text.replace(/#{1,6}\s+/g, '');
    text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
    text = text.replace(/\*([^*]+)\*/g, '$1');
    text = text.replace(/~~([^~]+)~~/g, '$1');
    text = text.replace(/`([^`]+)`/g, '$1');
    text = text.replace(/```[\s\S]*?```/g, '');
    text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    text = text.replace(/>\s+/g, '');
    text = text.replace(/[-*+]\s+/g, '');
    text = text.replace(/\d+\.\s+/g, '');
    text = text.replace(/---/g, '');
    text = text.replace(/\n{3,}/g, '\n\n');
    return text.trim();
  };

  /** 将 Markdown 渲染为更友好的阅读型 HTML（带样式类） */
  SWE.renderReadableHtml = function (md) {
    if (!md) return '';

    var html = SWE.markdownToHtml(md);
    var wrapper = document.createElement('article');
    wrapper.className = 'swe-readable';
    wrapper.innerHTML = html;

    // 美化列表
    var lists = wrapper.querySelectorAll('ul, ol');
    for (var i = 0; i < lists.length; i++) {
      lists[i].className = 'swe-readable-list';
    }

    // 美化引用
    var quotes = wrapper.querySelectorAll('blockquote');
    for (var j = 0; j < quotes.length; j++) {
      quotes[j].className = 'swe-readable-quote';
    }

    // 美化代码块
    var codes = wrapper.querySelectorAll('pre');
    for (var k = 0; k < codes.length; k++) {
      codes[k].className = 'swe-readable-pre';
    }

    return wrapper.outerHTML;
  };

  /** 编辑器工具 — 在选区插入 Markdown 语法 */
  SWE.insertMarkdownSyntax = function (textarea, syntax, wrapper) {
    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;
    var text = textarea.value;
    var selected = text.substring(start, end);

    if (wrapper) {
      var newText = text.substring(0, start) + wrapper.before +
        (selected || wrapper.placeholder || '') + wrapper.after +
        text.substring(end);
      textarea.value = newText;
      textarea.selectionStart = start + wrapper.before.length;
      textarea.selectionEnd = textarea.selectionStart + (selected || wrapper.placeholder || '').length;
    } else if (syntax) {
      var insertion = (syntax.before || '') + (selected || syntax.placeholder || '') + (syntax.after || '');
      textarea.value = text.substring(0, start) + insertion + text.substring(end);
      var cursorPos = start + (syntax.before || '').length + (selected || syntax.placeholder || '').length;
      textarea.selectionStart = textarea.selectionEnd = cursorPos;
    }

    textarea.focus();
  };
})();
