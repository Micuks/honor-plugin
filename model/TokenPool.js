/**
 * 营地 Token 池 (Redis)
 *
 * 设计:
 *   - 管理员和用户都可贡献 token
 *   - 查询时 round-robin 选取有效 token
 *   - API 返回 auth 错误时自动标记失效
 *   - 池空时提醒
 *
 * Redis Key:
 *   honor:tokenpool → Hash { tokenId: JSON({userId, token, source, addedBy, addTime, valid, lastUsed, failCount}) }
 *   honor:tokenpool:idx → 当前 round-robin 索引
 */
import { Data } from "#honor";

const POOL_KEY = "honor:tokenpool";
const IDX_KEY = "honor:tokenpool:idx";

const TokenPool = {
  /**
   * 添加 token 到池中
   * @param {string} campUserId - 营地 userId
   * @param {string} token - 营地 token
   * @param {string} source - "admin" 或 "user"
   * @param {string} addedBy - 添加者的 QQ 号
   * @returns {string} tokenId
   */
  async addToken(campUserId, token, source, addedBy) {
    const tokenId = `${campUserId}`;
    const entry = {
      userId: campUserId,
      token,
      source,
      addedBy,
      addTime: new Date().toISOString(),
      valid: true,
      lastUsed: null,
      failCount: 0,
    };
    await redis.hSet(POOL_KEY, tokenId, JSON.stringify(entry));
    return tokenId;
  },

  /**
   * 获取池中所有 token 条目
   */
  async getAllEntries() {
    const raw = await redis.hGetAll(POOL_KEY);
    if (!raw || Object.keys(raw).length === 0) return [];
    return Object.entries(raw).map(([id, json]) => {
      try {
        return { id, ...JSON.parse(json) };
      } catch {
        return null;
      }
    }).filter(Boolean);
  },

  /**
   * 获取所有有效 token
   */
  async getValidEntries() {
    const all = await TokenPool.getAllEntries();
    return all.filter(e => e.valid);
  },

  /**
   * Round-robin 获取下一个有效 token
   * @returns {{ userId: string, token: string } | null}
   */
  async getNextToken() {
    const valid = await TokenPool.getValidEntries();
    if (valid.length === 0) return null;

    // round-robin
    let idx = 0;
    try {
      const raw = await redis.get(IDX_KEY);
      idx = raw ? parseInt(raw, 10) : 0;
    } catch { /* ignore */ }

    const entry = valid[idx % valid.length];
    await redis.set(IDX_KEY, String((idx + 1) % valid.length));

    // 更新 lastUsed
    entry.lastUsed = new Date().toISOString();
    await redis.hSet(POOL_KEY, entry.id, JSON.stringify(entry));

    return { userId: entry.userId, token: entry.token, id: entry.id };
  },

  /**
   * 标记 token 失效（auth 错误时调用）
   */
  async markInvalid(tokenId) {
    const raw = await redis.hGet(POOL_KEY, tokenId);
    if (!raw) return;
    try {
      const entry = JSON.parse(raw);
      entry.valid = false;
      entry.failCount = (entry.failCount || 0) + 1;
      entry.invalidTime = new Date().toISOString();
      await redis.hSet(POOL_KEY, tokenId, JSON.stringify(entry));
    } catch { /* ignore */ }
  },

  /**
   * 移除指定 token
   */
  async removeToken(tokenId) {
    await redis.hDel(POOL_KEY, tokenId);
  },

  /**
   * 重新激活 token（更新 token 值后重新标记有效）
   */
  async reactivateToken(tokenId, newToken) {
    const raw = await redis.hGet(POOL_KEY, tokenId);
    if (!raw) return false;
    try {
      const entry = JSON.parse(raw);
      entry.token = newToken;
      entry.valid = true;
      entry.failCount = 0;
      entry.lastUsed = null;
      delete entry.invalidTime;
      await redis.hSet(POOL_KEY, tokenId, JSON.stringify(entry));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 按营地 userId 查找有效 token（用于查自己的战力）
   * @returns {{ userId: string, token: string } | null}
   */
  async getTokenForUser(campUserId) {
    const raw = await redis.hGet(POOL_KEY, campUserId);
    if (!raw) return null;
    try {
      const entry = JSON.parse(raw);
      if (!entry.valid) return null;
      return { userId: entry.userId, token: entry.token };
    } catch {
      return null;
    }
  },

  /**
   * 获取池状态摘要
   */
  async getPoolStatus() {
    const all = await TokenPool.getAllEntries();
    const valid = all.filter(e => e.valid);
    const invalid = all.filter(e => !e.valid);
    return {
      total: all.length,
      valid: valid.length,
      invalid: invalid.length,
      entries: all,
    };
  },
};

export default TokenPool;
