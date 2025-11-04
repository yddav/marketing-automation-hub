/**
 * DeepL Translation API Client
 *
 * Handles translation requests to DeepL API with authentication,
 * error handling, rate limiting, and quality validation.
 *
 * @module automation/translation/deepl-client
 */

const https = require('https');
const { TranslationCache } = require('./translation-cache');

class DeepLClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('DeepL API key is required');
    }

    this.apiKey = apiKey;
    this.baseUrl = apiKey.endsWith(':fx')
      ? 'api-free.deepl.com'  // Free tier
      : 'api.deepl.com';       // Pro tier

    this.cache = new TranslationCache();

    // Supported languages for this project
    this.supportedLanguages = {
      'ES': { name: 'Spanish', formal: false },
      'FR': { name: 'French', formal: true },
      'DE': { name: 'German', formal: true }
    };

    // Rate limiting
    this.requestsThisMinute = 0;
    this.maxRequestsPerMinute = 20; // Conservative limit
    this.rateLimitResetTime = Date.now() + 60000;
  }

  /**
   * Translate text to target language
   *
   * @param {string} text - Text to translate
   * @param {string} targetLang - Target language code (ES, FR, DE)
   * @param {Object} options - Translation options
   * @returns {Promise<Object>} Translation result with metadata
   */
  async translate(text, targetLang, options = {}) {
    if (!text || text.trim().length === 0) {
      throw new Error('Text to translate cannot be empty');
    }

    if (!this.supportedLanguages[targetLang]) {
      throw new Error(`Unsupported target language: ${targetLang}`);
    }

    // Check cache first
    const cacheKey = this.cache.generateKey(text, targetLang, options);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log(`[DeepL] Cache hit for ${targetLang}`);
      return {
        text: cached.translation,
        detectedSourceLang: cached.detectedSourceLang,
        cached: true,
        confidence: cached.confidence
      };
    }

    // Rate limiting check
    await this._checkRateLimit();

    const requestData = {
      text: [text],
      target_lang: targetLang,
      source_lang: options.sourceLang || 'EN',
      formality: this._determineFormality(targetLang, options),
      tag_handling: options.preserveFormatting ? 'html' : undefined,
      preserve_formatting: options.preserveFormatting || false
    };

    try {
      const result = await this._makeRequest('/v2/translate', requestData);

      if (!result.translations || result.translations.length === 0) {
        throw new Error('No translation returned from DeepL');
      }

      const translation = result.translations[0];

      // Calculate confidence score based on various factors
      const confidence = this._calculateConfidence(text, translation.text, targetLang);

      // Cache the result
      this.cache.set(cacheKey, {
        translation: translation.text,
        detectedSourceLang: translation.detected_source_language,
        confidence: confidence,
        timestamp: Date.now()
      });

      return {
        text: translation.text,
        detectedSourceLang: translation.detected_source_language,
        cached: false,
        confidence: confidence
      };

    } catch (error) {
      console.error('[DeepL] Translation error:', error.message);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  /**
   * Translate multiple texts in batch
   *
   * @param {Array<string>} texts - Array of texts to translate
   * @param {string} targetLang - Target language code
   * @param {Object} options - Translation options
   * @returns {Promise<Array<Object>>} Array of translation results
   */
  async translateBatch(texts, targetLang, options = {}) {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error('Texts array cannot be empty');
    }

    // Translate in parallel with concurrency limit
    const batchSize = 5;
    const results = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(text => this.translate(text, targetLang, options))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Check API usage and limits
   *
   * @returns {Promise<Object>} Usage statistics
   */
  async getUsage() {
    try {
      const result = await this._makeRequest('/v2/usage');

      return {
        characterCount: result.character_count,
        characterLimit: result.character_limit,
        percentageUsed: (result.character_count / result.character_limit * 100).toFixed(2),
        remainingCharacters: result.character_limit - result.character_count
      };
    } catch (error) {
      console.error('[DeepL] Usage check error:', error.message);
      throw error;
    }
  }

  /**
   * Validate API key
   *
   * @returns {Promise<boolean>} True if API key is valid
   */
  async validateApiKey() {
    try {
      await this.getUsage();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Make HTTP request to DeepL API
   *
   * @private
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @returns {Promise<Object>} API response
   */
  _makeRequest(endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        path: endpoint,
        method: data ? 'POST' : 'GET',
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let body = '';

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          this.requestsThisMinute++;

          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(body));
            } catch (error) {
              reject(new Error('Invalid JSON response'));
            }
          } else if (res.statusCode === 403) {
            reject(new Error('Invalid API key or insufficient permissions'));
          } else if (res.statusCode === 456) {
            reject(new Error('API quota exceeded'));
          } else if (res.statusCode === 429) {
            reject(new Error('Too many requests - rate limit exceeded'));
          } else {
            reject(new Error(`API request failed with status ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Network error: ${error.message}`));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * Check and enforce rate limiting
   *
   * @private
   */
  async _checkRateLimit() {
    const now = Date.now();

    if (now >= this.rateLimitResetTime) {
      // Reset rate limit counter
      this.requestsThisMinute = 0;
      this.rateLimitResetTime = now + 60000;
    } else if (this.requestsThisMinute >= this.maxRequestsPerMinute) {
      // Wait until rate limit resets
      const waitTime = this.rateLimitResetTime - now;
      console.log(`[DeepL] Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestsThisMinute = 0;
      this.rateLimitResetTime = Date.now() + 60000;
    }
  }

  /**
   * Determine formality level for target language
   *
   * @private
   * @param {string} targetLang - Target language code
   * @param {Object} options - Translation options
   * @returns {string|undefined} Formality level
   */
  _determineFormality(targetLang, options) {
    if (options.formality) {
      return options.formality; // Explicit override
    }

    // Default formality based on language and context
    const langConfig = this.supportedLanguages[targetLang];
    if (!langConfig) return undefined;

    // French and German default to formal for marketing content
    // Spanish defaults to informal (less vs usted)
    return langConfig.formal ? 'default' : 'less';
  }

  /**
   * Calculate confidence score for translation quality
   *
   * @private
   * @param {string} original - Original text
   * @param {string} translated - Translated text
   * @param {string} targetLang - Target language
   * @returns {number} Confidence score (0-100)
   */
  _calculateConfidence(original, translated, targetLang) {
    let confidence = 100;

    // Length ratio check (translations should be similar length)
    const lengthRatio = translated.length / original.length;
    if (lengthRatio < 0.5 || lengthRatio > 2.0) {
      confidence -= 10; // Suspiciously short or long
    }

    // Placeholder preservation check
    const originalPlaceholders = (original.match(/\{\{[^}]+\}\}/g) || []).length;
    const translatedPlaceholders = (translated.match(/\{\{[^}]+\}\}/g) || []).length;
    if (originalPlaceholders !== translatedPlaceholders) {
      confidence -= 20; // Placeholders not preserved
    }

    // URL preservation check
    const originalUrls = (original.match(/https?:\/\/[^\s]+/g) || []).length;
    const translatedUrls = (translated.match(/https?:\/\/[^\s]+/g) || []).length;
    if (originalUrls !== translatedUrls) {
      confidence -= 15; // URLs not preserved
    }

    // Hashtag preservation check
    const originalHashtags = (original.match(/#\w+/g) || []).length;
    const translatedHashtags = (translated.match(/#\w+/g) || []).length;
    if (originalHashtags > translatedHashtags) {
      confidence -= 10; // Hashtags lost
    }

    // Emoji preservation check
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    const originalEmojis = (original.match(emojiRegex) || []).length;
    const translatedEmojis = (translated.match(emojiRegex) || []).length;
    if (originalEmojis !== translatedEmojis) {
      confidence -= 5; // Emojis changed
    }

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Clear translation cache
   */
  clearCache() {
    this.cache.clear();
    console.log('[DeepL] Cache cleared');
  }

  /**
   * Get cache statistics
   *
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

module.exports = { DeepLClient };
