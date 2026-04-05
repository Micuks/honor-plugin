/**
 * 用户数据存储 (Redis)
 *
 * Key 设计:
 *   honor:bindcamp:{qqId}     → 营地ID (字符串)
 *   honor:config:{qqId}       → 用户偏好 {platform}
 */
import { Data } from "#honor";

const LONG_EXPIRE = 365 * 24 * 3600; // 1 年

const UserStore = {
  /**
   * 绑定营地ID
   */
  async saveCampId(qqId, campId) {
    await Data.setCacheJSON(`honor:bindcamp:${qqId}`, { campId, bindTime: new Date().toISOString() }, LONG_EXPIRE);
  },

  /**
   * 获取绑定的营地ID
   * @returns {Promise<string | null>}
   */
  async getCampId(qqId) {
    const data = await Data.getCacheJSON(`honor:bindcamp:${qqId}`);
    return data?.campId || null;
  },

  /**
   * 获取绑定信息
   */
  async getBindInfo(qqId) {
    const data = await Data.getCacheJSON(`honor:bindcamp:${qqId}`);
    return data?.campId ? data : null;
  },

  /**
   * 解绑
   */
  async removeCampId(qqId) {
    await redis.del(`honor:bindcamp:${qqId}`);
  },

  /**
   * 保存用户平台偏好
   */
  async savePlatform(qqId, platform) {
    const config = (await Data.getCacheJSON(`honor:config:${qqId}`)) || {};
    config.platform = platform;
    await Data.setCacheJSON(`honor:config:${qqId}`, config, LONG_EXPIRE);
  },

  /**
   * 获取用户平台偏好
   */
  async getPlatform(qqId) {
    const config = await Data.getCacheJSON(`honor:config:${qqId}`);
    return config?.platform || null;
  },
};

export default UserStore;
