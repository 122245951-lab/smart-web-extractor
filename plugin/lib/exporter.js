;(function () {
  'use strict';
  var global = typeof window !== 'undefined' ? window : self;
  global.SWE = global.SWE || {};
  var SWE = global.SWE;

  /** 生成 TXT 导出 Blob */
  SWE.exportTxt = function (content, metadata) {
    var text = 'Title: ' + (metadata.title || '') + '\n';
    text += 'URL: ' + (metadata.url || '') + '\n';
    text += 'Date: ' + SWE.formatDate() + '\n';
    text += '---\n\n';
    text += SWE.markdownToPlainText(content || '');
    return new Blob([text], { type: 'text/plain;charset=utf-8' });
  };

  /** 生成 Markdown 导出 Blob */
  SWE.exportMarkdown = function (content, metadata) {
    var md = '---\n';
    md += 'title: "' + (metadata.title || '') + '"\n';
    md += 'url: "' + (metadata.url || '') + '"\n';
    md += 'date: "' + SWE.formatDate() + '"\n';
    md += '---\n\n';
    md += content || '';
    return new Blob([md], { type: 'text/markdown;charset=utf-8' });
  };

  /** 生成 Word 兼容 HTML 导出 Blob */
  SWE.exportWord = function (content, metadata) {
    var htmlContent = SWE.markdownToHtml(content || '');
    var title = SWE.escapeHtml(metadata.title || 'Smart Web Extract');
    var wordHtml = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ';
    wordHtml += 'xmlns:w="urn:schemas-microsoft-com:office:word" ';
    wordHtml += 'xmlns="http://www.w3.org/TR/REC-html40">\n';
    wordHtml += '<head>\n<meta charset="utf-8">\n';
    wordHtml += '<title>' + title + '</title>\n';
    wordHtml += '<!--[if gte mso 9]><xml><w:WordDocument>';
    wordHtml += '<w:View>Print</w:View>';
    wordHtml += '</w:WordDocument></xml><![endif]-->\n';
    wordHtml += '<style>\n';
    wordHtml += 'body { font-family: "Microsoft YaHei", "Segoe UI", Arial, sans-serif; ';
    wordHtml += 'font-size: 12pt; line-height: 1.6; padding: 20px; }\n';
    wordHtml += 'h1 { font-size: 20pt; }\n';
    wordHtml += 'h2 { font-size: 16pt; }\n';
    wordHtml += 'h3 { font-size: 14pt; }\n';
    wordHtml += 'pre { background: #f5f5f5; padding: 10px; font-family: Consolas, monospace; }\n';
    wordHtml += 'code { font-family: Consolas, monospace; background: #f5f5f5; }\n';
    wordHtml += 'table { border-collapse: collapse; width: 100%; }\n';
    wordHtml += 'td, th { border: 1px solid #ccc; padding: 6px; }\n';
    wordHtml += 'th { background: #f0f0f0; }\n';
    wordHtml += 'img { max-width: 100%; height: auto; }\n';
    wordHtml += 'blockquote { border-left: 4px solid #ccc; margin: 10px 0; ';
    wordHtml += 'padding-left: 15px; color: #666; }\n';
    wordHtml += '</style>\n</head>\n<body>\n';
    wordHtml += '<h1>' + title + '</h1>\n';
    wordHtml += '<p><em>Source: <a href="' + SWE.escapeHtml(metadata.url || '') + '">';
    wordHtml += SWE.escapeHtml(metadata.url || '') + '</a></em></p>\n';
    wordHtml += '<hr>\n';
    wordHtml += htmlContent;
    wordHtml += '\n</body>\n</html>';
    return new Blob([wordHtml], { type: 'application/msword;charset=utf-8' });
  };

  /** 触发文件下载 */
  SWE.downloadFile = function (blob, filename) {
    var url = URL.createObjectURL(blob);
    chrome.runtime.sendMessage({
      type: 'export:file',
      payload: { url: url, filename: filename }
    });
  };

  /** 生成导出文件名 */
  SWE.generateExportFilename = function (title, ext) {
    var safe = SWE.safeFilename(title || 'export');
    return safe + '_' + SWE.formatDate() + '.' + ext;
  };

  /**
   * 下载 ZIP（由共享模块 lib/zip.js 提供 createZip，Service Worker 负责跨域抓取与打包）
   */
  SWE.downloadZip = function (images, title) {
    if (!images || images.length === 0) return;
    var safeName = SWE.safeFilename(title || 'images');

    // 需要通过 Service Worker 获取跨域图片
    chrome.runtime.sendMessage({
      type: 'images:fetch',
      payload: { images: images.map(function (img) { return img.src; }),
                title: safeName }
    }, function (response) {
      if (response && response.success) {
        SWE.showToast(SWE.t('toast.exported'), 'success');
      } else if (response && response.error) {
        SWE.showToast(response.error, 'error');
      }
    });
  };
})();
