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

  /* ------------------------------------------------------------------
     Inline icon set (Claude / Lucide style, 24x24, stroke-based)
     ------------------------------------------------------------------ */
  var ICONS = {
    // Brand mark: 4-point sparkle, FILLED so it stays legible down to 16px.
    // Must match icons/icon128.png and the settings-page logo.
    sparkle: '<path fill="currentColor" stroke="none" d="M12 4.2L13.6 10.4L19.8 12L13.6 13.6L12 19.8L10.4 13.6L4.2 12L10.4 10.4Z"/>',
    // Full logo: sparkle + the two accent dots from icon128.png.
    brandMark: '<path fill="currentColor" stroke="none" d="M12 4.2L13.6 10.4L19.8 12L13.6 13.6L12 19.8L10.4 13.6L4.2 12L10.4 10.4Z"/><circle cx="18.6" cy="5.4" r="1.25" fill="currentColor" stroke="none"/><circle cx="5.4" cy="18.6" r="0.95" fill="currentColor" stroke="none" opacity="0.75"/>',
    chevronLeft: '<polyline points="15 18 9 12 15 6"></polyline>',
    gear: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>',
    close: '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
    list: '<line x1="13" y1="6" x2="21" y2="6"></line><line x1="13" y1="12" x2="21" y2="12"></line><line x1="13" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>',
    grid: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>',
    mindmap: '<circle cx="12" cy="12" r="3"></circle><circle cx="4" cy="6" r="2"></circle><circle cx="20" cy="6" r="2"></circle><circle cx="4" cy="18" r="2"></circle><circle cx="20" cy="18" r="2"></circle><path d="M7 7l2.5 2.5"></path><path d="M17 7l-2.5 2.5"></path><path d="M7 17l2.5-2.5"></path><path d="M17 17l-2.5-2.5"></path>',
    pencil: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>',
    trash: '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"></path>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>',
    refresh: '<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>',
    wand: '<path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M12.2 11.8L11 13M12.2 6.2L11 5M3 21l9-9"></path>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>'
  };

  function icon(name, cls) {
    var body = ICONS[name] || '';
    // Filled brand marks (sparkle / brandMark) declare fill on their own paths.
    // Flag them so explicit CSS can guarantee the filled look regardless of how
    // the host engine resolves presentation attributes under `all: initial`.
    var filled = body.indexOf('fill="currentColor"') !== -1;
    var classes = ((cls || '') + (filled ? ' swe-icon--filled' : '')).trim();
    return '<svg class="' + classes + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
  }

  var TEMPLATE_ICONS = {
    brief: 'list',
    structured: 'grid',
    mindmap: 'mindmap',
    custom: 'pencil'
  };

  /* ------------------------------------------------------------------ */

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
    this.editMode = 'polish';        // 'polish' | 'qa'
    this.editStreamBuffer = '';
    this.root = null;
    this.panel = null;
    this.tab = null;
    this._tabNames = ['summary', 'images', 'tables', 'edit', 'settings'];
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
    return this.getEdgeTabHTML() +
      '<div id="swe-panel"><div class="swe-panel-shadow"></div><div class="swe-panel-body">' +
      this.getHeaderHTML() +
      this.getConfigHTML() +
      this.getMetricsHTML() +
      this.getTabsHTML() +
      '<div class="swe-content swe-scrollbar-thin" id="swe-content-area">' +
      this.getSummaryPanelHTML() +
      this.getImagesPanelHTML() +
      this.getTablesPanelHTML() +
      this.getEditPanelHTML() +
      this.getSettingsPanelHTML() +
      '</div>' +
      this.getLoadingHTML() +
      this.getFooterHTML() +
      this.getProgressHTML() +
      '</div></div>';
  };

  /* ---------- Edge trigger ---------- */
  FloatingPanel.prototype.getEdgeTabHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div id="swe-edge-tab" class="swe-edge-tab" title="' + t('edge.tab.title') + '">' +
      '<span class="swe-edge-tab__icon">' + icon('brandMark') + '</span>' +
      '<span class="swe-edge-tab__text" data-i18n="edge.tab.text">' + t('edge.tab.text') + '</span>' +
      '<span class="swe-edge-tab__chevron">' + icon('chevronLeft') + '</span>' +
      '</div>' +
      '<div class="swe-edge-tab__tooltip" id="swe-edge-tooltip">' + t('edge.tab.title') + '</div>';
  };

  /* ---------- Header ---------- */
  FloatingPanel.prototype.getHeaderHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div class="swe-header">' +
      '<div class="swe-brand-area">' +
      '<div class="swe-brand-icon">' + icon('brandMark') + '</div>' +
      '<div class="swe-brand-text">' +
      '<h2 class="swe-header__title" data-i18n="panel.header.title">' + t('panel.header.title') + '</h2>' +
      '<span class="swe-brand-subtitle">AI Browser Companion</span>' +
      '</div></div>' +
      '<div class="swe-header__actions">' +
      '<button class="swe-header__btn" id="swe-btn-settings" title="' + t('panel.open.settings') + '">' + icon('gear') + '</button>' +
      '<button class="swe-header__btn" id="swe-btn-close" title="' + t('panel.close') + '">' + icon('close') + '</button>' +
      '</div></div>';
  };

  /* ---------- In-panel API config ---------- */
  FloatingPanel.prototype.getConfigHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div class="swe-config-card" id="swe-config-card" hidden>' +
      '<div class="swe-state__title" data-i18n="state.welcome_title">' + t('state.welcome_title') + '</div>' +
      '<div class="swe-state__desc" data-i18n="state.config_prompt">' + t('state.config_prompt') + '</div>' +
      '<label>' + t('state.api_provider') + '</label>' +
      '<select id="swe-config-provider"><option value="deepseek">DeepSeek</option><option value="qwen">' + t('settings.api_provider') + '</option></select>' +
      '<label>' + t('state.api_key') + '</label>' +
      '<input type="password" id="swe-config-apikey" placeholder="sk-..." />' +
      '<div class="swe-hint" data-i18n="state.encrypted_hint">' + t('state.encrypted_hint') + '</div>' +
      '<div class="swe-btn-group">' +
      '<button class="swe-btn swe-btn--primary" id="swe-config-test">' + t('btn.test_connection') + '</button>' +
      '<button class="swe-btn swe-btn--ghost" id="swe-config-skip">' + t('btn.skip') + '</button>' +
      '</div></div>';
  };

  /* ---------- Metrics bar ---------- */
  FloatingPanel.prototype.getMetricsHTML = function () {
    return '<div class="swe-metrics-bar" id="swe-metrics-bar" hidden>' +
      '<div class="swe-metrics-text" id="swe-metrics-text"></div></div>';
  };

  /* ---------- Tab navigation (5 tabs + sliding indicator) ---------- */
  FloatingPanel.prototype.getTabsHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div class="swe-tabs" id="swe-tabs" hidden>' +
      '<button class="swe-tab swe-tab--active" data-panel="summary">' + t('tab.summary') + '</button>' +
      '<button class="swe-tab" data-panel="images">' + t('tab.images') +
      ' <span class="swe-badge" id="swe-badge-images">0</span></button>' +
      '<button class="swe-tab" data-panel="tables">' + t('tab.tables') +
      ' <span class="swe-badge" id="swe-badge-tables">0</span></button>' +
      '<button class="swe-tab" data-panel="edit">' + t('tab.edit') + '</button>' +
      '<button class="swe-tab" data-panel="settings">' + t('tab.settings') + '</button>' +
      '<span class="swe-tab-indicator" style="width:20%;transform:translateX(0)"></span>' +
      '</div>';
  };

  /* ---------- Templates ---------- */
  FloatingPanel.prototype.getTemplatesHTML = function () {
    var t = SWE.t.bind(SWE);
    var order = ['brief', 'structured', 'mindmap', 'custom'];
    var btns = order.map(function (id) {
      return '<button class="swe-template' + (id === 'brief' ? ' swe-template--active' : '') + '" data-template="' + id + '">' +
        icon(TEMPLATE_ICONS[id]) + '<span>' + t('template.' + id) + '</span></button>';
    }).join('');
    return '<div class="swe-templates" id="swe-templates">' +
      '<span class="swe-section-label">' + t('section.summary_template') + '</span>' +
      '<div class="swe-template-grid">' + btns + '</div>' +
      '</div>' +
      '<div class="swe-custom-area" id="swe-custom-template-area" hidden>' +
      '<textarea id="swe-custom-prompt" class="swe-editor-textarea" rows="3" placeholder="' + SWE.escapeHtml(t('template.custom_placeholder')) + '"></textarea>' +
      '</div>';
  };

  /* ---------- Summary panel ---------- */
  FloatingPanel.prototype.getSummaryPanelHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div id="swe-panel-summary" class="swe-panel-content">' +
      this.getTemplatesHTML() +
      '<div class="swe-state" id="swe-welcome-state">' +
      '<div class="swe-state__icon">' + icon('sparkle') + '</div>' +
      '<div class="swe-state__title">' + t('state.welcome_title') + '</div>' +
      '<div class="swe-state__desc">' + t('state.welcome_desc') + '</div>' +
      '<div class="swe-state__desc">' + t('state.extract_ready') + '</div>' +
      '</div>' +
      '<div class="swe-summary-card" id="swe-summary-card" hidden>' +
      '<div class="swe-summary-card__header">' +
      '<span class="swe-summary-badge">' + t('summary.badge') + '</span>' +
      '<button class="swe-copy-btn" id="swe-copy-summary">' + icon('copy') + '<span>' + t('summary.copy') + '</span></button>' +
      '</div>' +
      '<div class="swe-summary-body">' +
      '<div class="swe-summary" id="swe-summary-content"></div>' +
      '</div></div>' +
      '<button class="swe-extract-btn" id="swe-extract-btn">' + icon('zap') + '<span>' + t('btn.extract') + '</span></button>' +
      '</div>';
  };

  /* ---------- Images panel ---------- */
  FloatingPanel.prototype.getImagesPanelHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div id="swe-panel-images" class="swe-panel-content" hidden>' +
      '<div class="swe-image-filter" id="swe-image-filter"></div>' +
      '<div class="swe-image-grid" id="swe-image-grid"></div>' +
      '<div class="swe-empty-state" id="swe-images-empty" hidden>' +
      '<div class="swe-empty-state__icon">&#128247;</div>' +
      '<div class="swe-empty-state__text">' + t('state.no_images') + '</div></div>' +
      '<div class="swe-image-actions" id="swe-image-actions" hidden>' +
      '<button class="swe-btn swe-btn--primary swe-btn--sm" id="swe-btn-download-zip">' + t('btn.export_zip') + '</button>' +
      '<span class="swe-hint" id="swe-image-selected-count">' + SWE.tt('image.n_selected', { n: 0 }) + '</span>' +
      '</div></div>';
  };

  /* ---------- Tables panel ---------- */
  FloatingPanel.prototype.getTablesPanelHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div id="swe-panel-tables" class="swe-panel-content" hidden>' +
      '<div class="swe-table-list" id="swe-table-list"></div>' +
      '<div class="swe-empty-state" id="swe-tables-empty" hidden>' +
      '<div class="swe-empty-state__icon">&#128202;</div>' +
      '<div class="swe-empty-state__text">' + t('state.no_tables') + '</div></div></div>';
  };

  /* ---------- Edit panel (Markdown editor + AI polisher / QA) ---------- */
  FloatingPanel.prototype.getEditPanelHTML = function () {
    var t = SWE.t.bind(SWE);
    var tools = [
      { label: 'B', title: t('editor.bold'), syntax: { before: '**', after: '**', placeholder: t('editor.bold_ph') } },
      { label: 'I', title: t('editor.italic'), syntax: { before: '*', after: '*', placeholder: t('editor.italic_ph') } },
      { div: true },
      { label: 'H2', title: t('editor.heading'), syntax: { before: '## ', after: '', placeholder: t('editor.heading_ph') } },
      { div: true },
      { label: '&#8226;', title: t('editor.bullet'), syntax: { before: '- ', after: '', placeholder: t('editor.bullet_ph') } },
      { label: '&#10077;', title: t('editor.quote'), syntax: { before: '> ', after: '', placeholder: t('editor.quote_ph') } },
      { label: '&lt;/&gt;', title: t('editor.code'), syntax: { before: '`', after: '`', placeholder: t('editor.code_ph') } }
    ];
    var toolbar = tools.map(function (tool) {
      if (tool.div) return '<span class="swe-md-toolbar-divider"></span>';
      return '<button class="swe-md-tool-btn" data-md-tool="1" data-before="' + SWE.escapeHtml(tool.syntax.before) +
        '" data-after="' + SWE.escapeHtml(tool.syntax.after) + '" data-placeholder="' + SWE.escapeHtml(tool.syntax.placeholder) +
        '" title="' + SWE.escapeHtml(tool.title) + '">' + tool.label + '</button>';
    }).join('');

    return '<div id="swe-panel-edit" class="swe-panel-content" hidden>' +
      '<div class="swe-md-toolbar">' + toolbar + '</div>' +
      '<div class="swe-md-editor-wrap">' +
      '<textarea class="swe-md-editor swe-scrollbar-thin" id="swe-md-editor" spellcheck="false" placeholder="' + SWE.escapeHtml(t('editor.placeholder')) + '"></textarea>' +
      '</div>' +
      '<div class="swe-ai-chat-panel">' +
      '<div class="swe-ai-chat-header">' +
      '<div>' +
      '<div class="swe-ai-chat-header-title">' + t('editor.ai_title') + '</div>' +
      '<div class="swe-ai-chat-header-subtitle" id="swe-edit-mode-hint">' + t('editor.ai_subtitle_polish') + '</div>' +
      '</div>' +
      '<div class="swe-btn-group" style="margin-top:0">' +
      '<button class="swe-btn swe-btn--sm ' + (this.editMode === 'polish' ? 'swe-btn--primary' : 'swe-btn--ghost') + '" id="swe-edit-mode-polish">' + t('editor.mode_polish') + '</button>' +
      '<button class="swe-btn swe-btn--sm ' + (this.editMode === 'qa' ? 'swe-btn--primary' : 'swe-btn--ghost') + '" id="swe-edit-mode-qa">' + t('editor.mode_qa') + '</button>' +
      '</div></div>' +
      '<div class="swe-ai-chat-messages swe-scrollbar-thin" id="swe-edit-chat-messages"></div>' +
      '<div class="swe-ai-chat-input-row">' +
      '<input type="text" class="swe-ai-chat-input" id="swe-edit-chat-input" placeholder="' + SWE.escapeHtml(t('editor.input_placeholder')) + '" />' +
      '<button class="swe-ai-send-btn" id="swe-edit-chat-send">' + t('editor.send') + '</button>' +
      '</div></div></div>';
  };

  /* ---------- Settings panel ---------- */
  FloatingPanel.prototype.getSettingsPanelHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div id="swe-panel-settings" class="swe-panel-content" hidden>' +

      /* A. runtime metrics */
      '<div class="swe-settings-card">' +
      '<span class="swe-settings-card__label">' + t('panel.settings.monitor') + '</span>' +
      '<div class="swe-metrics-grid">' +
      '<div class="swe-metric-item">' +
      '<div class="swe-metric-icon">' + icon('cpu') + '</div>' +
      '<div class="swe-metric-info"><span class="swe-metric-label">' + t('panel.settings.memory') + '</span>' +
      '<span class="swe-metric-value" id="swe-metric-memory">—</span></div></div>' +
      '<div class="swe-metric-item">' +
      '<div class="swe-metric-icon">' + icon('layers') + '</div>' +
      '<div class="swe-metric-info"><span class="swe-metric-label">' + t('panel.settings.dom_nodes') + '</span>' +
      '<span class="swe-metric-value" id="swe-metric-dom">—</span></div></div>' +
      '</div></div>' +

      /* B. API key vault */
      '<div class="swe-vault-card">' +
      '<div class="swe-vault-header">' +
      '<div class="swe-vault-header-left">' +
      '<div class="swe-vault-icon">' + icon('lock') + '</div>' +
      '<span class="swe-vault-title">' + t('panel.settings.vault_title') + '</span>' +
      '</div>' +
      '<span class="swe-vault-badge">AES-GCM-256</span>' +
      '</div>' +
      '<div class="swe-vault-input-wrapper">' +
      '<input type="password" class="swe-vault-input" id="swe-vault-input" placeholder="sk-••••••••••••" autocomplete="off" />' +
      '<button class="swe-vault-eye-btn" id="swe-vault-eye" title="' + t('panel.settings.toggle_key') + '">' + icon('eye') + '</button>' +
      '</div>' +
      '<div class="swe-vault-btn-group">' +
      '<button class="swe-vault-btn-primary" id="swe-vault-save">' + t('panel.settings.save_key') + '</button>' +
      '<button class="swe-vault-btn-danger" id="swe-vault-delete" title="' + t('panel.settings.delete_key') + '">' + icon('trash') + '</button>' +
      '</div>' +
      '<p class="swe-vault-hint">' + t('panel.settings.vault_hint') + '</p>' +
      '</div>' +

      /* C. provider */
      '<div class="swe-settings-card">' +
      '<div class="swe-card-header">' +
      '<div class="swe-card-header-left">' +
      '<span class="swe-card-header-icon">' + icon('wand') + '</span>' +
      '<span class="swe-card-header-title">' + t('panel.settings.provider_title') + '</span>' +
      '</div></div>' +
      '<select class="swe-provider-select" id="swe-provider-select">' +
      '<option value="deepseek">DeepSeek</option>' +
      '<option value="qwen">' + t('settings.api_provider') + '</option>' +
      '</select>' +
      '<p class="swe-provider-hint">' + t('panel.settings.provider_hint') + '</p>' +
      '</div>' +

      /* D. site rules */
      '<div class="swe-settings-card">' +
      '<div class="swe-card-header">' +
      '<div class="swe-card-header-left">' +
      '<span class="swe-card-header-icon">' + icon('list') + '</span>' +
      '<span class="swe-card-header-title">' + t('panel.settings.rules_title') + '</span>' +
      '</div>' +
      '<button class="swe-card-action-link" id="swe-open-full-settings">' + t('panel.settings.manage_rules') + ' &rarr;</button>' +
      '</div>' +
      '<div class="swe-rules-list" id="swe-rules-list"></div>' +
      '</div>' +

      '</div>';
  };

  /* ---------- Loading overlay ---------- */
  FloatingPanel.prototype.getLoadingHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div class="swe-loading-overlay" id="swe-loading-overlay" hidden>' +
      '<div class="swe-extracting-badge">' +
      '<span class="swe-pulse-dot"></span>' +
      '<span class="swe-extracting-badge-text">' + t('loading.badge') + '</span>' +
      '</div>' +
      '<div class="swe-spinner-wrapper"><div class="swe-spinner-ring"></div></div>' +
      '<div class="swe-loading-title">' + t('loading.title') + '</div>' +
      '<div class="swe-loading-desc" id="swe-loading-desc">' + t('progress.extracting') + '</div>' +
      '<div class="swe-progress-wrapper">' +
      '<div class="swe-progress-track"><div class="swe-progress-fill" id="swe-loading-fill"></div></div>' +
      '<span class="swe-progress-percent" id="swe-loading-percent">0%</span>' +
      '</div></div>';
  };

  /* ---------- Footer ---------- */
  FloatingPanel.prototype.getFooterHTML = function () {
    var t = SWE.t.bind(SWE);
    return '<div class="swe-footer" id="swe-footer" hidden>' +
      '<span class="swe-export-label">' + t('export.label') + '</span>' +
      '<div class="swe-footer-row">' +
      '<div class="swe-export-group">' +
      '<label class="swe-export-check"><input type="checkbox" id="export-txt" checked> ' + t('label.txt') + '</label>' +
      '<label class="swe-export-check"><input type="checkbox" id="export-md" checked> ' + t('label.md') + '</label>' +
      '<label class="swe-export-check"><input type="checkbox" id="export-word"> ' + t('label.word') + '</label>' +
      '</div>' +
      '<button class="swe-export-btn" id="swe-btn-export">' + icon('download') + '<span>' + t('btn.export') + '</span></button>' +
      '</div></div>';
  };

  FloatingPanel.prototype.getProgressHTML = function () {
    return '<div class="swe-progress" id="swe-progress" hidden>' +
      '<div class="swe-progress__bar"></div>' +
      '<span class="swe-progress__text" id="swe-progress-text"></span></div>';
  };

  /* ================================================================
     Events
     ================================================================ */
  FloatingPanel.prototype.bindEvents = function () {
    var self = this;
    var root = this.root;

    root.querySelector('#swe-edge-tab').addEventListener('click', function () { self.toggle(); });
    root.querySelector('#swe-btn-close').addEventListener('click', function () { self.slideOut(); });

    // Header gear → inline settings tab
    root.querySelector('#swe-btn-settings').addEventListener('click', function () {
      self.panel.classList.add('swe-panel--open');
      self.tab.classList.add('swe-edge-tab--hidden');
      self.state = PanelState.VISIBLE;
      self.hideConfig();
      self.ensureResultChrome();
      self.switchTab('settings');
      self.refreshSettingsPanel();
    });

    // Click outside to close
    document.addEventListener('click', function (e) {
      if (self.state === PanelState.VISIBLE && !e.target.closest('#swe-panel') && !e.target.closest('#swe-edge-tab')) {
        self.slideOut();
      }
    });

    // ESC closes panel / lightbox
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (self.state === PanelState.VISIBLE) { self.slideOut(); }
        self.closeImageLightbox();
      }
    });

    // Extract / re-extract
    root.querySelector('#swe-extract-btn').addEventListener('click', function () {
      self.startExtraction('fullPage');
    });

    // Template switching
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

    // Tab switching
    var tabs = root.querySelectorAll('.swe-tab');
    for (var ti = 0; ti < tabs.length; ti++) {
      tabs[ti].addEventListener('click', function () {
        self.switchTab(this.getAttribute('data-panel'));
      });
    }

    // Export
    root.querySelector('#swe-btn-export').addEventListener('click', function () {
      self.exportContent();
    });

    // Copy summary
    root.querySelector('#swe-copy-summary').addEventListener('click', function () {
      self.copySummary();
    });

    // Edit panel: markdown toolbar
    var mdTools = root.querySelectorAll('[data-md-tool]');
    for (var m = 0; m < mdTools.length; m++) {
      mdTools[m].addEventListener('click', function () {
        var editor = document.getElementById('swe-md-editor');
        if (!editor) return;
        SWE.insertMarkdownSyntax(editor, {
          before: this.getAttribute('data-before') || '',
          after: this.getAttribute('data-after') || '',
          placeholder: this.getAttribute('data-placeholder') || ''
        });
      });
    }

    // Edit panel: mode toggle
    root.querySelector('#swe-edit-mode-polish').addEventListener('click', function () { self.setEditMode('polish'); });
    root.querySelector('#swe-edit-mode-qa').addEventListener('click', function () { self.setEditMode('qa'); });

    // Edit panel: send
    root.querySelector('#swe-edit-chat-send').addEventListener('click', function () { self.sendEditMessage(); });
    root.querySelector('#swe-edit-chat-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); self.sendEditMessage(); }
    });

    // Settings: vault
    root.querySelector('#swe-vault-eye').addEventListener('click', function () { self.toggleVaultVisibility(); });
    root.querySelector('#swe-vault-save').addEventListener('click', function () { self.saveVaultKey(); });
    root.querySelector('#swe-vault-delete').addEventListener('click', function () { self.deleteVaultKey(); });
    root.querySelector('#swe-provider-select').addEventListener('change', function () {
      var provider = this.value;
      SWE.getSettings(function (settings) {
        settings.defaultProvider = provider;
        SWE.saveSettings(settings, function () {
          SWE.showToast(SWE.t('toast.saved'), 'success');
          self.loadVaultKey();
        });
      });
    });
    root.querySelector('#swe-open-full-settings').addEventListener('click', function () {
      self.openSettingsPage();
    });

    // Image ZIP download
    var zipBtn = root.querySelector('#swe-btn-download-zip');
    if (zipBtn) {
      zipBtn.addEventListener('click', function () {
        var selected = self.selectedImages;
        if (!selected || selected.length === 0) {
          SWE.showToast(SWE.t('image.select_first'), 'info');
          return;
        }
        SWE.downloadZip(selected, self.extractedData ? self.extractedData.title : 'images');
      });
    }

    // Config test / skip
    var testBtn = root.querySelector('#swe-config-test');
    if (testBtn) testBtn.addEventListener('click', function () { self.testConnection(); });
    var skipBtn = root.querySelector('#swe-config-skip');
    if (skipBtn) skipBtn.addEventListener('click', function () { self.hideConfig(); });
  };

  /* ================================================================
     Panel visibility
     ================================================================ */
  FloatingPanel.prototype.toggle = function () {
    if (this.state === PanelState.HIDDEN) { this.slideIn(); } else { this.slideOut(); }
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
      if (!hasKey) { self.showConfig(); } else { self.hideConfig(); }
    });
  };

  /** Public entry — open the panel straight into the API-config state. */
  FloatingPanel.prototype.openConfig = function () {
    this.state = PanelState.CONFIGURING;
    this.panel.classList.add('swe-panel--open');
    this.tab.classList.add('swe-edge-tab--hidden');
    this.showConfig();
  };

  FloatingPanel.prototype.showConfig = function () {
    this.state = PanelState.CONFIGURING;
    var card = document.getElementById('swe-config-card');
    if (card) card.hidden = false;
  };

  FloatingPanel.prototype.hideConfig = function () {
    var card = document.getElementById('swe-config-card');
    if (card) card.hidden = true;
  };

  FloatingPanel.prototype.testConnection = function () {
    var self = this;
    var provider = document.getElementById('swe-config-provider').value;
    var apiKey = document.getElementById('swe-config-apikey').value;
    if (!apiKey) { SWE.showToast(SWE.t('settings.config_first'), 'error'); return; }
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

  /* ================================================================
     Extraction
     ================================================================ */
  FloatingPanel.prototype.startExtraction = function (mode) {
    var self = this;
    if (this.state === PanelState.EXTRACTING) return;

    this.state = PanelState.EXTRACTING;
    this.hideConfig();
    this.showLoading(SWE.t('progress.extracting'), 8);

    var extractBtn = document.getElementById('swe-extract-btn');
    if (extractBtn) {
      extractBtn.disabled = true;
      extractBtn.innerHTML = '<span class="swe-spinner"></span><span>' + SWE.t('common.loading') + '</span>';
    }

    SWE.runExtraction(mode || 'fullPage', function (step) {
      switch (step) {
        case 'extracting': self.showLoading(SWE.t('progress.extracting'), 18); break;
        case 'filtering': self.showLoading(SWE.t('progress.filtering'), 36); break;
        case 'collecting_images': self.showLoading(SWE.t('progress.collecting_images'), 54); break;
        case 'parsing_tables': self.showLoading(SWE.t('progress.parsing_tables'), 68); break;
        case 'done': self.showLoading(SWE.t('progress.ai_connecting'), 78); break;
        case 'error': self.hideLoading(); break;
      }
    }, function (result, err) {
      var restoreBtn = function () {
        if (extractBtn) {
          extractBtn.disabled = false;
          extractBtn.innerHTML = icon('zap') + '<span>' + SWE.t('btn.reextract') + '</span>';
        }
      };

      if (err) {
        self.state = PanelState.VISIBLE;
        self.hideLoading();
        restoreBtn();
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
      self.showLoading(SWE.t('progress.ai_analyzing'), 88);

      self.callAI(result).then(function (aiResult) {
        self.aiResult = aiResult || '';
        self.currentSummary = aiResult || '';
        self.state = PanelState.RESULT;
        self.showLoading(SWE.t('progress.done'), 100);
        setTimeout(function () {
          self.hideLoading();
          self.showResult(result, aiResult);
          restoreBtn();
        }, 320);
        SWE.saveLastExtraction({ data: result, aiResult: aiResult });
        SWE.showToast(SWE.t('toast.extracted'), 'success');
      }).catch(function (error) {
        self.state = PanelState.RESULT;
        self.hideLoading();
        restoreBtn();
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
        SWE.callAI({ provider: provider, messages: messages }).then(resolve).catch(reject);
      });
    });
  };

  FloatingPanel.prototype.showResult = function (data, aiResult) {
    var welcome = document.getElementById('swe-welcome-state');
    if (welcome) welcome.hidden = true;
    this.hideConfig();

    var card = document.getElementById('swe-summary-card');
    if (card) card.hidden = false;

    var summaryEl = document.getElementById('swe-summary-content');
    if (summaryEl) {
      if (aiResult) {
        summaryEl.innerHTML = SWE.renderReadableHtml(aiResult);
      } else {
        summaryEl.innerHTML = '<div class="swe-readable">' +
          '<p>' + SWE.escapeHtml(String(data.content || '').substring(0, 500)) + '...</p>' +
          '<p class="swe-readable-hint">' + SWE.t('state.summary_empty') + '</p></div>';
      }
    }

    // Seed the edit editor with the summary markdown
    var editor = document.getElementById('swe-md-editor');
    if (editor && !editor.value) editor.value = aiResult || data.content || '';

    this.updateMetrics(data);
    this.updateBadges(data);
    this.renderImages(data.images);
    this.renderTables(data.tables);
    this.ensureResultChrome();
    this.switchTab('summary');
  };

  /** Show tabs / footer once there is something to show. */
  FloatingPanel.prototype.ensureResultChrome = function () {
    var tabsEl = document.getElementById('swe-tabs');
    if (tabsEl) tabsEl.hidden = false;
    var footer = document.getElementById('swe-footer');
    if (footer) footer.hidden = false;
    this.updateTabIndicator();
  };

  FloatingPanel.prototype.updateMetrics = function (data) {
    var bar = document.getElementById('swe-metrics-bar');
    var textEl = document.getElementById('swe-metrics-text');
    if (!bar || !textEl) return;
    var chars = (data && data.content ? data.content.length : 0).toLocaleString();
    var imgs = data && data.images ? data.images.length : 0;
    var tbls = data && data.tables ? data.tables.length : 0;
    textEl.innerHTML = '<span>' + SWE.t('metrics.prefix') + '</span>' +
      '<span>' + SWE.t('metrics.body') + ' <strong>' + chars + '</strong> ' + SWE.t('metrics.chars') +
      ' | ' + SWE.t('tab.images') + ' <strong>' + imgs + '</strong> ' + SWE.t('metrics.units') +
      ' | ' + SWE.t('tab.tables') + ' <strong>' + tbls + '</strong> ' + SWE.t('metrics.copies') + '</span>';
    bar.hidden = false;
  };

  FloatingPanel.prototype.updateBadges = function (data) {
    var imgBadge = document.getElementById('swe-badge-images');
    if (imgBadge) imgBadge.textContent = String(data.images ? data.images.length : 0);
    var tblBadge = document.getElementById('swe-badge-tables');
    if (tblBadge) tblBadge.textContent = String(data.tables ? data.tables.length : 0);
  };

  FloatingPanel.prototype.showCustomTemplate = function () {
    var area = document.getElementById('swe-custom-template-area');
    if (area) area.hidden = this.currentTemplate !== 'custom';
  };

  /* ================================================================
     Loading overlay
     ================================================================ */
  FloatingPanel.prototype.showLoading = function (text, percent) {
    var overlay = document.getElementById('swe-loading-overlay');
    var desc = document.getElementById('swe-loading-desc');
    var fill = document.getElementById('swe-loading-fill');
    var pct = document.getElementById('swe-loading-percent');
    if (overlay) overlay.hidden = false;
    if (desc) desc.textContent = text;
    if (fill && typeof percent === 'number') fill.style.width = percent + '%';
    if (pct && typeof percent === 'number') pct.textContent = percent + '%';
  };

  FloatingPanel.prototype.hideLoading = function () {
    var overlay = document.getElementById('swe-loading-overlay');
    if (overlay) overlay.hidden = true;
    var fill = document.getElementById('swe-loading-fill');
    if (fill) fill.style.width = '0%';
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

  /* ================================================================
     Tabs
     ================================================================ */
  FloatingPanel.prototype.switchTab = function (panelName) {
    if (!panelName) return;
    var tabs = this.root.querySelectorAll('.swe-tab');
    var activeIndex = 0;
    for (var i = 0; i < tabs.length; i++) {
      var isActive = tabs[i].getAttribute('data-panel') === panelName;
      tabs[i].classList.toggle('swe-tab--active', isActive);
      if (isActive) activeIndex = i;
    }
    var panels = this.root.querySelectorAll('.swe-panel-content');
    for (var j = 0; j < panels.length; j++) {
      var isTarget = panels[j].id === 'swe-panel-' + panelName;
      panels[j].hidden = !isTarget;
      if (isTarget) {
        panels[j].style.animation = 'none';
        // eslint-disable-next-line no-unused-expressions
        panels[j].offsetHeight;
        panels[j].style.animation = '';
      }
    }
    this.moveIndicator(activeIndex);
    if (panelName === 'settings') this.refreshSettingsPanel();
  };

  FloatingPanel.prototype.moveIndicator = function (index) {
    var indicator = this.root.querySelector('.swe-tab-indicator');
    if (!indicator) return;
    var total = this._tabNames.length;
    indicator.style.width = (100 / total) + '%';
    indicator.style.transform = 'translateX(' + (index * 100) + '%)';
  };

  FloatingPanel.prototype.updateTabIndicator = function () {
    var tabs = this.root.querySelectorAll('.swe-tab');
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].classList.contains('swe-tab--active')) { this.moveIndicator(i); return; }
    }
    this.moveIndicator(0);
  };

  /* ================================================================
     Images
     ================================================================ */
  FloatingPanel.prototype.renderImages = function (images) {
    var self = this;
    var grid = document.getElementById('swe-image-grid');
    var empty = document.getElementById('swe-images-empty');
    var filterBar = document.getElementById('swe-image-filter');
    var actionsBar = document.getElementById('swe-image-actions');
    if (!grid) return;

    if (!images || images.length === 0) {
      grid.innerHTML = '';
      if (empty) empty.hidden = false;
      if (actionsBar) actionsBar.hidden = true;
      if (filterBar) filterBar.innerHTML = '';
      return;
    }
    if (empty) empty.hidden = true;
    if (actionsBar) actionsBar.hidden = false;
    this.images = images;

    var filters = ['all', 'photo', 'chart', 'logo', 'other'];
    var t = SWE.t.bind(SWE);
    var names = {
      all: t('image.filter_all'), photo: t('image.filter_photo'), chart: t('image.filter_chart'),
      logo: t('image.filter_logo'), other: t('image.filter_other')
    };
    if (filterBar) {
      filterBar.innerHTML = filters.map(function (f) {
        return '<button class="swe-image-filter-btn' + (f === self.imageFilter ? ' swe-image-filter-btn--active' : '') +
          '" data-filter="' + f + '">' + (names[f] || f) + '</button>';
      }).join('');
      var btns = filterBar.querySelectorAll('.swe-image-filter-btn');
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener('click', function () {
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
      var selected = self.selectedImages.indexOf(img) !== -1 ? ' swe-image-item--selected' : '';
      var dims = (img.width || '?') + '×' + (img.height || '?');
      return '<div class="swe-image-item' + selected + '" data-index="' + idx + '">' +
        '<img src="' + SWE.escapeHtml(img.src) + '" alt="' + SWE.escapeHtml(img.alt || '') + '" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentElement.style.display=\'none\'" />' +
        '<span class="swe-image-badge">' + SWE.escapeHtml(img.category || 'image') + '</span>' +
        '<div class="swe-image-check">&#10003;</div>' +
        '<div class="swe-image-label">' + SWE.escapeHtml(dims) + '</div></div>';
    }).join('');

    var items = grid.querySelectorAll('.swe-image-item');
    for (var k = 0; k < items.length; k++) {
      items[k].addEventListener('click', function () {
        var img = filtered[parseInt(this.getAttribute('data-index'), 10)];
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
        if (countEl) countEl.textContent = SWE.tt('image.n_selected', { n: self.selectedImages.length });
      });
      items[k].addEventListener('dblclick', function () {
        var img = filtered[parseInt(this.getAttribute('data-index'), 10)];
        if (img && img.src) self.openImageLightbox(img.src, img.alt || '');
      });
      items[k].style.animationDelay = (k * 0.04) + 's';
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

  /* ================================================================
     Tables
     ================================================================ */
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
        '<div class="swe-table-card__info">' + tbl.rowCount + ' × ' + tbl.colCount + ' ' + tr('table.dims') + '</div>' +
        '</div>' +
        '<div class="swe-table-card__actions">' +
        '<button class="swe-btn swe-btn--ghost swe-btn--sm" data-table-index="' + i + '" data-action="copy">' + tr('common.copy') + '</button>' +
        '<button class="swe-btn swe-btn--ghost swe-btn--sm" data-table-index="' + i + '" data-action="csv">CSV</button>' +
        '</div></div>' +
        '<div class="swe-table-wrap swe-scrollbar-thin"><table>' + headerHtml + bodyHtml + '</table></div>' +
        '</div>';
    }).join('');

    var csvBtns = list.querySelectorAll('[data-action="csv"]');
    for (var j = 0; j < csvBtns.length; j++) {
      csvBtns[j].addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-table-index'), 10);
        var tableData = tables[idx];
        if (!tableData) return;
        var csv = SWE.TableParser.tableToCsv(tableData);
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        SWE.downloadFile(blob, SWE.generateExportFilename('table_' + (idx + 1), 'csv'));
      });
    }

    var copyBtns = list.querySelectorAll('[data-action="copy"]');
    for (var k = 0; k < copyBtns.length; k++) {
      copyBtns[k].addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-table-index'), 10);
        var tableData = tables[idx];
        if (!tableData) return;
        var csv = SWE.TableParser.tableToCsv(tableData);
        var btn = this;
        btn.textContent = SWE.t('common.copied');
        btn.classList.add('swe-btn--copied');
        setTimeout(function () {
          btn.textContent = SWE.t('common.copy');
          btn.classList.remove('swe-btn--copied');
        }, 1500);
        copyText(csv);
      });
    }

    var cards = list.querySelectorAll('.swe-table-card');
    for (var c = 0; c < cards.length; c++) {
      cards[c].style.animationDelay = (c * 0.06) + 's';
    }
  };

  /* ================================================================
     Edit panel — AI polisher / page Q&A
     ================================================================ */
  FloatingPanel.prototype.setEditMode = function (mode) {
    this.editMode = mode;
    var polishBtn = document.getElementById('swe-edit-mode-polish');
    var qaBtn = document.getElementById('swe-edit-mode-qa');
    var hint = document.getElementById('swe-edit-mode-hint');
    var input = document.getElementById('swe-edit-chat-input');
    var isPolish = mode === 'polish';
    if (polishBtn) polishBtn.className = 'swe-btn swe-btn--sm ' + (isPolish ? 'swe-btn--primary' : 'swe-btn--ghost');
    if (qaBtn) qaBtn.className = 'swe-btn swe-btn--sm ' + (!isPolish ? 'swe-btn--primary' : 'swe-btn--ghost');
    if (hint) hint.textContent = SWE.t(isPolish ? 'editor.ai_subtitle_polish' : 'editor.ai_subtitle_qa');
    if (input) input.placeholder = SWE.t(isPolish ? 'editor.input_placeholder' : 'qa.placeholder');
  };

  FloatingPanel.prototype.appendEditMessage = function (role, text) {
    var box = document.getElementById('swe-edit-chat-messages');
    if (!box) return null;
    var el = document.createElement('div');
    el.className = 'swe-chat-msg swe-chat-msg--' + (role === 'user' ? 'user' : 'ai');
    el.textContent = text;
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
    return el;
  };

  FloatingPanel.prototype.buildPageContext = function (limit) {
    var max = limit || 12000;
    var parts = [];
    var d = this.extractedData || {};
    parts.push('标题：' + (d.title || document.title || '未知'));
    parts.push('URL：' + window.location.href);
    var body = d.content || this.currentSummary || '';
    parts.push('\n--- 正文内容 ---\n' + (body || '暂无内容'));
    if (this.tables && this.tables.length > 0) {
      var ts = SWE.TableParser.tablesToSummary(this.tables);
      if (ts) parts.push('\n--- 页面表格 ---\n' + ts);
    }
    if (this.images && this.images.length > 0) {
      var is = SWE.ImageCollector.imagesToTextSummary(this.images);
      if (is) parts.push('\n--- 页面图片 ---\n' + is);
    }
    var ctx = parts.join('\n');
    if (ctx.length > max) ctx = ctx.substring(0, max - 200) + '\n\n[内容已截断...]';
    return ctx;
  };

  FloatingPanel.prototype.sendEditMessage = function () {
    var self = this;
    var input = document.getElementById('swe-edit-chat-input');
    var box = document.getElementById('swe-edit-chat-messages');
    if (!input || !box || !input.value.trim()) return;

    var instruction = input.value.trim();
    input.value = '';
    this.appendEditMessage('user', instruction);

    var isPolish = this.editMode === 'polish';
    var editor = document.getElementById('swe-md-editor');
    var draft = editor ? editor.value : '';

    var systemPrompt;
    var userPrompt;
    if (isPolish) {
      systemPrompt = '你是一位专业的中文内容编辑助手。用户会给你一份 Markdown 草稿和一条修改指令。' +
        '请严格按指令改写草稿，只输出改写后的 Markdown 正文本身，不要输出任何解释、前言、代码块围栏或多余说明。保持 Markdown 结构。';
      userPrompt = '【当前草稿】\n' + (draft || '（空）') +
        '\n\n【网页原文参考】\n' + this.buildPageContext(6000) +
        '\n\n【修改指令】\n' + instruction;
    } else {
      systemPrompt = '你是一个基于网页内容的智能问答助手。你只能根据下面提供的网页内容回答问题。' +
        '如果内容中没有相关信息，请明确告知用户。回答简洁、有条理。\n\n网页内容如下：\n\n' + this.buildPageContext(11000);
      userPrompt = instruction;
    }

    var aiEl = this.appendEditMessage('ai', '');
    aiEl.innerHTML = '<span class="swe-chat-typing">' + SWE.t('common.loading') + '</span>';

    var buffer = '';
    var typingTimer = null;
    var typedIndex = 0;

    var flush = function () {
      if (typedIndex < buffer.length) {
        var step = Math.min(3, buffer.length - typedIndex);
        aiEl.textContent = buffer.substring(0, typedIndex + step);
        typedIndex += step;
        box.scrollTop = box.scrollHeight;
        return true;
      }
      return false;
    };
    var stopTimer = function () {
      if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }
    };

    var finalize = function () {
      stopTimer();
      flush();
      aiEl.textContent = buffer;
      if (isPolish && buffer.trim()) {
        var applyBtn = document.createElement('button');
        applyBtn.className = 'swe-btn swe-btn--primary swe-btn--sm';
        applyBtn.style.marginTop = '8px';
        applyBtn.textContent = SWE.t('editor.apply');
        applyBtn.addEventListener('click', function () {
          var ed = document.getElementById('swe-md-editor');
          if (ed) { ed.value = buffer; SWE.showToast(SWE.t('editor.applied'), 'success'); }
        });
        aiEl.appendChild(applyBtn);
      }
      box.scrollTop = box.scrollHeight;
    };

    SWE.getSettings(function (settings) {
      var provider = (settings && settings.defaultProvider) || 'deepseek';
      SWE.callAIStream(
        { provider: provider, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }] },
        function (chunk) {
          var typingEl = aiEl.querySelector('.swe-chat-typing');
          if (typingEl) typingEl.remove();
          buffer += chunk;
          if (!typingTimer) {
            typingTimer = setInterval(function () { if (!flush()) stopTimer(); }, 22);
          }
        },
        function () { finalize(); },
        function (err) {
          stopTimer();
          var typingEl = aiEl.querySelector('.swe-chat-typing');
          if (typingEl) typingEl.remove();
          aiEl.textContent = buffer || ((err && err.message) || SWE.t('error.unknown'));
          box.scrollTop = box.scrollHeight;
        }
      );
    });
  };

  /* ================================================================
     Settings panel
     ================================================================ */
  FloatingPanel.prototype.refreshSettingsPanel = function () {
    this.updateRuntimeMetrics();
    this.loadVaultKey();
    this.loadProvider();
    this.loadRules();
  };

  FloatingPanel.prototype.updateRuntimeMetrics = function () {
    var memEl = document.getElementById('swe-metric-memory');
    var domEl = document.getElementById('swe-metric-dom');
    if (memEl) {
      var mem = '—';
      try {
        if (performance && performance.memory && performance.memory.usedJSHeapSize) {
          mem = (performance.memory.usedJSHeapSize / 1048576).toFixed(1) + ' MB';
        }
      } catch (e) { /* not supported */ }
      memEl.textContent = mem;
    }
    if (domEl) {
      domEl.textContent = document.getElementsByTagName('*').length.toLocaleString();
    }
  };

  FloatingPanel.prototype.loadVaultKey = function () {
    var input = document.getElementById('swe-vault-input');
    if (!input) return;
    SWE.getSettings(function (settings) {
      var provider = (settings && settings.defaultProvider) || 'deepseek';
      SWE.getApiKey(provider).then(function (key) {
        input.value = key ? SWE.maskApiKey(key) : '';
        input.placeholder = key ? '' : 'sk-••••••••••••';
        input.dataset.masked = key ? '1' : '';
      }).catch(function () { input.value = ''; });
    });
  };

  FloatingPanel.prototype.toggleVaultVisibility = function () {
    var input = document.getElementById('swe-vault-input');
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  };

  FloatingPanel.prototype.saveVaultKey = function () {
    var self = this;
    var input = document.getElementById('swe-vault-input');
    if (!input) return;
    var value = (input.value || '').trim();
    // Ignore an untouched masked value
    if (!value || value.indexOf('****') !== -1) {
      SWE.showToast(SWE.t('settings.api_key_placeholder'), 'info');
      return;
    }
    SWE.getSettings(function (settings) {
      var provider = (settings && settings.defaultProvider) || 'deepseek';
      SWE.saveApiKey(provider, value).then(function () {
        SWE.showToast(SWE.t('settings.api_key_saved'), 'success');
        self.loadVaultKey();
      }).catch(function () {
        SWE.showToast(SWE.t('toast.error'), 'error');
      });
    });
  };

  FloatingPanel.prototype.deleteVaultKey = function () {
    var self = this;
    SWE.getSettings(function (settings) {
      var provider = (settings && settings.defaultProvider) || 'deepseek';
      SWE.removeApiKey(provider).then(function () {
        SWE.showToast(SWE.t('panel.settings.key_deleted'), 'success');
        self.loadVaultKey();
      });
    });
  };

  FloatingPanel.prototype.loadProvider = function () {
    var select = document.getElementById('swe-provider-select');
    if (!select) return;
    SWE.getSettings(function (settings) {
      select.value = (settings && settings.defaultProvider) || 'deepseek';
    });
  };

  FloatingPanel.prototype.loadRules = function () {
    var list = document.getElementById('swe-rules-list');
    if (!list) return;
    SWE.getRules(function (rules) {
      if (!rules || rules.length === 0) {
        list.innerHTML = '<div class="swe-hint">' + SWE.t('settings.no_rules') + '</div>';
        return;
      }
      list.innerHTML = rules.map(function (rule) {
        return '<div class="swe-rule-item">' +
          '<div style="min-width:0">' +
          '<div class="swe-rule-name">' + SWE.escapeHtml(rule.name || '') + '</div>' +
          '<div class="swe-rule-url">' + SWE.escapeHtml(rule.urlPattern || rule.url || '*') + '</div>' +
          '</div></div>';
      }).join('');
    });
  };

  FloatingPanel.prototype.openSettingsPage = function () {
    var url = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
      ? chrome.runtime.getURL('pages/settings/settings.html') : null;
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        chrome.runtime.sendMessage({ type: 'open:settings' }, function () {
          if (chrome.runtime.lastError && url) window.open(url, '_blank');
        });
        return;
      } catch (e) { /* fall through */ }
    }
    if (url) window.open(url, '_blank');
  };

  /* ================================================================
     Summary copy / export
     ================================================================ */
  FloatingPanel.prototype.copySummary = function () {
    var text = this.currentSummary || (this.extractedData ? this.extractedData.content : '') || '';
    if (!text) { SWE.showToast(SWE.t('state.summary_empty'), 'info'); return; }
    copyText(text);
    var btn = document.getElementById('swe-copy-summary');
    if (btn) {
      var label = btn.querySelector('span');
      if (label) {
        var original = label.textContent;
        label.textContent = SWE.t('common.copied');
        setTimeout(function () { label.textContent = original; }, 1500);
      }
    }
  };

  FloatingPanel.prototype.exportContent = function () {
    var checkTxt = document.getElementById('export-txt');
    var checkMd = document.getElementById('export-md');
    var checkWord = document.getElementById('export-word');
    var title = this.extractedData ? this.extractedData.title : 'export';
    var content = this.currentSummary || (this.extractedData ? this.extractedData.content : '');
    var metadata = { title: title, url: window.location.href };

    if (checkTxt && checkTxt.checked) {
      SWE.downloadFile(SWE.exportTxt(content, metadata), SWE.generateExportFilename(title, 'txt'));
    }
    if (checkMd && checkMd.checked) {
      SWE.downloadFile(SWE.exportMarkdown(content, metadata), SWE.generateExportFilename(title, 'md'));
    }
    if (checkWord && checkWord.checked) {
      SWE.downloadFile(SWE.exportWord(content, metadata), SWE.generateExportFilename(title, 'doc'));
    }
    SWE.showToast(SWE.t('toast.exported'), 'success');
  };

  /* ================================================================
     Restore last extraction
     ================================================================ */
  FloatingPanel.prototype.loadState = function () {
    var self = this;
    SWE.getLastExtraction(function (cache) {
      if (!cache || !cache.data) return;
      self.extractedData = cache.data;
      self.aiResult = cache.aiResult || '';
      self.currentSummary = cache.aiResult || '';
      self.images = cache.data.images || [];
      self.tables = cache.data.tables || [];
      self.updateBadges(cache.data);
      self.renderImages(self.images);
      self.renderTables(self.tables);
      var editor = document.getElementById('swe-md-editor');
      if (editor && !editor.value) editor.value = self.aiResult || cache.data.content || '';
    });
  };

  /* ================================================================
     Shared helper — clipboard
     ================================================================ */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        SWE.showToast(SWE.t('toast.copied'), 'success');
      }).catch(function () { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
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

  window.SWEFloatingPanel = FloatingPanel;
})();
