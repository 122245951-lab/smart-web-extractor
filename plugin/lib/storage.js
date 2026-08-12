;(function () {
  'use strict';
  var global = typeof window !== 'undefined' ? window : self;
  global.SWE = global.SWE || {};
  var SWE = global.SWE;

  var STORAGE_KEYS = {
    API_KEY_DEEPSEEK: 'secure:api_key_deepseek',
    API_KEY_QWEN: 'secure:api_key_qwen',
    API_KEY_QWEN_VL: 'secure:api_key_qwen_vl',
    RULES: 'local:rules',
    LAST_EXTRACTION: 'local:last_extraction',
    SETTINGS: 'sync:settings',
    RULES_SYNC: 'sync:rules',
    LANGUAGE: 'sync:language'
  };

  SWE.STORAGE_KEYS = STORAGE_KEYS;

  /** 生成设备指纹（用于 Key 派生） */
  async function deriveDeviceFingerprint() {
    var parts = [];
    // 浏览器信息
    parts.push(navigator.userAgent || '');
    parts.push(navigator.language || '');
    // 屏幕信息
    parts.push(String(screen.width) + 'x' + String(screen.height));
    parts.push(String(screen.colorDepth));
    // 硬件（有限信息）
    parts.push(navigator.hardwareConcurrency || '');
    parts.push(navigator.deviceMemory || '');
    // 平台
    parts.push(navigator.platform || '');
    var fingerprint = parts.join('|');
    var encoder = new TextEncoder();
    var data = encoder.encode(fingerprint);
    var hash = await crypto.subtle.digest('SHA-256', data);
    return hash;
  }

  /** PBKDF2 派生加密密钥 */
  async function deriveEncryptionKey(fingerprint, salt) {
    var saltEncoder = new TextEncoder();
    var saltData = saltEncoder.encode('swe-' + salt);
    var keyMaterial = await crypto.subtle.importKey(
      'raw', fingerprint, 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltData,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /** 加密明文 */
  async function encrypt(plaintext, provider) {
    var fingerprint = await deriveDeviceFingerprint();
    var cryptoKey = await deriveEncryptionKey(fingerprint, provider);
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var encoded = new TextEncoder().encode(plaintext);
    var encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv }, cryptoKey, encoded
    );
    return {
      iv: SWE.arrayBufferToBase64(iv),
      data: SWE.arrayBufferToBase64(encrypted),
      alg: 'AES-GCM-256',
      created: Date.now()
    };
  }

  /** 解密密文 */
  async function decrypt(payload, provider) {
    if (!payload || !payload.iv || !payload.data) return null;
    var fingerprint = await deriveDeviceFingerprint();
    var cryptoKey = await deriveEncryptionKey(fingerprint, provider);
    var iv = SWE.base64ToArrayBuffer(payload.iv);
    var ciphertext = SWE.base64ToArrayBuffer(payload.data);
    try {
      var plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv }, cryptoKey, ciphertext
      );
      return new TextDecoder().decode(plaintext);
    } catch (e) {
      return null;
    }
  }

  /** 加密保存 API Key */
  SWE.saveApiKey = async function (provider, plaintextKey) {
    if (!plaintextKey || !plaintextKey.trim()) {
      await SWE.removeApiKey(provider);
      return;
    }
    var key = plaintextKey.trim();
    var keyName = STORAGE_KEYS['API_KEY_' + provider.toUpperCase()];
    if (!keyName) return;

    var securePayload = await encrypt(key, provider);
    var obj = {};
    obj[keyName] = securePayload;
    await chrome.storage.local.set(obj);
    // 立即清除内存
    key = null;
    plaintextKey = null;
  };

  /** 解密读取 API Key */
  SWE.getApiKey = async function (provider) {
    var keyName = STORAGE_KEYS['API_KEY_' + provider.toUpperCase()];
    if (!keyName) return null;
    var result = await chrome.storage.local.get(keyName);
    var payload = result[keyName];
    if (!payload) return null;
    var plaintext = await decrypt(payload, provider);
    return plaintext;
  };

  /** 删除 API Key */
  SWE.removeApiKey = async function (provider) {
    var keyName = STORAGE_KEYS['API_KEY_' + provider.toUpperCase()];
    if (!keyName) return;
    await chrome.storage.local.remove(keyName);
  };

  /** 脱敏显示 API Key */
  SWE.maskApiKey = function (key) {
    if (!key || key.length < 8) return '****';
    return key.substring(0, 4) + '****' + key.substring(key.length - 4);
  };

  /** 获取常规设置 */
  SWE.getSettings = function (callback) {
    chrome.storage.sync.get(STORAGE_KEYS.SETTINGS, function (result) {
      var settings = result[STORAGE_KEYS.SETTINGS] || {
        defaultTemplate: 'brief',
        summaryLength: 'medium',
        includeImages: true,
        includeTables: true,
        exportFormats: { txt: true, md: true, word: false },
        triggers: {
          edgeTab: true,
          contextMenu: true,
          keyboard: true,
          floatingBtn: false
        },
        defaultProvider: 'deepseek',
        defaultModel: 'deepseek-chat'
      };
      if (callback) callback(settings);
    });
  };

  /** 保存常规设置 */
  SWE.saveSettings = function (settings, callback) {
    var obj = {};
    obj[STORAGE_KEYS.SETTINGS] = settings;
    chrome.storage.sync.set(obj, callback || function () {});
  };

  /** 获取规则列表 */
  SWE.getRules = function (callback) {
    chrome.storage.local.get(STORAGE_KEYS.RULES, function (result) {
      var rules = result[STORAGE_KEYS.RULES] || [];
      if (callback) callback(rules);
    });
  };

  /** 保存规则列表 */
  SWE.saveRules = function (rules, callback) {
    var obj = {};
    obj[STORAGE_KEYS.RULES] = rules || [];
    chrome.storage.local.set(obj, callback || function () {});
  };

  /** 获取上次提取缓存 */
  SWE.getLastExtraction = function (callback) {
    chrome.storage.local.get(STORAGE_KEYS.LAST_EXTRACTION, function (result) {
      if (callback) callback(result[STORAGE_KEYS.LAST_EXTRACTION] || null);
    });
  };

  /** 保存上次提取缓存 */
  SWE.saveLastExtraction = function (data, callback) {
    var obj = {};
    obj[STORAGE_KEYS.LAST_EXTRACTION] = data;
    chrome.storage.local.set(obj, callback || function () {});
  };

  /** 判断是否有已配置的 API Key */
  SWE.hasAnyApiKey = async function () {
    for (var provider of ['deepseek', 'qwen']) {
      var key = STORAGE_KEYS['API_KEY_' + provider.toUpperCase()];
      if (!key) continue;
      var result = await chrome.storage.local.get(key);
      if (result[key]) return true;
    }
    return false;
  };
})();
