/**
 * QQ ptlogin2 扫码登录
 * 基于 qq-login-qrcode 协议实现
 *
 * 支持两种模式:
 *   1. 普通 QQ 登录 (默认)
 *   2. OAuth 桥接模式 (用于换取第三方应用的 accessToken)
 */
import axios from "axios";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36";

const PTUI_CB_REGEX = /ptuiCB\('(.*?)'\)/;

// 普通 QQ 登录参数
const DEFAULT_CONFIG = {
  appid: 715030901,
  daid: 73,
  pt_3rd_aid: 0,
  redirectUrl: "https://qun.qq.com/",
};

// OAuth 桥接参数 (用于获取 graph.qq.com 的 p_skey)
const OAUTH_BRIDGE_CONFIG = {
  appid: 716027609,
  daid: 383,
  pt_3rd_aid: 1105200115, // 王者营地 QQ互联 appid
  redirectUrl: "https://graph.qq.com/oauth2.0/login_jump",
};

/**
 * hash33 算法：从 qrsig 计算 ptqrtoken
 */
function generateQrToken(qrsig) {
  let hash = 0;
  for (let i = 0; i < qrsig.length; i++) {
    hash += ((hash << 5) & 2147483647) + qrsig.charCodeAt(i);
    hash &= 2147483647;
  }
  return hash & 2147483647;
}

/**
 * 从 Set-Cookie 头解析 cookies
 */
function parseCookies(setCookieHeaders) {
  if (!setCookieHeaders) return {};
  const arr = Array.isArray(setCookieHeaders)
    ? setCookieHeaders
    : [setCookieHeaders];
  return arr.reduce((acc, str) => {
    const [keyValue] = str.split(";");
    if (!keyValue) return acc;
    const eqIdx = keyValue.indexOf("=");
    if (eqIdx === -1) return acc;
    const key = keyValue.slice(0, eqIdx).trim();
    const value = keyValue.slice(eqIdx + 1).trim();
    if (key && value) acc[key] = value;
    return acc;
  }, {});
}

/**
 * 解析 ptqrlogin 返回的 ptuiCB 回调
 */
function parseLoginResponse(data) {
  const match = PTUI_CB_REGEX.exec(data);
  if (!match || !match[1]) {
    throw new Error("Failed to parse ptuiCB response");
  }
  const parts = match[1].replace(/', '/g, "','").split("','");
  return {
    code: parseInt(parts[0], 10),
    redirect: parts[2] || "",
    msg: parts[4] || "",
    nickname: parts[5] || "",
  };
}

/**
 * 追踪整个 302 重定向链，收集所有 Set-Cookie
 * check_sig → 中间跳转 → 最终页，每一步都可能设置关键 cookie (如 pt_key)
 */
async function followRedirectChain(url, maxHops = 5) {
  let allCookies = {};

  for (let i = 0; i < maxHops; i++) {
    if (!url) break;

    let res;
    try {
      res = await axios.get(url, {
        maxRedirects: 0,
        validateStatus: null,
        headers: { "User-Agent": USER_AGENT },
      });
    } catch (err) {
      if (err.response) {
        res = err.response;
      } else {
        break;
      }
    }

    // 收集这一跳的 cookies
    const hopCookies = parseCookies(res.headers["set-cookie"]);
    allCookies = { ...allCookies, ...hopCookies };

    // 如果不是 3xx，停止
    if (res.status < 300 || res.status >= 400) break;

    // 跟随下一跳
    url = res.headers["location"] || null;
  }

  return allCookies;
}

const QQLogin = {
  /** OAuth 桥接配置（王者营地） */
  OAUTH_BRIDGE_CONFIG,
  /** 默认配置 */
  DEFAULT_CONFIG,

  /**
   * 生成 QQ 扫码登录二维码
   * @param {object} config - 登录配置 (DEFAULT_CONFIG 或 OAUTH_BRIDGE_CONFIG)
   * @returns {Promise<{qrsig: string, image: string, buffer: Buffer}>}
   */
  async generateQrCode(config = OAUTH_BRIDGE_CONFIG) {
    const { appid, daid, pt_3rd_aid, redirectUrl } = config;

    const res = await axios.get("https://ssl.ptlogin2.qq.com/ptqrshow", {
      params: {
        appid,
        e: 2,
        l: "M",
        s: 3,
        d: 72,
        v: 4,
        t: Math.random(),
        daid,
        pt_3rd_aid,
        u1: redirectUrl,
      },
      headers: {
        "User-Agent": USER_AGENT,
        Referer: redirectUrl,
      },
      responseType: "arraybuffer",
      validateStatus: null,
    });

    const setCookie = res.headers["set-cookie"];
    if (!setCookie) {
      throw new Error("获取二维码失败：未返回 qrsig");
    }
    const cookies = parseCookies(setCookie);
    const qrsig = cookies.qrsig;
    if (!qrsig) {
      throw new Error("获取二维码失败：qrsig 为空");
    }

    const buffer = Buffer.from(res.data);
    const image = `data:image/png;base64,${buffer.toString("base64")}`;

    return { qrsig, image, buffer };
  },

  /**
   * 轮询扫码状态
   * @param {string} qrsig
   * @param {object} config - 登录配置，需与 generateQrCode 一致
   * @returns {Promise<{code: number, msg: string, uin?: string, cookies?: object, nickname?: string}>}
   *   code: 0=成功, 65=过期, 66=等待扫码, 67=等待确认
   */
  async checkLoginStatus(qrsig, config = OAUTH_BRIDGE_CONFIG) {
    const { appid, daid, redirectUrl } = config;
    const ptqrtoken = generateQrToken(qrsig);

    const res = await axios.get("https://ssl.ptlogin2.qq.com/ptqrlogin", {
      params: {
        u1: redirectUrl,
        ptqrtoken: ptqrtoken.toString(),
        ptredirect: "1",
        from_ui: "1",
        ptlang: "2052",
        action: `0-0-${Date.now()}`,
        pt_uistyle: "40",
        aid: appid,
        has_onekey: "1",
        js_ver: 26030415,
        js_type: 1,
        login_sig: "",
        daid,
        o1vId: "54a154c5b590e62bf5974893083a9782",
        pt_js_version: "b515fdc3",
      },
      headers: {
        Cookie: `qrsig=${qrsig}`,
        "User-Agent": USER_AGENT,
        Referer: redirectUrl,
      },
      validateStatus: null,
    });

    const parsed = parseLoginResponse(res.data);

    if (parsed.code !== 0) {
      return { code: parsed.code, msg: parsed.msg };
    }

    // 成功：提取 QQ 号和 cookies
    const uinMatch = /uin=(\d+)&/.exec(res.data);
    const uin = uinMatch ? uinMatch[1] : "";
    const loginCookies = parseCookies(res.headers["set-cookie"]);

    // 跟随整个重定向链收集所有 cookies (check_sig → 中间跳转 → 最终页)
    // pt_key 等关键 cookie 可能在链中的任意一跳设置
    let redirectCookies = {};
    if (parsed.redirect) {
      redirectCookies = await followRedirectChain(parsed.redirect);
    }

    const allCookies = { ...loginCookies, ...redirectCookies };

    return {
      code: 0,
      msg: parsed.msg,
      uin,
      nickname: parsed.nickname,
      cookies: allCookies,
    };
  },

  /** 工具方法：暴露给外部使用 */
  parseCookies,
  generateQrToken,
};

export default QQLogin;
