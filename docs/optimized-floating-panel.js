;(function () {
  'use strict';
  window.SWE = window.SWE || {};
  var SWE = window.SWE;

  var PanelState = {
    HIDDEN: 'hidden',
    VISIBLE: 'visible',
    EXTRACTING: 'extracting',
    RESULT: 'result',
    EDITING: 'editing',
    CONFIGURING: 'configuring'
  };

  function FloatingPanel() {
    this.state = PanelState.HIDDEN;
    this.extractedData = null;
    this.aiResult = '';
    this.currentTemplate = 'brief';
    this.images = [];
    this.tables = [];
    this.imageFilter = 'all';
    this.selectedImages = [];
    this.editorMode = 'source';
    this.currentSummary = '';
    this.root = null;
    this.panel = null;
    this.tab = null;

  }
  FloatingPanel.prototype.init = function () {
    if (document.getElementById('swe-root')) return;
    this.createDOM();
    this.bindEvents();
    this.loadState();
  };

  FloatingPanel.prototype.createDOM = function () {
    this.root = document.createElement('div');
    this.root.id = 'swe-root';
    this.root.innerHTML = this.getHTML();
    document.body.appendChild(this.root);
    this.panel = document.getElementById('swe-panel');
    this.tab = document.getElementById('swe-edge-tab');
    SWE.translateDom(this.root);
  };

  FloatingPanel.prototype.getHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div id="swe-edge-tab" class="swe-edge-tab" title="' + t('edge.tab.title') + '"><span class="swe-edge-icon">&#10024;</span><span class="swe-edge-label">AI</span><span class="swe-edge-arrow">&#8250;</span></div>' +
      '<div id="swe-panel"><div class="swe-panel-shadow"></div><div class="swe-panel-body">' +
      '<div class="swe-header"><div class="swe-header__brand"><span class="swe-header__brand-icon">&#10024;</span><div><h2 class="swe-header__title" data-i18n="panel.header.title">' + t('panel.header.title') + '</h2><p class="swe-header__subtitle">AI Browser Companion</p></div></div>' +
      '<button class="swe-header__btn" id="swe-btn-settings" title="' + t('panel.open.settings') + '">&#9881;</button>' +
      '<button class="swe-header__btn" id="swe-btn-close" title="' + t('panel.close') + '">&times;</button></div>' +
      this.getConfigHTML() +
      this.getTemplatesHTML() +
      '<button class="swe-extract-btn" style="background:linear-gradient(135deg,var(--color-primary),var(--color-primary-hover));border-radius:8px" id="swe-extract-btn">' + t('btn.extract') + '</button>' +
      this.getTabsHTML() +
      '<div class="swe-content" id="swe-content-area">' +
      this.getSummaryPanelHTML() +
      this.getImagesPanelHTML() +
      this.getTablesPanelHTML() +
      this.getEditPanelHTML() +
      '</div>' +
      this.getFooterHTML() +
      this.getProgressHTML() +
      '</div></div>';
  };

  FloatingPanel.prototype.getConfigHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div class="swe-config-card" id="swe-config-card" hidden>' +
      '<div class="swe-state__title" data-i18n="state.welcome_title">' + t('state.welcome_title') + '</div>' +
      '<div class="swe-state__desc" data-i18n="state.welcome_desc">' + t('state.welcome_desc') + '</div>' +
      '<div class="swe-state__desc" data-i18n="state.config_prompt">' + t('state.config_prompt') + '</div>' +
      '<label>' + t('state.api_provider') + '</label>' +
      '<select id="swe-config-provider"><option value="deepseek">DeepSeek</option><option value="qwen">' + t('settings.api_provider') + '</option></select>' +
      '<label>' + t('state.api_key') + '</label>' +
      '<input type="password" id="swe-config-apikey" placeholder="sk-..." />' +
      '<div class="swe-hint" data-i18n="state.encrypted_hint">' + t('state.encrypted_hint') + '</div>' +
      '<div class="swe-btn-group"><button class="swe-btn swe-btn--primary" id="swe-config-test">' + t('btn.test_connection') + '</button>' +
      '<button class="swe-btn swe-btn--ghost" id="swe-config-skip">' + t('btn.skip') + '</button></div></div>';
  };

    FloatingPanel.prototype.getTemplatesHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div class="swe-templates" id="swe-templates" hidden style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
      '<button class="swe-template swe-template--active" data-template="brief">' + t('template.brief') + '</button>' +
      '<button class="swe-template" data-template="structured">' + t('template.structured') + '</button>' +
      '<button class="swe-template" data-template="mindmap">' + t('template.mindmap') + '</button>' +
      '<button class="swe-template" data-template="custom">' + t('template.custom') + '</button>' +
      '</div><div class="swe-templates" id="swe-custom-template-area" hidden>' +
      '<textarea id="swe-custom-prompt" class="swe-editor-textarea" rows="2" placeholder="Custom prompt template, supports {content} {title} {url} {images} {tables} {lang}"></textarea>' +
      '</div>';

  FloatingPanel.prototype.getTabsHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div class="swe-tabs" id="swe-tabs" hidden>' +
      '<button class="swe-tab swe-tab--active" data-panel="summary">' + t('tab.summary') + '</button>' +
      '<button class="swe-tab" data-panel="images">' + t('tab.images') + ' <span class="swe-badge" id="swe-badge-images">0</span></button>' +
      '<button class="swe-tab" data-panel="tables">' + t('tab.tables') + ' <span class="swe-badge" id="swe-badge-tables">0</span></button>' +
      '<button class="swe-tab" data-panel="edit">' + t('tab.edit') + '</button></div>';
  }
  };

  FloatingPanel.prototype.getSummaryPanelHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div id="swe-panel-summary" class="swe-panel-content">' +
      '<div class="swe-state" id="swe-welcome-state">' +
      '<div class="swe-state__title">' + t('state.welcome_title') + '</div>' +
      '<div class="swe-state__desc">' + t('state.welcome_desc') + '</div>' +
      '<div class="swe-state__desc">' + t('state.extract_ready') + '</div>' +
      '</div><div class="swe-summary markdown-body" id="swe-summary-content" hidden></div></div>';
  };

  FloatingPanel.prototype.getImagesPanelHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div id="swe-panel-images" class="swe-panel-content" hidden>' +
      '<div class="swe-image-filter" id="swe-image-filter"></div>' +
      '<div class="swe-image-grid" id="swe-image-grid"></div>' +
      '<div class="swe-image-actions" id="swe-image-actions" hidden>' +
      '<button class="swe-btn swe-btn--primary swe-btn--sm" id="swe-btn-download-zip">' + t('btn.export_zip') + '</button>' +
      '<span class="swe-hint" id="swe-image-selected-count">' + SWE.tt('image.n_selected', {n: 0}) + '</span></div>' +
      '<div class="swe-empty-state" id="swe-images-empty" hidden>' +
      '<div class="swe-empty-state__icon">&#128247;</div>' +
      '<div class="swe-empty-state__text">' + t('state.no_images') + '</div></div></div>';
  };

  FloatingPanel.prototype.getTablesPanelHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div id="swe-panel-tables" class="swe-panel-content" hidden>' +
      '<div class="swe-table-list" id="swe-table-list"></div>' +
      '<div class="swe-empty-state" id="swe-tables-empty" hidden>' +
      '<div class="swe-empty-state__icon">&#128202;</div>' +
      '<div class="swe-empty-state__text">' + t('state.no_tables') + '</div></div></div>';
  };

  FloatingPanel.prototype.getEditPanelHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div id="swe-panel-edit" class="swe-panel-content" hidden>' +
      '<div class="swe-editor-mode-switch">' +
      '<button class="swe-editor-mode-btn swe-editor-mode-btn--active" data-mode="source">' + t('edit.source') + '</button>' +
      '<button class="swe-editor-mode-btn" data-mode="preview">' + t('edit.preview') + '</button>' +
      '</div><div class="swe-editor-toolbar">' +
      '<button data-md="bold"><b>B</b></button>' +
      '<button data-md="italic"><i>I</i></button>' +
      '<button data-md="heading">H</button>' +
      '<button data-md="list">&#8226;</button>' +
      '<button data-md="quote">&#10077;</button></div>' +
      '<textarea class="swe-editor-textarea" id="swe-editor-textarea" placeholder="' + t('edit.placeholder') + '"></textarea>' +
      '<div class="swe-chat" id="swe-chat"><div class="swe-chat__messages" id="swe-chat-messages"></div>' +
      '<div class="swe-chat__input"><input type="text" id="swe-chat-input" placeholder="' + t('edit.placeholder') + '" />' +
      '<button id="swe-chat-send">' + t('btn.send') + '</button></div></div></div>';
  };

  FloatingPanel.prototype.getFooterHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div class="swe-footer" id="swe-footer" hidden>' +
      '<button class="swe-btn swe-btn--ghost swe-btn--sm" id="swe-btn-reextract">' + t('btn.reextract') + '</button>' +
      '<div class="swe-export-group">' +
      '<label class="swe-export-check"><input type="checkbox" id="export-txt" checked> ' + t('label.txt') + '</label>' +
      '<label class="swe-export-check"><input type="checkbox" id="export-md" checked> ' + t('label.md') + '</label>' +
      '<label class="swe-export-check"><input type="checkbox" id="export-word"> ' + t('label.word') + '</label>' +
      '<button class="swe-btn swe-btn--primary swe-btn--sm" id="swe-btn-export">' + t('btn.export') + '</button>' +
      '</div></div>';
  };

  FloatingPanel.prototype.getProgressHTML = function () {
    return '<div class="swe-progress" id="swe-progress" hidden>' +
      '<div class="swe-progress__bar"></div>' +
      '<span class="swe-progress__text" id="swe-progress-text"></span></div>';
  };

  FloatingPanel.prototype.bindEvents = function () {
    var self = this;
    var root = this.root;

    // 鏉堣閮ㄩ弽鍥╊劮閻愮懓鍤?
    root.querySelector('#swe-edge-tab').addEventListener('click', function () { self.toggle(); });

    // 闂堛垺婢橀崗鎶芥４
    root.querySelector('#swe-btn-close').addEventListener('click', function () { self.slideOut(); });

    // 鐠佸墽鐤嗛幐澶愭尦
    root.querySelector('#swe-btn-settings').addEventListener('click', function () {
      chrome.runtime.sendMessage({ type: 'open:settings' });
    });

    // 閻愮懓鍤棃銏℃緲婢舵牕鍙ч梻?
    document.addEventListener('click', function (e) {
      if (self.state === PanelState.VISIBLE && !e.target.closest('#swe-panel') && !e.target.closest('#swe-edge-tab')) {
        self.slideOut();
      }
    });

    // ESC 閸忔娊妫?
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && self.state === PanelState.VISIBLE) { self.slideOut(); }
    });

    // 閹绘劕褰囬幐澶愭尦
    root.querySelector('#swe-extract-btn').addEventListener('click', function () {
      self.startExtraction('fullPage');
    });

    // 濡剝婢橀崚鍥ㄥ床
    var templates = root.querySelectorAll('.swe-template');
    for (var i = 0; i < templates.length; i++) {
      templates[i].addEventListener('click', function () {
        var prev = root.querySelector('.swe-template--active');
        if (prev) prev.classList.remove('swe-template--active');
        this.classList.add('swe-template--active');
        self.currentTemplate = this.getAttribute('data-template') || 'brief';
        self.showCustomTemplate();
      });
    }

    // Tab 閸掑洦宕?
    var tabs = root.querySelectorAll('.swe-tab');
    for (var ti = 0; ti < tabs.length; ti++) {
      tabs[ti].addEventListener('click', function () {
        var panelName = this.getAttribute('data-panel');
        self.switchTab(panelName);
      });
    }

    // 闁插秵鏌婇幓鎰絿
    root.querySelector('#swe-btn-reextract').addEventListener('click', function () {
      self.startExtraction('fullPage');
    });

    // 鐎电厧鍤?
    root.querySelector('#swe-btn-export').addEventListener('click', function () {
      self.exportContent();
    });

    // 缂傛牞绶Ο鈥崇础閸掑洦宕?
    var modeBtns = root.querySelectorAll('.swe-editor-mode-btn');
    for (var mbi = 0; mbi < modeBtns.length; mbi++) {
      modeBtns[mbi].addEventListener('click', function () {
        var prev = root.querySelector('.swe-editor-mode-btn--active');
        if (prev) prev.classList.remove('swe-editor-mode-btn--active');
        this.classList.add('swe-editor-mode-btn--active');
        self.editorMode = this.getAttribute('data-mode');
        self.updateEditorView();
      });
    }

    // 缂傛牞绶崳銊ヤ紣閸忛攱鐖?
    var editorBtns = root.querySelectorAll('.swe-editor-toolbar button');
    for (var ebi = 0; ebi < editorBtns.length; ebi++) {
      editorBtns[ebi].addEventListener('click', function () {
        var action = this.getAttribute('data-md');
        var textarea = document.getElementById('swe-editor-textarea');
        if (!textarea) return;
        var formatters = {
          bold: { before: '**', after: '**', placeholder: 'bold text' },
          italic: { before: '*', after: '*', placeholder: 'italic text' },
          heading: { before: '\n## ', after: '', placeholder: 'heading' },
          list: { before: '\n- ', after: '', placeholder: 'list item' },
          quote: { before: '\n> ', after: '', placeholder: 'quote' }
  }
        var fmt = formatters[action];
        if (fmt) SWE.insertMarkdownSyntax(textarea, null, fmt);
      });
    }

    // AI 鐎电鐦介崣鎴︹偓?
    root.querySelector('#swe-chat-send').addEventListener('click', function () {
      self.sendChatMessage();
    });
    root.querySelector('#swe-chat-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); self.sendChatMessage(); }
    });

    // 闁板秶鐤嗛惄绋垮彠
    var testBtn = root.querySelector('#swe-config-test');
    if (testBtn) {
      testBtn.addEventListener('click', function () { self.testConnection(); });
    }
    var skipBtn = root.querySelector('#swe-config-skip');
    if (skipBtn) {
      skipBtn.addEventListener('click', function () { self.hideConfig(); });
    }
    // Download ZIP button
    var zipBtn = root.querySelector('#swe-btn-download-zip');
    if (zipBtn) {
      zipBtn.addEventListener('click', function () {
        var selected = self.selectedImages;
        if (!selected || selected.length === 0) {
          SWE.showToast('Please select images first', 'info');
          return;
        }
        SWE.downloadZip(selected, self.extractedData ? self.extractedData.title : 'images');
      });

  };

  FloatingPanel.prototype.toggle = function () {
    if (this.state === PanelState.HIDDEN) {
      this.slideIn();
    } else {
      this.slideOut();
  
    }
};

  FloatingPanel.prototype.slideIn = function () {
    this.state = PanelState.VISIBLE;
    this.panel.classList.add('swe-panel--open');
    this.tab.classList.add('swe-edge-tab--hidden');
    this.checkConfigAndShow();
  };

  FloatingPanel.prototype.slideOut = function () {
    this.state = PanelState.HIDDEN;
    this.panel.classList.remove('swe-panel--open');
    this.tab.classList.remove('swe-edge-tab--hidden');
  };

  FloatingPanel.prototype.checkConfigAndShow = function () {
    var self = this;
    SWE.hasAnyApiKey().then(function (hasKey) {
      if (!hasKey) {
        self.showConfig();
      } else {
        self.hideConfig();
      }
    });
  };

  FloatingPanel.prototype.showConfig = function () {
    this.state = PanelState.CONFIGURING;
    var configCard = document.getElementById('swe-config-card');
    if (configCard) configCard.hidden = false;
  };

  FloatingPanel.prototype.hideConfig = function () {
    this.state = PanelState.VISIBLE;
    var configCard = document.getElementById('swe-config-card');
    if (configCard) configCard.hidden = true;
  };

  FloatingPanel.prototype.testConnection = function () {
    var self = this;
    var provider = document.getElementById('swe-config-provider').value;
    var apiKey = document.getElementById('swe-config-apikey').value;
    if (!apiKey) { SWE.showToast('Please enter API Key', 'error'); return; }
    SWE.testConnection(provider, apiKey).then(function (result) {
      if (result.success) {
        SWE.saveApiKey(provider, apiKey).then(function () {
          SWE.showToast(result.message, 'success');
          self.hideConfig();
        });
      } else {
        SWE.showToast(result.message, 'error');
      }
    });
  };

  FloatingPanel.prototype.startExtraction = function (mode) {
    var self = this;
    if (this.state === PanelState.EXTRACTING) return;

    this.state = PanelState.EXTRACTING;
    this.showProgress(SWE.t('progress.extracting'));

    var extractBtn = document.getElementById('swe-extract-btn');
    if (extractBtn) { extractBtn.disabled = true; extractBtn.innerHTML = '<span class="swe-spinner"></span> ' + SWE.t('common.loading'); }

    SWE.runExtraction(mode || 'fullPage', function (step) {
      switch (step) {
        case 'extracting': self.showProgress(SWE.t('progress.extracting')); break;
        case 'filtering': self.showProgress(SWE.t('progress.filtering')); break;
        case 'collecting_images': self.showProgress(SWE.t('progress.collecting_images')); break;
        case 'parsing_tables': self.showProgress(SWE.t('progress.parsing_tables')); break;
        case 'done': self.showProgress(SWE.t('progress.ai_connecting')); break;
        case 'error': self.hideProgress(); break;
        }
    }, function (result, err) {
      if (err) {
        self.state = PanelState.VISIBLE;
        self.hideProgress();
        if (extractBtn) { extractBtn.disabled = false; extractBtn.innerHTML = SWE.t('btn.extract'); }
        if (err === 'NO_CONTENT') {
          SWE.showToast(SWE.t('state.no_content'), 'info');
        } else {
          SWE.showToast(SWE.t('error.unknown'), 'error');
        return;
      self.extractedData = result;
      self.images = result.images || [];
      self.tables = result.tables || [];
      self.showProgress(SWE.t('progress.ai_analyzing'));
      self.callAI(result).then(function (aiResult) {
        self.aiResult = aiResult || '';
        self.currentSummary = aiResult || '';
        self.state = PanelState.RESULT;
        self.showResult(result, aiResult);
        self.hideProgress();
        if (extractBtn) { extractBtn.disabled = false; extractBtn.innerHTML = SWE.t('btn.extract'); }
                SWE.saveLastExtraction({ data: result, aiResult: aiResult });
    SWE.showToast(SWE.t('toast.extracted'), 'success');
      }).catch(function (error) {
        self.state = PanelState.RESULT;
        self.hideProgress();
        if (extractBtn) { extractBtn.disabled = false; extractBtn.innerHTML = SWE.t('btn.extract'); }
        self.showResult(result, '');
        SWE.showToast(error.message || SWE.t('error.unknown'), 'error');
      });
    });
  }
  }
  };

  FloatingPanel.prototype.callAI = function (data) {
    var self = this;
    var imagesSummary = SWE.ImageCollector.imagesToTextSummary(data.images);
    var tablesSummary = SWE.TableParser.tablesToSummary(data.tables);
    var vars = {
      title: data.title || '',
      url: window.location.href,
      content: data.content || '',
      images: imagesSummary,
      tables: tablesSummary
  }
    };
    var prompt = SWE.getBuiltinPrompt(self.currentTemplate, vars);
    var messages = [
      { role: 'system', content: 'You are a professional web content summarizer. Output in the same language as the input content.' },
      { role: 'user', content: prompt }
    ];
    return new Promise(function (resolve, reject) {
      SWE.getSettings(function (settings) {
        var provider = (settings && settings.defaultProvider) || 'deepseek';
        SWE.callAI({ provider: provider, messages: messages })
          .then(resolve)
          .catch(reject);
      });
    });
  };

  FloatingPanel.prototype.showResult = function (data, aiResult) {
    // 闂呮劘妫?welcome state
    var welcome = document.getElementById('swe-welcome-state');
    if (welcome) welcome.hidden = true;

    // 閺勫墽銇氶幗妯款洣
    var summaryEl = document.getElementById('swe-summary-content');
    if (summaryEl) {
      summaryEl.hidden = false;
      if (aiResult) {
        summaryEl.innerHTML = SWE.markdownToHtml(aiResult);
      } else {
        summaryEl.innerHTML = '<p>' + SWE.escapeHtml(data.content).substring(0, 500) + '...</p>' +
          '<p><em>AI summary unavailable. Raw content shown.</em></p>';

    // 閺勫墽銇氬Ο鈩冩緲閸滃本鐖ｇ粵?
    var templatesEl = document.getElementById('swe-templates');
    if (templatesEl) templatesEl.hidden = false;
    var tabsEl = document.getElementById('swe-tabs');
    if (tabsEl) tabsEl.hidden = false;

    // 閺囧瓨鏌?badge
    var imgBadge = document.getElementById('swe-badge-images');
    if (imgBadge) imgBadge.textContent = String(data.images ? data.images.length : 0);
    var tblBadge = document.getElementById('swe-badge-tables');
    if (tblBadge) tblBadge.textContent = String(data.tables ? data.tables.length : 0);

    // 閺勫墽銇氶崶鍓у
    this.renderImages(data.images);
    // 閺勫墽銇氱悰銊︾壐
    this.renderTables(data.tables);
    // 閺勫墽銇氱紓鏍帆閸?
    var textarea = document.getElementById('swe-editor-textarea');
    if (textarea) textarea.value = aiResult || data.content || '';

    // 閺勫墽銇?footer
    var footer = document.getElementById('swe-footer');
    if (footer) footer.hidden = false;

    // 鐠哄疇娴嗛崚鐗堟喅鐟?tab
    this.switchTab('summary');
  }
  }
  };

    
  FloatingPanel.prototype.showCustomTemplate = function () {
    var area = document.getElementById('swe-custom-template-area');
    if (this.currentTemplate === 'custom') {
      if (area) area.hidden = false;
    } else {
      if (area) area.hidden = true;
  }
  };

