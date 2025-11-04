/**
 * Translation Cache System
 *
 * High-performance caching system for translations to reduce API calls
 * and improve response times. Supports TTL, LRU eviction, and persistence.
 *
 * @module automation/translation/translation-cache
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class TranslationCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000; // Maximum cache entries
    this.ttl = options.ttl || 7 * 24 * 60 * 60 * 1000; // 7 days default TTL
    this.persistPath = options.persistPath || path.join(__dirname, '../../.cache/translations.json');

    this.cache = new Map();
    this.accessOrder = []; // For LRU eviction

    // Statistics
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      stores: 0
    };

    // Load persisted cache on initialization
    this._loadPersistedCache();
  }

  /**
   * Generate cache key from translation parameters
   *
   * @param {string} text - Original text
   * @param {string} targetLang - Target language
   * @param {Object} options - Translation options
   * @returns {string} Cache key hash
   */
  generateKey(text, targetLang, options = {}) {
    const keyData = {
      text: text.trim(),
      targetLang,
      formality: options.formality || 'default',
      preserveFormatting: options.preserveFormatting || false
    };

    const keyString = JSON.stringify(keyData);
    return crypto.createHash('sha256').update(keyString).digest('hex');
  }

  /**
   * Get cached translation
   *
   * @param {string} key - Cache key
   * @returns {Object|null} Cached translation or null if not found/expired
   */
  get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      return null;
    }

    // Update access order for LRU
    this._updateAccessOrder(key);
    this.stats.hits++;

    return entry.data;
  }

  /**
   * Store translation in cache
   *
   * @param {string} key - Cache key
   * @param {Object} data - Translation data to cache
   */
  set(key, data) {
    // Check if we need to evict entries (LRU)
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this._evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    this._updateAccessOrder(key);
    this.stats.stores++;

    // Persist cache periodically (every 10 stores)
    if (this.stats.stores % 10 === 0) {
      this._persistCache();
    }
  }

  /**
   * Check if translation exists in cache
   *
   * @param {string} key - Cache key
   * @returns {boolean} True if cached and not expired
   */
  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check expiration
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove entry from cache
   *
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
    this.accessOrder = this.accessOrder.filter(k => k !== key);
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
    this.accessOrder = [];
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      stores: 0
    };
    this._persistCache(); // Persist empty cache
  }

  /**
   * Get cache statistics
   *
   * @returns {Object} Cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: `${hitRate}%`,
      memoryUsage: this._estimateMemoryUsage()
    };
  }

  /**
   * Prune expired entries
   *
   * @returns {number} Number of entries removed
   */
  prune() {
    const now = Date.now();
    let pruned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        pruned++;
      }
    }

    if (pruned > 0) {
      this.stats.evictions += pruned;
      this.accessOrder = this.accessOrder.filter(key => this.cache.has(key));
      this._persistCache();
    }

    return pruned;
  }

  /**
   * Update access order for LRU eviction
   *
   * @private
   * @param {string} key - Cache key
   */
  _updateAccessOrder(key) {
    // Remove key from current position
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    // Add to end (most recently used)
    this.accessOrder.push(key);
  }

  /**
   * Evict least recently used entry
   *
   * @private
   */
  _evictLRU() {
    if (this.accessOrder.length === 0) return;

    const lruKey = this.accessOrder.shift();
    this.cache.delete(lruKey);
    this.stats.evictions++;

    console.log(`[Cache] Evicted LRU entry: ${lruKey.substring(0, 8)}...`);
  }

  /**
   * Persist cache to disk
   *
   * @private
   */
  _persistCache() {
    try {
      const cacheData = {
        version: '1.0',
        timestamp: Date.now(),
        entries: Array.from(this.cache.entries()),
        accessOrder: this.accessOrder,
        stats: this.stats
      };

      // Ensure directory exists
      const dir = path.dirname(this.persistPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.persistPath, JSON.stringify(cacheData, null, 2));
    } catch (error) {
      console.error('[Cache] Failed to persist cache:', error.message);
    }
  }

  /**
   * Load persisted cache from disk
   *
   * @private
   */
  _loadPersistedCache() {
    try {
      if (!fs.existsSync(this.persistPath)) {
        return; // No persisted cache
      }

      const data = JSON.parse(fs.readFileSync(this.persistPath, 'utf8'));

      // Validate version
      if (data.version !== '1.0') {
        console.warn('[Cache] Incompatible cache version, starting fresh');
        return;
      }

      // Restore cache entries
      this.cache = new Map(data.entries || []);
      this.accessOrder = data.accessOrder || [];
      this.stats = data.stats || this.stats;

      // Prune expired entries
      const pruned = this.prune();

      console.log(`[Cache] Loaded ${this.cache.size} cached translations (pruned ${pruned} expired)`);
    } catch (error) {
      console.error('[Cache] Failed to load persisted cache:', error.message);
    }
  }

  /**
   * Estimate cache memory usage
   *
   * @private
   * @returns {string} Formatted memory usage
   */
  _estimateMemoryUsage() {
    let bytes = 0;

    for (const [key, entry] of this.cache.entries()) {
      bytes += key.length * 2; // UTF-16 string
      bytes += JSON.stringify(entry).length * 2;
    }

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * Export cache for backup
   *
   * @returns {Object} Cache data
   */
  export() {
    return {
      version: '1.0',
      timestamp: Date.now(),
      entries: Array.from(this.cache.entries()),
      accessOrder: this.accessOrder,
      stats: this.stats
    };
  }

  /**
   * Import cache from backup
   *
   * @param {Object} data - Cache data to import
   */
  import(data) {
    if (data.version !== '1.0') {
      throw new Error('Incompatible cache version');
    }

    this.cache = new Map(data.entries || []);
    this.accessOrder = data.accessOrder || [];
    this.stats = data.stats || this.stats;

    this.prune(); // Clean up expired entries
    this._persistCache();

    console.log(`[Cache] Imported ${this.cache.size} cached translations`);
  }
}

module.exports = { TranslationCache };
