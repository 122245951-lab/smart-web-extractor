;(function () {
  'use strict';
  var global = typeof window !== 'undefined' ? window : self;
  global.SWE = global.SWE || {};
  var SWE = global.SWE;

  var PROVIDERS = {
    deepseek: {
      name: 'DeepSeek',
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      models: ['deepseek-chat', 'deepseek-reasoner'],
      defaultModel: 'deepseek-chat',
      requiresAuth: true,
      multimodal: false
    },
    qwen: {
      name: '通义千问',
      endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      models: ['qwen-plus', 'qwen-max', 'qwen-turbo'],
      defaultModel: 'qwen-plus',
      requiresAuth: true,
      multimodal: false
    },
    qwen_vl: {
      name: '通义千问 VL',
      endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      models: ['qwen-vl-plus', 'qwen-vl-max'],
      defaultModel: 'qwen-vl-plus',
      requiresAuth: true,
      multimodal: true
    }
  };

  SWE.PROVIDERS = PROVIDERS;

  /** 获取供应商配置 */
  SWE.getProviderConfig = function (providerId) {
    return PROVIDERS[providerId] || null;
  };

  /** 非流式调用 AI */
  SWE.callAI = async function (opts) {
    var provider = PROVIDERS[opts.provider];
    if (!provider) throw new Error('Unknown provider: ' + opts.provider);

    var apiKey = opts.apiKey;
    if (!apiKey) {
      apiKey = await SWE.getApiKey(opts.provider);
    }
    if (!apiKey) throw new Error('API Key not configured');

    var model = opts.model || provider.defaultModel;
    var messages = opts.messages || [];
    var temperature = opts.temperature != null ? opts.temperature : 0.7;
    var maxTokens = opts.maxTokens || 4096;

    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, 30000);

    try {
      var response = await fetch(provider.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: temperature,
          max_tokens: maxTokens,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 401) throw { code: 'AUTH_ERROR', message: SWE.t('error.api_key_invalid') };
      if (response.status === 429) throw { code: 'RATE_LIMIT', message: SWE.t('error.rate_limit') };
      if (response.status === 413 || response.status === 400) throw { code: 'CONTEXT_TOO_LARGE', message: SWE.t('error.context_too_large') || 'Content too long' };
      if (response.status >= 500) throw { code: 'SERVER_ERROR', message: SWE.t('error.server') };
      if (!response.ok) throw { code: 'UNKNOWN', message: SWE.t('error.unknown') + ' (HTTP ' + response.status + ')' };

      var data = await response.json();
      return data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') throw { code: 'TIMEOUT', message: SWE.t('error.timeout') };
      if (err.code) throw err;
      throw { code: 'NETWORK', message: SWE.t('error.network') };
    } finally {
      apiKey = null;
    }
  };

  /** 流式调用 AI */
  SWE.callAIStream = async function (opts, onChunk, onDone, onError) {
    var provider = PROVIDERS[opts.provider];
    if (!provider) {
      if (onError) onError(new Error('Unknown provider: ' + opts.provider));
      return;
    }

    var apiKey = opts.apiKey;
    if (!apiKey) {
      apiKey = await SWE.getApiKey(opts.provider);
    }
    if (!apiKey) {
      if (onError) onError(new Error('API Key not configured'));
      return;
    }

    var model = opts.model || provider.defaultModel;
    var messages = opts.messages || [];
    var temperature = opts.temperature != null ? opts.temperature : 0.7;

    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, 60000);

    try {
      var response = await fetch(provider.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: temperature,
          stream: true
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        if (onError) onError({ code: 'AUTH_ERROR', message: SWE.t('error.api_key_invalid') });
        return;
      }
      if (response.status === 429) {
        if (onError) onError({ code: 'RATE_LIMIT', message: SWE.t('error.rate_limit') });
        return;
      }
      if (response.status === 413 || response.status === 400) {
        if (onError) onError({ code: 'CONTEXT_TOO_LARGE', message: SWE.t('error.context_too_large') || '内容过长，请缩短后重试' });
        return;
      }
      if (response.status >= 500) {
        if (onError) onError({ code: 'SERVER_ERROR', message: SWE.t('error.server') });
        return;
      }
      if (!response.ok) {
        if (onError) onError({ code: 'UNKNOWN', message: SWE.t('error.unknown') + ' (HTTP ' + response.status + ')' });
        return;
      }

      var reader = response.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';

      while (true) {
        var result = await reader.read();
        if (result.done) break;

        buffer += decoder.decode(result.value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line || !line.startsWith('data: ')) continue;
          var jsonStr = line.substring(6);
          if (jsonStr === '[DONE]') continue;
          try {
            var parsed = JSON.parse(jsonStr);
            var content = parsed.choices &&
              parsed.choices[0] &&
              parsed.choices[0].delta &&
              parsed.choices[0].delta.content;
            if (content && onChunk) onChunk(content, parsed);
          } catch (e) { /* 忽略解析错误 */ }
        }
      }

      if (onDone) onDone();
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        if (onError) onError({ code: 'TIMEOUT', message: SWE.t('error.timeout') });
      } else if (onError) {
        if (err.code) onError(err);
        else onError({ code: 'NETWORK', message: SWE.t('error.network') });
      }
    } finally {
      apiKey = null;
    }
  };

  /** 测试连接 */
  SWE.testConnection = async function (provider, apiKey) {
    var config = PROVIDERS[provider];
    if (!config) return { success: false, message: 'Unknown provider' };

    try {
      var response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: config.defaultModel,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5
        })
      });

      if (response.ok) return { success: true, message: SWE.t('settings.test_success') };
      if (response.status === 401) return { success: false, message: SWE.t('error.api_key_invalid') };
      return { success: false, message: 'HTTP ' + response.status };
    } catch (e) {
      return { success: false, message: SWE.t('error.network') };
    }
  };
})();