FloatingPanel.prototype.renderImages = function (images) {
    var self = this;
    var grid = document.getElementById('swe-image-grid');
    var empty = document.getElementById('swe-images-empty');
    var filterBar = document.getElementById('swe-image-filter');
    if (!grid) return;

    if (!images || images.length === 0) {
      grid.innerHTML = '';
      if (empty) empty.hidden = false;
      var ab = document.getElementById('swe-image-actions');
      if (ab) ab.hidden = true;
      return;
    if (empty) empty.hidden = true;
    var actionsBar = document.getElementById('swe-image-actions');
    if (actionsBar) actionsBar.hidden = false;
    this.images = images;

    var filters = ['all', 'photo', 'chart', 'logo', 'other'];
    var t = SWE.t.bind(SWE);
    var filterNames = { all: t('image.filter_all'), photo: t('image.filter_photo'), chart: t('image.filter_chart'), logo: t('image.filter_logo'), other: t('image.filter_other') };
    if (filterBar) {
      filterBar.innerHTML = filters.map(function (f) {
        return '<button class="swe-image-filter-btn ' + (f === self.imageFilter ? 'swe-image-filter-btn--active' : '') + '" data-filter="' + f + '">' + (filterNames[f] || f) + '</button>';
      }).join('');
      var filterBtns = filterBar.querySelectorAll('.swe-image-filter-btn');
      for (var j = 0; j < filterBtns.length; j++) {
        filterBtns[j].addEventListener('click', function () {
          var prev = filterBar.querySelector('.swe-image-filter-btn--active');
          if (prev) prev.classList.remove('swe-image-filter-btn--active');
          this.classList.add('swe-image-filter-btn--active');
          self.imageFilter = this.getAttribute('data-filter');
          self.renderImages(self.images);
        });

    var filtered = images;
    if (this.imageFilter !== 'all') {
      filtered = images.filter(function (img) { return img.category === self.imageFilter; });

    grid.innerHTML = filtered.map(function (img, idx) {
      var ws = img.width || '?';
      var hs = img.height || '?';
      var selected = self.selectedImages.indexOf(img) !== -1 ? ' swe-image-item--selected' : '';
      return '<div class="swe-image-item' + selected + '" data-index="' + idx + '">' +
        '<img src="' + SWE.escapeHtml(img.src) + '" alt="' + SWE.escapeHtml(img.alt || '') + '" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentElement.style.display=\'none\'" />' +
        '<div class="swe-image-check">&#10003;</div>' +
        '<div class="swe-image-label">' + (img.category || '') + ' ' + ws + 'x' + hs + '</div></div>';
    }).join('');

    var items = grid.querySelectorAll('.swe-image-item');
    for (var k = 0; k < items.length; k++) {
      items[k].addEventListener('click', function () {
        var index = parseInt(this.getAttribute('data-index'));
        var img = filtered[index];
        if (!img) return;
        var selIdx = self.selectedImages.indexOf(img);
        if (selIdx === -1) {
          self.selectedImages.push(img);
          this.classList.add('swe-image-item--selected');
        } else {
          self.selectedImages.splice(selIdx, 1);
          this.classList.remove('swe-image-item--selected');
        var countEl = document.getElementById('swe-image-selected-count');
        if (countEl) countEl.textContent = SWE.tt('image.n_selected', {n: self.selectedImages.length});
      });
    // Hide actions when no images
    if (!images || images.length === 0) {
      if (actionsBar) actionsBar.hidden = true;
  }
  }
  }
  }
  }
  }
  }
  };

    FloatingPanel.prototype.renderTables = function (tables) {
    var list = document.getElementById('swe-table-list');
    var empty = document.getElementById('swe-tables-empty');
    if (!list) return;

    if (!tables || tables.length === 0) {
      list.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    if (empty) empty.hidden = true;

    var displayData = SWE.TableParser.getDisplayData(tables);
    var tr = SWE.t.bind(SWE);
    list.innerHTML = displayData.map(function (tbl, i) {
      var headerHtml = tbl.headers && tbl.headers.length > 0 ?
        '<tr><th>' + tbl.headers.map(SWE.escapeHtml).join('</th><th>') + '</th></tr>' : '';
      var rowHtml = tbl.sampleData.map(function (row) {
        return '<tr><td>' + row.map(SWE.escapeHtml).join('</td><td>') + '</td></tr>';
      }).join('');
      return '<div class="swe-table-card"><div class="swe-table-card__title">' + SWE.escapeHtml(tbl.caption) + '</div>' +
        '<div class="swe-table-card__info">' + tbl.rowCount + ' rows x ' + tbl.colCount + ' cols</div>' +
        '<table>' + headerHtml + rowHtml + '</table>' +
        '<div class="swe-table-actions"><button class="swe-btn swe-btn--ghost swe-btn--sm" data-table-index="' + i + '" data-action="csv">' + tr('label.txt') + '</button></div></div>';
    }).join('');

    var csvBtns = list.querySelectorAll('[data-action="csv"]');
    for (var j = 0; j < csvBtns.length; j++) {
      csvBtns[j].addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-table-index'));
        var tableData = tables[idx];
        if (!tableData) return;
        var csv = SWE.TableParser.tableToCsv(tableData);
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        SWE.downloadFile(blob, SWE.generateExportFilename('table_' + (idx + 1), 'csv'));
      });
  }
  }
  };

  FloatingPanel.prototype.switchTab = function (panelName) {
    var tabs = this.root.querySelectorAll('.swe-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('swe-tab--active', tabs[i].getAttribute('data-panel') === panelName);
    var panels = this.root.querySelectorAll('.swe-panel-content');
    for (var j = 0; j < panels.length; j++) {
      panels[j].hidden = panels[j].id !== 'swe-panel-' + panelName;
  }
  }
  };

  FloatingPanel.prototype.showProgress = function (text) {
    var progress = document.getElementById('swe-progress');
    var textEl = document.getElementById('swe-progress-text');
    if (progress) progress.hidden = false;
    if (textEl) textEl.textContent = text;
  };

  FloatingPanel.prototype.hideProgress = function () {
    var progress = document.getElementById('swe-progress');
    if (progress) progress.hidden = true;
  };

  FloatingPanel.prototype.updateEditorView = function () {
    var textarea = document.getElementById('swe-editor-textarea');
    if (!textarea) return;
    if (this.editorMode === 'preview') {
      var previewEl = document.createElement('div');
      previewEl.className = 'swe-summary';
      previewEl.id = 'swe-editor-preview';
      previewEl.innerHTML = SWE.markdownToHtml(textarea.value);
      textarea.style.display = 'none';
      var parent = textarea.parentNode;
      if (!document.getElementById('swe-editor-preview')) {
        parent.insertBefore(previewEl, textarea.nextSibling);
      } else {
        document.getElementById('swe-editor-preview').innerHTML = SWE.markdownToHtml(textarea.value);
      }
    } else {
      textarea.style.display = '';
      var preview = document.getElementById('swe-editor-preview');
      if (preview) preview.remove();
    }
  };

  FloatingPanel.prototype.sendChatMessage = function () {
    var input = document.getElementById('swe-chat-input');
    var messagesDiv = document.getElementById('swe-chat-messages');
    if (!input || !messagesDiv || !input.value.trim()) return;

    var userMsg = input.value.trim();
    input.value = '';

    // 濞ｈ濮為悽銊﹀煕濞戝牊浼?
    var userBubble = document.createElement('div');
    userBubble.className = 'swe-chat__bubble swe-chat__bubble--user';
    userBubble.textContent = userMsg;
    messagesDiv.appendChild(userBubble);

    // AI 鐎电鐦?
    var self = this;
    var systemPrompt = 'You are an editing assistant. Modify the following summary based on the user instruction. Return only the modified content.';
    var messages = [
      { role: 'system', content: systemPrompt },
      { role: 'assistant', content: self.currentSummary || '' },
      { role: 'user', content: userMsg }
    ];

    var aiBubble = document.createElement('div');
    aiBubble.className = 'swe-chat__bubble swe-chat__bubble--ai';
    aiBubble.textContent = SWE.t('common.loading');
    messagesDiv.appendChild(aiBubble);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    SWE.getSettings(function (settings) {
      var provider = (settings && settings.defaultProvider) || 'deepseek';
      SWE.callAIStream(
        { provider: provider, messages: messages },
        function (chunk) {
          if (aiBubble.textContent === SWE.t('common.loading')) aiBubble.textContent = '';
          aiBubble.textContent += chunk;
          var textarea = document.getElementById('swe-editor-textarea');
          if (textarea) { textarea.value = aiBubble.textContent; self.currentSummary = aiBubble.textContent; }
          var summaryEl = document.getElementById('swe-summary-content');
          if (summaryEl) summaryEl.innerHTML = SWE.markdownToHtml(aiBubble.textContent);
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        },
        function () { messagesDiv.scrollTop = messagesDiv.scrollHeight; },
        function (err) {
          aiBubble.textContent = SWE.t('error.unknown');
        }
      );
    });
  };

  FloatingPanel.prototype.exportContent = function () {
    var checkTxt = document.getElementById('export-txt');
    var checkMd = document.getElementById('export-md');
    var checkWord = document.getElementById('export-word');
    var title = this.extractedData ? this.extractedData.title : 'export';
    var content = this.currentSummary || (this.extractedData ? this.extractedData.content : '');
    var url = window.location.href;
    var metadata = { title: title, url: url };

    if (checkTxt && checkTxt.checked) {
      var blob = SWE.exportTxt(content, metadata);
      SWE.downloadFile(blob, SWE.generateExportFilename(title, 'txt'));
    }
    if (checkMd && checkMd.checked) {
      var blob = SWE.exportMarkdown(content, metadata);
      SWE.downloadFile(blob, SWE.generateExportFilename(title, 'md'));
    }
    if (checkWord && checkWord.checked) {
      var blob = SWE.exportWord(content, metadata);
      SWE.downloadFile(blob, SWE.generateExportFilename(title, 'doc'));
    }
    SWE.showToast(SWE.t('toast.exported'), 'success');
  };

  FloatingPanel.prototype.loadState = function () {
    var self = this;
    SWE.getLastExtraction(function (cache) {
      if (cache) {
        self.extractedData = cache.data;
        self.aiResult = cache.aiResult || '';
        self.currentSummary = cache.aiResult || '';
        if (cache.data) {
          self.images = cache.data.images || [];
          self.tables = cache.data.tables || [];
      }
    }
    });
  };

  window.SWEFloatingPanel = FloatingPanel;
})();

