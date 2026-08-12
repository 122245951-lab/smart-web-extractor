/**
 * Service Worker — 智能网页信息提取器
 * 职责：消息路由、AI 调用中转、右键菜单、文件下载
 */

importScripts('../lib/utils.js');
importScripts('../lib/i18n.js');
importScripts('../lib/storage.js');
importScripts('../lib/ai-providers.js');
importScripts('../lib/zip.js');
importScripts('../lib/exporter.js');

var SWE = self.SWE;

var MESSAGE_TYPES = {
  EXTRACT_START: 'extract:start',
  EXTRACT_RESULT: 'extract:result',
  EXTRACT_ERROR: 'extract:error',
  EXTRACT_PROGRESS: 'extract:progress',
  AI_ANALYZE: 'ai:analyze',
  AI_STREAM: 'ai:stream',
  AI_STREAM_CHUNK: 'ai:stream:chunk',
  AI_STREAM_DONE: 'ai:stream:done',
  AI_TEST_CONNECTION: 'ai:test',
  EXPORT_FILE: 'export:file',
  IMAGES_FETCH: 'images:fetch',
  PANEL_TOGGLE: 'panel:toggle',
  SETTINGS_OPEN: 'open:settings'
};

async function initialize() {
  SWE.loadLang(function () { setupContextMenus(); });

  chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install') { requestHostPermissions(); }
  });

  chrome.runtime.onMessage.addListener(handleMessage);
}

function setupContextMenus() {
  chrome.contextMenus.removeAll(function () {
    chrome.contextMenus.create({ id: 'swe-extract-page', title: SWE.t('app.tagline'), contexts: ['page'] });
    chrome.contextMenus.create({ id: 'swe-extract-selection', title: SWE.t('btn.extract') + ' (Selection)', contexts: ['selection'] });
    chrome.contextMenus.onClicked.addListener(function (info, tab) {
      if (info.menuItemId === 'swe-extract-page') {
        chrome.tabs.sendMessage(tab.id, { type: 'extract:trigger', payload: { mode: 'fullPage' } });
      } else if (info.menuItemId === 'swe-extract-selection') {
        chrome.tabs.sendMessage(tab.id, { type: 'extract:selection' });
      }
    });
  });
}

function requestHostPermissions() {
  if (chrome.permissions) {
    chrome.permissions.contains({ origins: ['<all_urls>'] }, function (hasPermission) {
      if (!hasPermission) chrome.permissions.request({ origins: ['<all_urls>'] });
    });
  }
}

function handleMessage(request, sender, sendResponse) {
  switch (request.type) {
    case 'ai:analyze': handleAIAnalyze(request.payload, sendResponse); return true;
    case 'ai:test': handleAITest(request.payload, sendResponse); return true;
    case 'export:file': handleExportFile(request.payload, sendResponse); return true;
    case 'images:fetch': handleImagesFetch(request.payload, sendResponse); return true;
    case 'open:settings': openSettingsPage(); sendResponse({ success: true }); return true;
    default: sendResponse({ success: false, error: 'Unknown type: ' + request.type });
  }
}

async function handleAIAnalyze(payload, sendResponse) {
  try {
    var result = await SWE.callAI({
      provider: payload.provider, apiKey: payload.apiKey, model: payload.model,
      messages: payload.messages, temperature: payload.temperature, maxTokens: payload.maxTokens
    });
    sendResponse({ success: true, data: result });
  } catch (err) {
    sendResponse({ success: false, error: err.code || 'UNKNOWN', message: err.message });
  }
}

async function handleAITest(payload, sendResponse) {
  var result = await SWE.testConnection(payload.provider, payload.apiKey);
  sendResponse(result);
}

function handleExportFile(payload, sendResponse) {
  chrome.downloads.download({ url: payload.url, filename: payload.filename, saveAs: false }, function (id) {
    sendResponse({ success: !chrome.runtime.lastError, error: chrome.runtime.lastError ? chrome.runtime.lastError.message : null });
  });
}

async function handleImagesFetch(payload, sendResponse) {
  if (!payload.images || payload.images.length === 0) {
    sendResponse({ success: false, error: 'No images' }); return;
  }
  var imageFiles = [];
  var failedCount = 0;
  for (var i = 0; i < payload.images.length; i++) {
    try {
      var resp = await fetch(payload.images[i], { mode: 'cors', credentials: 'omit' });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var blob = await resp.blob();
      var buf = await blob.arrayBuffer();
      var ext = (payload.images[i].split('.').pop() || 'jpg').split('?')[0];
      imageFiles.push({ name: String(i + 1) + '.' + ext, data: new Uint8Array(buf) });
    } catch (e) { failedCount++; }
  }
  if (imageFiles.length === 0) {
    sendResponse({ success: false, error: 'Failed to fetch any images' }); return;
  }
  try {
    var zipData = SWE.createZip(imageFiles);
    var blob = new Blob([zipData], { type: 'application/zip' });
    var url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: url, filename: payload.title + '_images.zip', saveAs: false
    }, function (id) {
      var msg = failedCount > 0 ? (failedCount + ' images skipped (CORS)') : null;
      sendResponse({ success: true, failedCount: failedCount, total: payload.images.length, warning: msg });
    });
  } catch (e) { sendResponse({ success: false, error: e.message }); }
}

function openSettingsPage() {
  var url = chrome.runtime.getURL('pages/settings/settings.html');
  chrome.tabs.query({ url: url }, function (tabs) {
    if (chrome.runtime.lastError) {
      console.error('[SWE] tabs.query error:', chrome.runtime.lastError.message);
      chrome.tabs.create({ url: url });
      return;
    }
    if (tabs && tabs.length > 0) chrome.tabs.update(tabs[0].id, { active: true });
    else chrome.tabs.create({ url: url });
  });
}

chrome.action.onClicked.addListener(function (tab) {
  try { chrome.tabs.sendMessage(tab.id, { type: 'panel:toggle' }); } catch (e) {}
});

initialize();

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === 'ai-stream') {
    var aborted = false;

    port.onDisconnect.addListener(function () {
      aborted = true;
    });

    port.onMessage.addListener(async function (msg) {
      if (msg.type === 'ai:stream' && msg.payload) {
        var p = msg.payload;
        var key = p.apiKey || await SWE.getApiKey(p.provider);
        if (!key) { port.postMessage({ type: 'ai:stream:done', error: 'No API Key' }); return; }
        SWE.callAIStream(
          { provider: p.provider, apiKey: key, model: p.model, messages: p.messages, temperature: p.temperature },
          function (c) {
            if (aborted) return;
            try { port.postMessage({ type: 'ai:stream:chunk', chunk: c }); } catch (e) {}
          },
          function () {
            if (aborted) return;
            try { port.postMessage({ type: 'ai:stream:done' }); } catch (e) {}
          },
          function (e) {
            if (aborted) return;
            try { port.postMessage({ type: 'ai:stream:done', error: e.message }); } catch (e2) {}
          }
        );
      }
    });
  }
});
