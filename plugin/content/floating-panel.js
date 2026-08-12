;(function () {
  'use strict';
  var global = typeof window !== 'undefined' ? window : self;
  global.SWE = global.SWE || {};
  var SWE = global.SWE;

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
    return '<div id="swe-edge-tab" class="swe-edge-tab" title="' + t('edge.tab.title') + '"><span class="swe-edge-tab__icon">&#9889;</span><span class="swe-edge-tab__text">' + t('edge.tab.text') + '</span></div>' +
      '<div id="swe-panel"><div class="swe-panel-shadow"></div><div class="swe-panel-body">' +
      '<div class="swe-header"><div style="display:flex;align-items:center;gap:10px"><span style="width:30px;height:30px;background:linear-gradient(135deg,var(--color-primary),var(--color-primary-hover));border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;flex-shrink:0;box-shadow:0 2px 8px rgba(79,70,229,0.2)">&#10024;</span><div><h2 class="swe-header__title" data-i18n="panel.header.title">' + t('panel.header.title') + '</h2><p style="font-size:9px;color:var(--color-text-disabled);margin-top:1px">AI Browser Companion</p></div></div>' +
      '<button class="swe-header__btn" id="swe-btn-settings" title="' + t('panel.open.settings') + '">&#9881;</button>' +
      '<button class="swe-header__btn" id="swe-btn-close" title="' + t('panel.close') + '">&times;</button></div>' +
      this.getConfigHTML() +
      this.getTemplatesHTML() +
      '<button class="swe-extract-btn" id="swe-extract-btn" style="background:linear-gradient(135deg,var(--color-primary),var(--color-primary-hover));border-radius:8px">' + t('btn.extract') + '</button>' +
      this.getTabsHTML() +
      '<div class="swe-content" id="swe-content-area">' +
      this.getSummaryPanelHTML() +
      this.getImagesPanelHTML() +
      this.getTablesPanelHTML() +
      this.getQAPanelHTML() +
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
    return '<div class="swe-templates" id="swe-templates" hidden>' +
      '<button class="swe-template swe-template--active" data-template="brief">' + t('template.brief') + '</button>' +
      '<button class="swe-template" data-template="structured">' + t('template.structured') + '</button>' +
      '<button class="swe-template" data-template="mindmap">' + t('template.mindmap') + '</button>' +
      '<button class="swe-template" data-template="custom">' + t('template.custom') + '</button>' +
      '</div><div class="swe-templates" id="swe-custom-template-area" hidden>' +
      '<textarea id="swe-custom-prompt" class="swe-editor-textarea" rows="3" placeholder="在此填写你的智能抽取提示词。可用变量：{title} 标题、{url} 链接、{content} 正文、{images} 图片、{tables} 表格、{lang} 语言。\n\n示例：请用 {lang} 总结以下内容，列出 3-5 个核心要点，每个要点不超过 20 字。\n标题：{title}\n正文：{content}"></textarea>' +
      '</div>';
  };

  FloatingPanel.prototype.getTabsHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div class="swe-tabs" id="swe-tabs" hidden>' +
      '<button class="swe-tab swe-tab--active" data-panel="summary">' + t('tab.summary') + '</button>' +
      '<button class="swe-tab" data-panel="images">' + t('tab.images') + ' <span class="swe-badge" id="swe-badge-images">0</span></button>' +
      '<button class="swe-tab" data-panel="tables">' + t('tab.tables') + ' <span class="swe-badge" id="swe-badge-tables">0</span></button>' +
      '<button class="swe-tab" data-panel="qa">' + t('tab.qa') + '</button></div>';
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

  FloatingPanel.prototype.getQAPanelHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div id="swe-panel-qa" class="swe-panel-content" hidden>' +
      '<div class="swe-qa-hint">' + t('qa.hint') + '</div>' +
      '<div class="swe-chat" id="swe-chat">' +
      '<div class="swe-chat__header">' +
      '<span class="swe-chat__title">' + t('tab.qa') + '</span>' +
      '<button class="swe-chat__clear-btn" id="swe-chat-clear">' + t('qa.clear') + '</button></div>' +
      '<div class="swe-chat__messages" id="swe-chat-messages"></div>' +
      '<div class="swe-chat__input"><input type="text" id="swe-chat-input" placeholder="' + t('qa.placeholder') + '" />' +
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

    // 侧边标签点击切换
    root.querySelector('#swe-edge-tab').addEventListener('click', function () { self.toggle(); });

    // 关闭按钮
    root.querySelector('#swe-btn-close').addEventListener('click', function () { self.slideOut(); });

    // 设置按钮 —— 直接在面板内显示 API 配置卡片，绕过 checkConfigAndShow
    root.querySelector('#swe-btn-settings').addEventListener('click', function () {
      self.state = PanelState.CONFIGURING;
      self.panel.classList.add('swe-panel--open');
      self.tab.classList.add('swe-edge-tab--hidden');
      self.showConfig();
    });

    // 点击面板外部关闭
    document.addEventListener('click', function (e) {
      if (self.state === PanelState.VISIBLE && !e.target.closest('#swe-panel') && !e.target.closest('#swe-edge-tab')) {
        self.slideOut();
      }
    });

    // ESC 关闭面板 / 灯箱
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (self.state === PanelState.VISIBLE) { self.slideOut(); }
        self.closeImageLightbox();
      }
    });

    // 提取按钮
    root.querySelector('#swe-extract-btn').addEventListener('click', function () {
      self.startExtraction('fullPage');
    });

    // 模板切换
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

    // Tab 切换
    var tabs = root.querySelectorAll('.swe-tab');
    for (var ti = 0; ti < tabs.length; ti++) {
      tabs[ti].addEventListener('click', function () {
        var panelName = this.getAttribute('data-panel');
        self.switchTab(panelName);
      });
    }

    // 重新提取按钮
    root.querySelector('#swe-btn-reextract').addEventListener('click', function () {
      self.startExtraction('fullPage');
    });

    // 导出按钮
    root.querySelector('#swe-btn-export').addEventListener('click', function () {
      self.exportContent();
    });

    // AI 问答发送
    root.querySelector('#swe-chat-send').addEventListener('click', function () {
      self.sendChatMessage();
    });
    root.querySelector('#swe-chat-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); self.sendChatMessage(); }
    });

    // AI 问答清除
    var clearBtn = root.querySelector('#swe-chat-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        self.clearChat();
      });
    }

    // 配置测试与跳过
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
    } // close if(zipBtn)

  }; // close bindEvents

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
    if (configCard) {
      configCard.hidden = false;
      configCard.style.animation = 'none';
      // eslint-disable-next-line no-unused-expressions
      configCard.offsetHeight;
      configCard.style.animation = '';
    }
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
        }
        return;
      }
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
    };
    var prompt = SWE.getBuiltinPrompt(self.currentTemplate, vars);
    var systemPrompt = '你是一位专业的网页内容提炼助手。请用清晰、自然的段落和列表输出总结，避免使用 Markdown 标记（如 #、**、*）。输出应结构清晰、易于阅读，使用中文或用户内容语言。';
    var messages = [
      { role: 'system', content: systemPrompt },
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
    // 隐藏欢迎状态
    var welcome = document.getElementById('swe-welcome-state');
    if (welcome) welcome.hidden = true;

    // 隐藏配置卡片
    this.hideConfig();

    // 显示摘要内容
    var summaryEl = document.getElementById('swe-summary-content');
    if (summaryEl) {
      summaryEl.hidden = false;
      if (aiResult) {
        summaryEl.innerHTML = SWE.renderReadableHtml(aiResult);
      } else {
        summaryEl.innerHTML = '<div class="swe-readable">' +
          '<p>' + SWE.escapeHtml(data.content).substring(0, 500) + '...</p>' +
          '<p class="swe-readable-hint">' + SWE.t('state.summary_empty') + '</p></div>';
      }
    } // close if(summaryEl)

    // templates
    var templatesEl = document.getElementById('swe-templates');
    if (templatesEl) templatesEl.hidden = false;
    var tabsEl = document.getElementById('swe-tabs');
    if (tabsEl) tabsEl.hidden = false;

    // 更新徽标计数
    var imgBadge = document.getElementById('swe-badge-images');
    if (imgBadge) imgBadge.textContent = String(data.images ? data.images.length : 0);
    var tblBadge = document.getElementById('swe-badge-tables');
    if (tblBadge) tblBadge.textContent = String(data.tables ? data.tables.length : 0);

    // 渲染图片列表
    this.renderImages(data.images);
    // 渲染表格列表
    this.renderTables(data.tables);
    // 渲染编辑器（已移除：QA 面板不再有编辑器文本框）
    // var textarea = document.getElementById('swe-editor-textarea');
    // if (textarea) textarea.value = aiResult || data.content || '';

    // 显示底部操作栏
    var footer = document.getElementById('swe-footer');
    if (footer) footer.hidden = false;

    // 默认切换到摘要标签页
    this.switchTab('summary');
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
    }
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
      }
    }

    var filtered = images;
    if (self.imageFilter !== 'all') {
      filtered = images.filter(function (img) { return img.category === self.imageFilter; });
    }

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
        }
        var countEl = document.getElementById('swe-image-selected-count');
        if (countEl) countEl.textContent = SWE.tt('image.n_selected', {n: self.selectedImages.length});
      });
      items[k].addEventListener('dblclick', function () {
        var index = parseInt(this.getAttribute('data-index'));
        var img = filtered[index];
        if (img && img.src) self.openImageLightbox(img.src, img.alt || '');
      });
    }
    // stagger 入场动画
    for (var s = 0; s < items.length; s++) {
      items[s].style.animationDelay = (s * 0.04) + 's';
    }
    // Hide actions when no images
    if (!images || images.length === 0) {
      if (actionsBar) actionsBar.hidden = true;
    }
  };

  FloatingPanel.prototype.openImageLightbox = function (src, alt) {
    var self = this;
    var box = document.getElementById('swe-lightbox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'swe-lightbox';
      box.className = 'swe-lightbox';
      box.innerHTML = '<div class="swe-lightbox__backdrop"></div>' +
        '<button class="swe-lightbox__close">&times;</button>' +
        '<img class="swe-lightbox__img" alt="" />';
      document.body.appendChild(box);
      box.querySelector('.swe-lightbox__backdrop').addEventListener('click', function () { self.closeImageLightbox(); });
      box.querySelector('.swe-lightbox__close').addEventListener('click', function () { self.closeImageLightbox(); });
    }
    var img = box.querySelector('.swe-lightbox__img');
    img.src = src;
    img.alt = alt || '';
    box.classList.add('swe-lightbox--open');
  };

  FloatingPanel.prototype.closeImageLightbox = function () {
    var box = document.getElementById('swe-lightbox');
    if (box) box.classList.remove('swe-lightbox--open');
  };

  FloatingPanel.prototype.renderTables = function (tables) {
    var list = document.getElementById('swe-table-list');
    var empty = document.getElementById('swe-tables-empty');
    if (!list) return;

    if (!tables || tables.length === 0) {
      list.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    var displayData = SWE.TableParser.getDisplayData(tables);
    var tr = SWE.t.bind(SWE);
    list.innerHTML = displayData.map(function (tbl, i) {
      var headerHtml = tbl.headers && tbl.headers.length > 0 ?
        '<thead><tr><th>' + tbl.headers.map(SWE.escapeHtml).join('</th><th>') + '</th></tr></thead>' : '';
      var rowHtml = tbl.sampleData.map(function (row) {
        return '<tr><td>' + row.map(SWE.escapeHtml).join('</td><td>') + '</td></tr>';
      }).join('');
      var bodyHtml = rowHtml ? '<tbody>' + rowHtml + '</tbody>' : '';
      return '<div class="swe-table-card">' +
        '<div class="swe-table-card__header">' +
        '<div>' +
        '<div class="swe-table-card__title">' + SWE.escapeHtml(tbl.caption) + '</div>' +
        '<div class="swe-table-card__info">' + tbl.rowCount + ' rows x ' + tbl.colCount + ' cols</div>' +
        '</div>' +
        '<div class="swe-table-card__actions">' +
        '<button class="swe-btn swe-btn--ghost swe-btn--sm" data-table-index="' + i + '" data-action="copy" title="' + SWE.escapeHtml(tr('common.copy')) + '">' + tr('common.copy') + '</button>' +
        '<button class="swe-btn swe-btn--ghost swe-btn--sm" data-table-index="' + i + '" data-action="csv" title="CSV">CSV</button>' +
        '</div>' +
        '</div>' +
        '<div class="swe-table-wrap"><table>' + headerHtml + bodyHtml + '</table></div>' +
        '</div>';
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

    // 复制表格内容到剪贴板
    var copyBtns = list.querySelectorAll('[data-action="copy"]');
    for (var k = 0; k < copyBtns.length; k++) {
      copyBtns[k].addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-table-index'));
        var tableData = tables[idx];
        if (!tableData) return;
        var csv = SWE.TableParser.tableToCsv(tableData);
        var self = this;
        self.textContent = SWE.t('common.copied');
        self.classList.add('swe-btn--copied');
        setTimeout(function () {
          self.textContent = SWE.t('common.copy');
          self.classList.remove('swe-btn--copied');
        }, 1500);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(csv).then(function () {
            SWE.showToast(SWE.t('toast.copied'), 'success');
          }).catch(function () {
            fallbackCopy(csv);
          });
        } else {
          fallbackCopy(csv);
        }
      });
    }

    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        SWE.showToast(SWE.t('toast.copied'), 'success');
      } catch (e) {
        SWE.showToast(SWE.t('toast.error'), 'error');
      }
      document.body.removeChild(ta);
    }

    // stagger 入场动画
    var cards = list.querySelectorAll('.swe-table-card');
    for (var c = 0; c < cards.length; c++) {
      cards[c].style.animationDelay = (c * 0.06) + 's';
    }
  };

  FloatingPanel.prototype.switchTab = function (panelName) {
    var tabs = this.root.querySelectorAll('.swe-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('swe-tab--active', tabs[i].getAttribute('data-panel') === panelName);
    }
    var panels = this.root.querySelectorAll('.swe-panel-content');
    for (var j = 0; j < panels.length; j++) {
      var isTarget = panels[j].id === 'swe-panel-' + panelName;
      panels[j].hidden = !isTarget;
      if (isTarget) {
        // 强制重绘以重新触发动画
        panels[j].style.animation = 'none';
        // eslint-disable-next-line no-unused-expressions
        panels[j].offsetHeight;
        panels[j].style.animation = '';
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

  FloatingPanel.prototype.sendChatMessage = function () {
    var input = document.getElementById('swe-chat-input');
    var messagesDiv = document.getElementById('swe-chat-messages');
    if (!input || !messagesDiv || !input.value.trim()) return;

    var userMsg = input.value.trim();
    input.value = '';

    // 用户消息气泡
    var userBubble = document.createElement('div');
    userBubble.className = 'swe-chat__bubble swe-chat__bubble--user';
    userBubble.textContent = userMsg;
    userBubble.style.animation = 'swe-bubble-in 0.25s ease';
    messagesDiv.appendChild(userBubble);

    // RAG 上下文：纳入正文、表格、图片，覆盖当前页面全部内容
    var self = this;
    var pageTitle = self.extractedData && self.extractedData.title ? self.extractedData.title : document.title;
    var pageUrl = window.location.href;
    var pageContent = self.extractedData && self.extractedData.content ? self.extractedData.content : '';

    var ragParts = [];
    ragParts.push('标题：' + (pageTitle || '未知'));
    ragParts.push('URL：' + pageUrl);

    // 正文内容
    var textContent = pageContent || self.currentSummary || '';
    ragParts.push('\n--- 正文内容 ---\n' + (textContent || '暂无内容'));

    // 表格数据
    if (self.tables && self.tables.length > 0) {
      var tablesSummary = SWE.TableParser.tablesToSummary(self.tables);
      if (tablesSummary) {
        ragParts.push('\n--- 页面表格 ---\n' + tablesSummary);
      }
    }

    // 图片描述
    if (self.images && self.images.length > 0) {
      var imagesSummary = SWE.ImageCollector.imagesToTextSummary(self.images);
      if (imagesSummary) {
        ragParts.push('\n--- 页面图片 ---\n' + imagesSummary);
      }
    }

    var ragContext = ragParts.join('\n');

    // 限制上下文长度，避免 413 Payload Too Large
    var MAX_CONTEXT = 12000;
    if (ragContext.length > MAX_CONTEXT) {
      var reserved = MAX_CONTEXT - 200;
      ragContext = ragParts.slice(0, 1).join('\n') + '\n' + ragContext.substring(0, reserved) + '\n\n[内容已截断...]';
    }

    var systemPrompt = '你是一个基于网页内容的智能问答助手。你只能根据以下网页内容来回答问题，这些内容包含了页面正文、表格和图片描述。如果内容中没有相关信息，请明确告知用户。\n\n网页内容如下：\n\n' + (ragContext || '暂无网页内容');
    var messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMsg }
    ];

    var aiBubble = document.createElement('div');
    aiBubble.className = 'swe-chat__bubble swe-chat__bubble--ai';
    aiBubble.innerHTML = '<span class="swe-chat__typing">' + SWE.t('common.loading') + '</span>';
    messagesDiv.appendChild(aiBubble);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    self._chatStreamBuffer = '';
    self._chatTypedIndex = 0;
    if (self._chatTypingTimer) {
      clearInterval(self._chatTypingTimer);
      self._chatTypingTimer = null;
    }

    function flushTypedText() {
      if (self._chatTypedIndex < self._chatStreamBuffer.length) {
        var step = Math.min(3, self._chatStreamBuffer.length - self._chatTypedIndex);
        aiBubble.textContent = self._chatStreamBuffer.substring(0, self._chatTypedIndex + step);
        self._chatTypedIndex += step;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        return true;
      }
      return false;
    }

    function stopTypingTimer() {
      if (self._chatTypingTimer) {
        clearInterval(self._chatTypingTimer);
        self._chatTypingTimer = null;
      }
    }

    SWE.getSettings(function (settings) {
      var provider = (settings && settings.defaultProvider) || 'deepseek';
      SWE.callAIStream(
        { provider: provider, messages: messages },
        function (chunk) {
          var typingEl = aiBubble.querySelector('.swe-chat__typing');
          if (typingEl) typingEl.remove();
          self._chatStreamBuffer += chunk;
          if (!self._chatTypingTimer) {
            self._chatTypingTimer = setInterval(function () {
              if (!flushTypedText()) {
                stopTypingTimer();
              }
            }, 22);
          }
        },
        function () {
          stopTypingTimer();
          flushTypedText();
          // 确保最终内容完整
          aiBubble.textContent = self._chatStreamBuffer;
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        },
        function (err) {
          stopTypingTimer();
          var typingEl = aiBubble.querySelector('.swe-chat__typing');
          if (typingEl) typingEl.remove();
          if (self._chatStreamBuffer) {
            aiBubble.textContent = self._chatStreamBuffer;
          } else {
            var errorText = (err && err.message) || SWE.t('error.unknown');
            aiBubble.textContent = errorText;
          }
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        });
    });
  };

  FloatingPanel.prototype.clearChat = function () {
    var messagesDiv = document.getElementById('swe-chat-messages');
    if (messagesDiv) {
      messagesDiv.innerHTML = '';
      SWE.showToast(SWE.t('qa.cleared'), 'success');
    }
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

