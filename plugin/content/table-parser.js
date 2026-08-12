;(function () {
  'use strict';
  var global = typeof window !== 'undefined' ? window : self;
  global.SWE = global.SWE || {};
  var SWE = global.SWE;

  /**
   * 表格识别与解析模块
   * 支持标准 <table> 和 div 模拟表格
   */

  /**
   * 解析标准 HTML 表格
   * @param {HTMLTableElement} tableEl
   * @returns {Object|null}
   */
  function parseTable(tableEl) {
    if (!tableEl || tableEl.tagName !== 'TABLE') return null;

    var rows = tableEl.rows;
    if (!rows || rows.length === 0) return null;

    var headers = [];
    var data = [];
    var startRow = 0;

    // 解析表头
    var thead = tableEl.querySelector('thead');
    if (thead) {
      var headerRows = thead.querySelectorAll('tr');
      if (headerRows.length > 0) {
        var headerCells = headerRows[0].querySelectorAll('th, td');
        for (var i = 0; i < headerCells.length; i++) {
          headers.push(headerCells[i].textContent.trim());
        }
        startRow = 1;
      }
    }

    // 如果没找到 thead，尝试从第一行查找 th
    if (headers.length === 0 && rows.length > 0) {
      var firstRow = rows[0];
      var cells = firstRow.querySelectorAll('th, td');
      var hasTh = false;
      for (var i = 0; i < cells.length; i++) {
        if (cells[i].tagName === 'TH') {
          hasTh = true;
          break;
        }
      }
      if (hasTh) {
        for (var i = 0; i < cells.length; i++) {
          headers.push(cells[i].textContent.trim());
        }
        startRow = 1;
      }
    }

    // 解析数据行
    for (var r = startRow; r < rows.length; r++) {
      var rowData = [];
      var rowCells = rows[r].querySelectorAll('td, th');
      for (var c = 0; c < rowCells.length; c++) {
        rowData.push(rowCells[c].textContent.trim());
      }
      if (rowData.length > 0) {
        data.push(rowData);
      }
    }

    if (data.length === 0) return null;

    return {
      headers: headers,
      data: data,
      rowCount: data.length,
      colCount: Math.max(headers.length, data[0] ? data[0].length : 0),
      caption: (tableEl.caption ? tableEl.caption.textContent.trim() : '') ||
               (tableEl.getAttribute('title') || '')
    };
  }

  /**
   * 检测 div 模拟的表格结构
   * @param {Element} element
   * @returns {Object|null}
   */
  function detectDivTable(element) {
    if (!element || !element.children) return null;

    var style = window.getComputedStyle(element);
    var display = style.display;

    // display: table 或 grid 布局
    if (display !== 'table' && display !== 'grid' && display !== 'inline-table') {
      return null;
    }

    var children = element.children;
    if (children.length < 2) return null;

    var headers = [];
    var data = [];
    var hasStructure = false;

    // 提取行
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      var childStyle = window.getComputedStyle(child);
      var childDisplay = childStyle.display;

      if (childDisplay === 'table-row' || childDisplay === 'grid-row' ||
          child.tagName === 'DIV') {

        var cells = child.querySelectorAll(':scope > div, :scope > span');
        // 如果子元素中没有直接子元素，尝试获取该子元素的文本
        if (cells.length === 0) {
          cells = [child];
        }

        var rowData = [];
        for (var j = 0; j < cells.length && j < 10; j++) {
          rowData.push(cells[j].textContent.trim());
        }

        // 如果没有任何文本内容，跳过
        var hasText = rowData.some(function (t) { return t.length > 0; });
        if (!hasText) continue;

        if (i === 0 && !hasStructure) {
          // 第一行可能为表头
          for (var k = 0; k < rowData.length; k++) {
            headers.push(rowData[k]);
          }
          hasStructure = true;
          continue;
        }

        data.push(rowData);
      }
    }

    if (data.length === 0) return null;

    return {
      headers: headers,
      data: data,
      rowCount: data.length,
      colCount: headers.length > 0 ? headers.length : data[0].length,
      caption: element.getAttribute('aria-label') || element.getAttribute('title') || '',
      isDivTable: true
    };
  }

  /**
   * 查找页面中所有表格
   * @param {Document} doc
   * @returns {Object[]}
   */
  function findTables(doc) {
    if (!doc) return [];
    var tables = [];

    // 查找标准 <table>
    var htmlTables = doc.querySelectorAll('table');
    for (var i = 0; i < htmlTables.length; i++) {
      var parsed = parseTable(htmlTables[i]);
      if (parsed) {
        parsed.index = tables.length;
        parsed.type = 'html';
        tables.push(parsed);
      }
    }

    // 查找 div 模拟表格
    var divCandidates = doc.querySelectorAll('div[style*="display: table"], div[style*="display:table"], ' +
      'div[style*="display: grid"], div[style*="display:grid"]');
    for (var j = 0; j < divCandidates.length; j++) {
      var parsedDiv = detectDivTable(divCandidates[j]);
      if (parsedDiv) {
        parsedDiv.index = tables.length;
        parsedDiv.type = 'div';
        tables.push(parsedDiv);
      }
    }

    return tables;
  }

  /**
   * 将表格数据转 CSV 文本
   * @param {Object} tableData
   * @returns {string}
   */
  function tableToCsv(tableData) {
    if (!tableData) return '';
    var lines = [];

    // 转义 CSV 字段
    function escapeCsv(val) {
      if (val == null) return '';
      var str = String(val).replace(/"/g, '""');
      if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
        str = '"' + str + '"';
      }
      return str;
    }

    // 表头
    if (tableData.headers && tableData.headers.length > 0) {
      lines.push(tableData.headers.map(escapeCsv).join(','));
    }

    // 数据
    for (var i = 0; i < tableData.data.length; i++) {
      lines.push(tableData.data[i].map(escapeCsv).join(','));
    }

    return lines.join('\n');
  }

  /**
   * 生成表格摘要文本（用于 AI 分析）
   * @param {Object[]} tables
   * @returns {string}
   */
  function tablesToSummary(tables) {
    if (!tables || tables.length === 0) return '';
    var parts = [];
    for (var i = 0; i < tables.length; i++) {
      var t = tables[i];
      var caption = t.caption || ('表格 ' + (i + 1));
      var headerStr = t.headers && t.headers.length > 0 ? t.headers.join(' | ') : '';
      var sampleRows = t.data.slice(0, 3).map(function (r) { return r.join(' | '); }).join('\n');
      parts.push('[' + caption + '] ' + t.rowCount + '行 x ' + t.colCount + '列');
      if (headerStr) parts.push('表头: ' + headerStr);
      if (sampleRows) parts.push('示例数据:\n' + sampleRows);
    }
    return parts.join('\n\n');
  }

  /**
   * 基于表头或内容生成表格名称
   * @param {Object} tableData
   * @param {number} index
   * @returns {string}
   */
  function generateTableCaption(tableData, index) {
    if (tableData.caption && tableData.caption.trim()) {
      return tableData.caption.trim();
    }
    var headers = tableData.headers || [];
    if (headers.length > 0) {
      // 取前 3 个非空表头，组合成名称
      var parts = [];
      for (var i = 0; i < headers.length && parts.length < 3; i++) {
        var h = String(headers[i]).trim();
        if (h && parts.indexOf(h) === -1) parts.push(h);
      }
      if (parts.length > 0) {
        return parts.join(' · ');
      }
    }
    // 从第一行数据取第一个单元格作为补充
    var firstRow = (tableData.data && tableData.data[0]) || [];
    if (firstRow.length > 0 && firstRow[0]) {
      var firstCell = String(firstRow[0]).trim();
      if (firstCell) return firstCell;
    }
    return '表格 ' + (index + 1);
  }

  /** TableParser API */
  SWE.TableParser = {
    findTables: function (doc) {
      return findTables(doc || document);
    },

    parseTable: parseTable,

    detectDivTable: detectDivTable,

    tableToCsv: tableToCsv,

    tablesToSummary: tablesToSummary,

    /** 获取表格数据用于展示 */
    getDisplayData: function (tables) {
      if (!tables) return [];
      return tables.map(function (t, i) {
        return {
          index: i,
          caption: generateTableCaption(t, i),
          rowCount: t.rowCount,
          colCount: t.colCount,
          headers: t.headers || [],
          sampleData: (t.data || []).slice(0, 5),
          totalData: t.data,
          csv: tableToCsv(t)
        };
      });
    }
  };
})();
