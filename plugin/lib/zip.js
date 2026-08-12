/**
 * 轻量 ZIP 打包模块（自实现，CRC32 + ZIP 文件格式）
 * 兼容 Content Script 和 Service Worker 环境
 */
;(function () {
  'use strict';
  var global = typeof window !== 'undefined' ? window : self;
  global.SWE = global.SWE || {};
  var SWE = global.SWE;

  /** CRC32 计算 */
  function crc32(data) {
    var crc = 0xFFFFFFFF;
    for (var i = 0; i < data.length; i++) {
      crc ^= data[i];
      for (var j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  /**
   * 创建 ZIP 文件
   * @param {Array} files - [{name: string, data: Uint8Array}]
   * @returns {Uint8Array} ZIP binary data
   */
  SWE.createZip = function (files) {
    var enc = new TextEncoder();
    var localHeaders = [];
    var centralHeaders = [];
    var offset = 0;

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var nameBytes = enc.encode(file.name);
      var crc = crc32(file.data);
      var compSize = file.data.length;
      var uncompSize = file.data.length;

      // Local file header (30 + filename)
      var local = new Uint8Array(30 + nameBytes.length);
      var view = new DataView(local.buffer);
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 0, true);
      view.setUint16(8, 0, true);
      view.setUint16(10, 0, true);
      view.setUint16(12, 0, true);
      view.setUint32(14, crc, true);
      view.setUint32(18, compSize, true);
      view.setUint32(22, uncompSize, true);
      view.setUint16(26, nameBytes.length, true);
      view.setUint16(28, 0, true);
      local.set(nameBytes, 30);

      localHeaders.push({ header: local, data: file.data });

      // Central directory header (46 + filename)
      var central = new Uint8Array(46 + nameBytes.length);
      var cv = new DataView(central.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, 0, true);
      cv.setUint16(14, 0, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, compSize, true);
      cv.setUint32(24, uncompSize, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint16(38, 0, true);
      cv.setUint32(40, 0, true);
      cv.setUint32(44, 0, true);
      cv.setUint32(42, offset, true);
      central.set(nameBytes, 46);

      centralHeaders.push(central);
      offset += 30 + nameBytes.length + compSize;
    }

    var centralOffset = offset;
    var centralSize = 0;
    for (var i = 0; i < centralHeaders.length; i++) {
      centralSize += centralHeaders[i].length;
    }

    var totalSize = offset + centralSize + 22;
    var result = new Uint8Array(totalSize);
    var pos = 0;

    for (var i = 0; i < localHeaders.length; i++) {
      result.set(localHeaders[i].header, pos);
      pos += localHeaders[i].header.length;
      result.set(localHeaders[i].data, pos);
      pos += localHeaders[i].data.length;
    }

    for (var i = 0; i < centralHeaders.length; i++) {
      result.set(centralHeaders[i], pos);
      pos += centralHeaders[i].length;
    }

    // End of central directory record (22 bytes)
    var eocd = new Uint8Array(22);
    var ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, centralOffset, true);
    ev.setUint16(20, 0, true);
    result.set(eocd, pos);

    return result;
  };
})();
