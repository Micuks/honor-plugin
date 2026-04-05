/**
 * 王者营地认证
 *
 * 自动桥接（QQ扫码→营地token）因 QQ 安全限制不可行：
 *   - graph.qq.com/authorize 需要 graph 域的会话 cookie
 *   - 能产出 graph 会话的 appid (716027609) 的 ptqrlogin 已被封禁
 *   - 能正常扫码的 appid (715030901) 只产出 qun.qq.com 会话
 *
 * 当前方案：手动绑定 userId + token（抓包王者营地 App）
 */
import axios from "axios";

const CampAuth = {
  /**
   * 用 accessToken + openId 登录王者营地
   * 保留此方法以备未来桥接方案可用时使用
   */
  async campLogin(accessToken, openId) {
    const res = await axios.post(
      "https://ssl.kohsocialapp.qq.com:10001/user/login",
      new URLSearchParams({
        accessToken,
        openId,
        loginType: "openSdk",
        cSystem: "android",
        gameId: "20001",
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          NOENCRYPT: "1",
          "User-Agent": "okhttp/4.9.1",
        },
        timeout: 15000,
        validateStatus: null,
      }
    );

    const data = res.data;
    if (!data || data.returnCode !== 0) {
      const msg = data?.returnMsg || `returnCode=${data?.returnCode}`;
      throw new Error(`营地登录失败: ${msg}`);
    }

    return {
      token: data.data.token,
      userId: data.data.userId,
      userName: data.data.userName || "",
    };
  },
};

export default CampAuth;
