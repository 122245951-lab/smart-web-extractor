;/*
 * Settings page logic - Smart Web Extractor
 * API Key encrypted management, rule CRUD, language switching
 */
(function () {
  'use strict';
  var SWE = window.SWE;
  var currentSettings = {};
  var currentLang = 'zh';

  function $(id) { return document.getElementById(id); }

  function init() {
    SWE.loadLang(function (lang) {
      currentLang = lang;
      var s = $('ui-language'); if (s) s.value = lang;
      loadSettings();
      loadMaskedKeys();
      loadRules();
      bindEvents();
    });
  }

  function loadSettings() {
    SWE.getSettings(function (settings) {
      currentSettings = settings || {};
      setVal('default-provider', settings.defaultProvider || 'deepseek');
      setVal('default-model', settings.defaultModel || 'deepseek-chat');
      setChecked('trigger-edge-tab', !settings.triggers || settings.triggers.edgeTab !== false);
      setChecked('trigger-context-menu', !settings.triggers || settings.triggers.contextMenu !== false);
      setChecked('trigger-keyboard', !settings.triggers || settings.triggers.keyboard !== false);
      setChecked('trigger-floating-btn', settings.triggers && settings.triggers.floatingBtn === true);
      setVal('default-template', settings.defaultTemplate || 'brief');
      setVal('summary-length', settings.summaryLength || 'medium');
      setChecked('include-images', settings.includeImages !== false);
      setChecked('include-tables', settings.includeTables !== false);
      var f = settings.exportFormats || {};
      setChecked('export-txt', f.txt !== false);
      setChecked('export-md', f.md !== false);
      setChecked('export-word', f.word === true);
    });
  }

  function setVal(id, v) { var el = $(id); if (el) el.value = v; }
  function setChecked(id, v) { var el = $(id); if (el) el.checked = !!v; }

  function loadMaskedKeys() {
    SWE.getApiKey('deepseek').then(function (k) {
      var el = $('masked-deepseek'); if (!el) return;
      el.textContent = k ? SWE.maskApiKey(k) : SWE.t('settings.not_configured');
      var btn = $('save-key-deepseek'); if (btn) btn.textContent = k ? SWE.t('settings.update') : SWE.t('common.save');
    });
    SWE.getApiKey('qwen').then(function (k) {
      var el = $('masked-qwen'); if (!el) return;
      el.textContent = k ? SWE.maskApiKey(k) : SWE.t('settings.not_configured');
      var btn = $('save-key-qwen'); if (btn) btn.textContent = k ? SWE.t('settings.update') : SWE.t('common.save');
    });
  }

  function saveApiKey(provider) {
    var input = $('api-key-' + provider);
    if (!input || !input.value.trim()) return;
    SWE.saveApiKey(provider, input.value).then(function () {
      input.value = '';
      loadMaskedKeys();
      showSaveMsg(SWE.t('settings.api_key_saved'), 'success');
    });
  }

  function testConnection(provider) {
    var input = $('api-key-' + provider);
    var key = input && input.value.trim();
    if (!key) {
      SWE.getApiKey(provider).then(function (sk) {
        if (!sk) { showTest(SWE.t('settings.config_first'), 'error'); return; }
        doTest(provider, sk);
      });
    } else {
      doTest(provider, key);
    }
  }

  function doTest(provider, key) {
    var el = $('test-result');
    el.textContent = SWE.t('settings.testing');
    el.style.color = '';
    SWE.testConnection(provider, key).then(function (ret) {
      el.textContent = ret.success ? SWE.t('settings.connection_ok') : (SWE.t('settings.connection_failed') + ret.message);
      el.style.color = ret.success ? 'green' : 'red';
    });
  }

  function showTest(msg, type) {
    var el = $('test-result');
    el.textContent = msg;
    el.style.color = type === 'error' ? 'red' : '';
  }

  function saveSettings() {
    currentSettings = {
      defaultProvider: $('default-provider').value,
      defaultModel: $('default-model').value,
      triggers: {
        edgeTab: !!$('trigger-edge-tab').checked,
        contextMenu: !!$('trigger-context-menu').checked,
        keyboard: !!$('trigger-keyboard').checked,
        floatingBtn: !!$('trigger-floating-btn').checked
      },
      defaultTemplate: $('default-template').value,
      summaryLength: $('summary-length').value,
      includeImages: !!$('include-images').checked,
      includeTables: !!$('include-tables').checked,
      exportFormats: {
        txt: !!$('export-txt').checked,
        md: !!$('export-md').checked,
        word: !!$('export-word').checked
      }
    };
    SWE.saveSettings(currentSettings, function () {
      showSaveMsg(SWE.t('settings.saved'), 'success');
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs && tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { type: 'settings:updated', payload: currentSettings });
      });
    });
  }

  function showSaveMsg(msg, type) {
    var el = $('save-msg'); if (!el) return;
    el.textContent = msg;
    el.className = 'swe-s-save-msg swe-s-save-msg--show' + (type === 'error' ? ' swe-s-save-msg--error' : '');
    setTimeout(function () { el.className = 'swe-s-save-msg'; }, 2000);
  }

  function loadRules() {
    SWE.getRules(function (rules) { renderRules(rules || []); });
  }

  function renderRules(rules) {
    var list = $('rules-list');
    list.innerHTML = '';
    if (!rules || rules.length === 0) {
      list.innerHTML = '<p class="swe-s-hint">' + SWE.t('settings.no_rules') + '</p>';
      return;
    }
    rules.forEach(function (rule) {
      var card = document.createElement('div');
      card.className = 'swe-s-rule-card';
      var ps = rule.prompt ? (rule.prompt.length > 80 ? rule.prompt.slice(0, 80) + '...' : rule.prompt) : '';
      card.innerHTML = '<div class="swe-s-rule-card__header"><div class="swe-s-rule-card__name">' + esc(rule.name) +
        '</div><div class="swe-s-rule-card__actions">' +
        '<button class="swe-s-btn swe-s-btn--secondary swe-s-btn--sm" data-edit="' + esc(rule.id) + '">' + SWE.t('settings.edit') + '</button>' +
        '<button class="swe-s-btn swe-s-btn--ghost swe-s-btn--sm" data-del="' + esc(rule.id) + '">' + SWE.t('settings.delete') + '</button></div></div>' +
        '<div class="swe-s-rule-card__meta">URL: ' + esc(rule.urlPattern || SWE.t('settings.all_pages')) + '</div>' +
        (ps ? '<div class="swe-s-rule-card__meta">' + esc(ps) + '</div>' : '');
      list.appendChild(card);
    });
    list.querySelectorAll('[data-edit]').forEach(function (b) {
      b.addEventListener('click', function () { openRuleForm(b.getAttribute('data-edit')); });
    });
    list.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () { deleteRule(b.getAttribute('data-del')); });
    });
  }

  function openRuleForm(ruleId) {
    $('rule-form-title').textContent = ruleId ? SWE.t('settings.edit_rule') : SWE.t('settings.add_rule_form');
    $('rule-form').hidden = false;
    $('rule-edit-id').value = ruleId || '';
    if (ruleId) {
      SWE.getRules(function (rules) {
        var r = rules.find(function (x) { return x.id === ruleId; });
        if (r) {
          $('rule-name').value = r.name || '';
          $('rule-url').value = r.urlPattern || '';
          $('rule-prompt').value = r.prompt || '';
          $('rule-mode').value = r.extractionMode || 'fullPage';
          $('rule-images').checked = r.includeImages !== false;
          $('rule-tables').checked = r.includeTables !== false;
        }
      });
    } else {
      $('rule-name').value = ''; $('rule-url').value = ''; $('rule-prompt').value = '';
      $('rule-mode').value = 'fullPage'; $('rule-images').checked = true; $('rule-tables').checked = true;
    }
  }

  function saveRuleForm() {
    var rule = {
      id: $('rule-edit-id').value || SWE.uuid(),
      name: $('rule-name').value.trim(),
      urlPattern: $('rule-url').value.trim(),
      prompt: $('rule-prompt').value,
      extractionMode: $('rule-mode').value,
      includeImages: !!$('rule-images').checked,
      includeTables: !!$('rule-tables').checked,
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    if (!rule.name) { showSaveMsg(SWE.t('settings.rule_name_required'), 'error'); return; }
    SWE.getRules(function (rules) {
      rules = rules || [];
      var idx = rules.findIndex(function (x) { return x.id === rule.id; });
      if (idx !== -1) rules[idx] = rule; else rules.push(rule);
      SWE.saveRules(rules, function () { renderRules(rules); $('rule-form').hidden = true; showSaveMsg(SWE.t('settings.rule_saved'), 'success'); });
    });
  }

  function deleteRule(id) {
    if (!confirm(SWE.t('settings.delete_confirm'))) return;
    SWE.getRules(function (rules) {
      rules = (rules || []).filter(function (x) { return x.id !== id; });
      SWE.saveRules(rules, function () { renderRules(rules); showSaveMsg(SWE.t('settings.rule_deleted'), 'success'); });
    });
  }

  function exportRules() {
    SWE.getRules(function (rules) { SWE.exportRulesToJson(rules || []); });
  }

  function importRules(input) {
    var file = input.files && input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      var res = SWE.importRulesFromJson(e.target.result);
      if (!res.success) { showSaveMsg(SWE.t('settings.import_failed') + res.error, 'error'); return; }
      SWE.getRules(function (existing) {
        existing = existing || [];
        var merged = existing.concat(res.rules);
        SWE.saveRules(merged, function () { renderRules(merged); showSaveMsg(SWE.t('settings.rules_imported'), 'success'); });
      });
    };
    reader.readAsText(file);
    input.value = '';
  }

  function changeLanguage(lang) {
    SWE.saveLang(lang, function () { currentLang = lang; showSaveMsg(SWE.t('settings.lang_switched'), 'success'); });
  }

  function switchNav(name) {
    document.querySelectorAll('.swe-s-nav-item').forEach(function (n) {
      n.classList.toggle('swe-s-nav-item--active', n.getAttribute('data-nav') === name);
    });
    document.querySelectorAll('.swe-s-section').forEach(function (s) { s.hidden = s.id !== 'sec-' + name; });
  }

  function esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function bindEvents() {
    $('save-settings').addEventListener('click', saveSettings);
    $('save-key-deepseek').addEventListener('click', function () { saveApiKey('deepseek'); });
    $('save-key-qwen').addEventListener('click', function () { saveApiKey('qwen'); });
    $('test-conn-deepseek').addEventListener('click', function () { testConnection('deepseek'); });
    $('test-conn-qwen').addEventListener('click', function () { testConnection('qwen'); });
    $('add-rule').addEventListener('click', function () { openRuleForm(null); });
    $('rule-save').addEventListener('click', saveRuleForm);
    $('rule-cancel').addEventListener('click', function () { $('rule-form').hidden = true; });
    $('rule-form-mask').addEventListener('click', function () { $('rule-form').hidden = true; });
    $('export-rules').addEventListener('click', exportRules);
    $('import-rules-btn').addEventListener('click', function () { $('import-rules-input').click(); });
    $('import-rules-input').addEventListener('change', function () { importRules(this); });
    $('ui-language').addEventListener('change', function () { changeLanguage(this.value); });
    $('shortcut-link').addEventListener('click', function (e) {
      e.preventDefault();
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });
    document.querySelectorAll('.swe-s-nav-item').forEach(function (n) {
      n.addEventListener('click', function (e) {
        e.preventDefault();
        switchNav(n.getAttribute('data-nav'));
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
