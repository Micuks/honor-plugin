/**
 * 王者营地 API 客户端
 *
 * 双模式:
 *   1. 用户 token (token 池) → 查自己的数据含 heroFightPower
 *   2. 共享 token (t1qq.com) → 查公开数据，heroFightPower 被置零
 *
 * SSO 头让服务端走 H5 模式，noencrypt:1 有效，返回明文 JSON
 */
import axios from "axios";

const MAIN_URL = "https://kohcamp.qq.com";
const GAME_URL = "https://ssl.kohsocialapp.qq.com:10001";
const TOKEN_URL = "https://api.t1qq.com/api/tool/wzrr/wztoken";
const SERVICE_USERID = "2118558336";

// ===================== 共享 Token =====================

let cachedToken = null;
let tokenExpireTime = 0;
const TOKEN_TTL = 5 * 60 * 1000;

async function getSharedToken() {
  if (cachedToken && Date.now() < tokenExpireTime) return cachedToken;
  const res = await axios.get(TOKEN_URL, { timeout: 10000, validateStatus: null });
  let data = res.data;
  if (typeof data === "string") {
    try { data = JSON.parse(data); } catch {
      const m = /"token"\s*:\s*"([^"]+)"/.exec(data);
      if (m) data = { code: 200, token: m[1] };
    }
  }
  if (!data?.token) throw new Error("获取共享 token 失败");
  cachedToken = data.token;
  tokenExpireTime = Date.now() + TOKEN_TTL;
  return cachedToken;
}

// ===================== SSO 请求头 =====================

function buildSSOHeaders(token, userId) {
  return {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 Mobile Safari/537.36 QQ/8.9.63",
    "origin": "https://yingdi.qq.com",
    "Referer": "https://yingdi.qq.com/",
    "noencrypt": "1",
    "token": token,
    "userid": userId,
    "cgameid": "20001",
    "gameid": "20001",
    "source": "smoba_zhushou",
    "algorithm": "v2",
    "encode": "2",
    "timestamp": String(Math.floor(Date.now() / 1000)),
    "appid": "1105200115",
  };
}

// ===================== 请求方法 =====================

/**
 * @param {string} path
 * @param {object} body
 * @param {{token: string, userId: string}} [cred] - 用户凭证，不传则用共享 token
 */
async function campRequest(path, body, cred) {
  const token = cred?.token || (await getSharedToken());
  const userId = cred?.userId || SERVICE_USERID;
  const headers = buildSSOHeaders(token, userId);

  const res = await axios.post(`${MAIN_URL}${path}`, body, {
    headers, timeout: 15000, validateStatus: null,
  });

  if (res.headers["campencrypt"] === "true") {
    throw new Error("响应被加密，token 可能已失效");
  }

  const data = res.data;
  if (!data || data.returnCode === undefined) throw new Error("无返回数据");
  const rc = Number(data.returnCode);
  if (rc === -30003) throw new Error("token 已过期，请重新添加");
  if (rc !== 0) throw new Error(data.returnMsg || `错误码 ${rc}`);
  return data.data;
}

// ===================== API 接口 =====================

const CampApi = {
  getSharedToken,

  /** 获取角色列表 (走 game URL，不受加密影响) */
  async getUserRoles(campId) {
    const token = await getSharedToken();
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "okhttp/4.9.1",
      "noencrypt": "1",
      "token": token,
      "userid": SERVICE_USERID,
      "cgameid": "20001",
    };
    const res = await axios.post(
      `${GAME_URL}/game/allrolelistv3`,
      new URLSearchParams({ friendUserId: campId, token, userId: SERVICE_USERID }).toString(),
      { headers, timeout: 15000, validateStatus: null }
    );
    if (res.data?.returnCode !== 0) throw new Error(res.data?.returnMsg || "获取角色失败");
    return res.data.data;
  },

  /** 个人资料 */
  async getProfile(campId, cred) {
    return campRequest("/game/koh/profile", {
      targetUserId: campId, targetRoleId: "0",
      resVersion: "3", recommendPrivacy: "0", apiVersion: "2",
    }, cred);
  },

  /** 英雄列表 (含 heroFightPower — 需用户自己的 token 才有值) */
  async getProfileHeroList(campId, roleId, cred) {
    return campRequest("/game/profile/herolist", {
      targetUserId: campId, recommendPrivacy: 0, targetRoleId: roleId || "0",
    }, cred);
  },

  /** 战绩列表 */
  async getBattleHistory(campId, option, cred) {
    return campRequest("/game/morebattlelist", {
      lastTime: 0, recommendPrivacy: 0, apiVersion: 5,
      friendUserId: campId, option: option || 0,
    }, cred);
  },
};

export default CampApi;
