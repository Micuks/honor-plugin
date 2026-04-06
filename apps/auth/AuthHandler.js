/**
 * 营地绑定 + Token 池 + 查询（图片渲染）
 */
import CampApi from "../../components/api/CampApi.js";
import UserStore from "../../model/UserStore.js";
import TokenPool from "../../model/TokenPool.js";
import Render from "../../components/Render.js";
import HeroAlias from "../../model/HeroAlias.js";

const AuthHandler = {
  // ===================== 绑定 =====================

  async campLogin(e) {
    const qqId = String(e.user_id);
    const campId = await UserStore.getCampId(qqId);
    if (campId) {
      const hasTk = !!(await TokenPool.getTokenForUser(campId));
      e.reply(
        `已绑定营地ID: ${campId}${hasTk ? " (有token)" : ""}\n` +
        `#我的战力 #营地信息 #荣耀帮助`
      );
    } else {
      e.reply(
        "绑定营地ID:\n" +
        "1. 打开王者营地 App →「我的」\n" +
        "2. 头像旁的数字即营地ID\n" +
        "3. 发送: #绑定营地 你的营地ID"
      );
    }
  },

  async bindCamp(e) {
    const qqId = String(e.user_id);
    const input = e.msg.replace(/^#绑定营地\s*/, "").trim();
    if (!input || !/^\d+$/.test(input)) {
      e.reply("请输入正确的营地ID（纯数字）");
      return;
    }
    try {
      await CampApi.getProfile(input);
    } catch (err) {
      e.reply(`验证失败: ${err.message}\n请确认ID是否正确`);
      return;
    }
    await UserStore.saveCampId(qqId, input);
    e.reply(`绑定成功! 营地ID: ${input}\n发送 #我的战力 查看`);
  },

  async unbindCamp(e) {
    const qqId = String(e.user_id);
    if (!(await UserStore.getCampId(qqId))) { e.reply("未绑定"); return; }
    await UserStore.removeCampId(qqId);
    e.reply("已解绑");
  },

  // ===================== Token 池 =====================

  async addToken(e) {
    const qqId = String(e.user_id);
    const input = e.msg.replace(/^#添加token\s*/i, "").trim();
    let userId, token;
    if (input.includes("&&")) {
      [userId, token] = input.split("&&").map(s => s.trim());
    } else {
      [userId, token] = input.split(/\s+/);
    }
    if (!userId || !token) {
      e.reply("格式: #添加token userId&&token\n\n抓包王者营地 App 获取 userId 和 token");
      return;
    }

    try {
      const roles = await CampApi.getUserRoles(userId);
      const roleId = roles?.[0]?.roleId || "0";
      const heroData = await CampApi.getProfileHeroList(userId, roleId, { token, userId });
      const hasPower = heroData?.heroList?.some(h => h.basicInfo?.heroFightPower > 0);

      await TokenPool.addToken(userId, token, e.isMaster ? "admin" : "user", qqId);
      await UserStore.saveCampId(qqId, userId);

      e.reply(
        hasPower
          ? `Token 添加成功! 战力数据可用\n营地ID ${userId} 已自动绑定\n发送 #我的战力 查看`
          : `Token 已添加，但未检测到战力数据\n可能该账号无排位战力，或 token 已过期`
      );
    } catch (err) {
      e.reply(`Token 验证失败: ${err.message}`);
    }
  },

  async removeToken(e) {
    if (!e.isMaster) { e.reply("仅管理员可操作"); return; }
    const id = e.msg.replace(/^#删除token\s*/i, "").trim();
    if (!id) { e.reply("用法: #删除token userId"); return; }
    await TokenPool.removeToken(id);
    e.reply(`已删除 token: ${id}`);
  },

  async poolStatus(e) {
    const status = await TokenPool.getPoolStatus();
    if (status.total === 0) {
      e.reply("Token 池为空\n#添加token userId&&token 添加");
      return;
    }
    let msg = `Token 池: ${status.valid}有效 / ${status.total}总计\n`;
    for (const entry of status.entries) {
      const v = entry.valid ? "V" : "X";
      const src = entry.source === "admin" ? "管理" : "用户";
      msg += `[${v}] ${entry.userId} (${src})\n`;
    }
    if (status.valid === 0) msg += "\n无有效token，请补充";
    e.reply(msg.trim());
  },

  // ===================== 查询（图片渲染） =====================

  async campInfo(e) {
    const qqId = String(e.user_id);
    const campId = await UserStore.getCampId(qqId);
    if (!campId) { e.reply("请先 #绑定营地 你的营地ID"); return; }

    try {
      const profile = await CampApi.getProfile(campId);
      let roleName = "未知";
      const stats = [];
      const roles = [];

      if (profile?.roleList) {
        for (const r of profile.roleList) {
          if (!roleName || roleName === "未知") roleName = r.roleName;
          roles.push({
            name: r.roleName || "未知",
            desc: r.roleJob || "",
            icon: r.roleIcon || "",
          });
        }
      }

      if (profile?.head?.mods) {
        const modMap = { 304: "战斗力", 409: "胜率", 401: "总场次", 201: "英雄数", 202: "皮肤数" };
        for (const mod of profile.head.mods) {
          if (mod.content && modMap[mod.modId]) {
            stats.push({ label: modMap[mod.modId], value: mod.content });
          }
        }
      }

      const rendered = await Render.render("hero/profile", {
        campId, roleName, stats, roles,
      }, { e, scale: 1.4 });

      if (!rendered) {
        // 降级文本
        let msg = `营地ID: ${campId}\n角色: ${roleName}\n`;
        for (const s of stats) msg += `${s.label}: ${s.value}\n`;
        e.reply(msg.trim());
      }
    } catch (err) {
      e.reply(`查询失败: ${err.message}`);
    }
  },

  async myHeroPower(e) {
    const qqId = String(e.user_id);
    const campId = await UserStore.getCampId(qqId);
    if (!campId) { e.reply("请先 #绑定营地 你的营地ID"); return; }

    try {
      let roleId = "0";
      let roleName = "";
      try {
        const rolesData = await CampApi.getUserRoles(campId);
        if (rolesData?.[0]) {
          roleId = rolesData[0].roleId;
          roleName = rolesData[0].roleName || "";
        }
      } catch { /* 兜底 */ }

      const userCred = await TokenPool.getTokenForUser(campId);
      const heroData = await CampApi.getProfileHeroList(campId, roleId, userCred || undefined);

      if (!heroData?.heroList?.length) {
        e.reply("未查询到英雄数据，该用户可能隐藏了资料");
        return;
      }

      const hasPower = heroData.heroList.some(h => h.basicInfo?.heroFightPower > 0);
      const maxPower = Math.max(1, ...heroData.heroList.map(h => h.basicInfo?.heroFightPower || 0));

      const heroes = heroData.heroList
        .sort((a, b) => {
          const pa = a.basicInfo?.heroFightPower || 0;
          const pb = b.basicInfo?.heroFightPower || 0;
          if (pa !== pb) return pb - pa;
          return (b.basicInfo?.playNum || 0) - (a.basicInfo?.playNum || 0);
        })
        .slice(0, 15)
        .map(h => {
          const info = h.basicInfo;
          const honor = h.honorTitle;
          return {
            name: info.title || "?",
            icon: info.heroPicV2 || info.heroIcon || "",
            power: info.heroFightPower || 0,
            powerPct: maxPower > 0 ? Math.round(((info.heroFightPower || 0) / maxPower) * 100) : 0,
            playNum: info.playNum || 0,
            winRate: info.winRate || "0%",
            honor: honor?.desc?.abbr || honor?.type || "",
          };
        });

      const rendered = await Render.render("hero/power", {
        campId, roleName, hasPower, heroes,
      }, { e, scale: 1.4 });

      if (!rendered) {
        // 降级文本
        let msg = hasPower ? `英雄战力 Top${heroes.length}:\n` : `英雄数据 Top${heroes.length}:\n`;
        for (const h of heroes) {
          msg += hasPower
            ? `${h.name} ${h.power}${h.honor ? " [" + h.honor + "]" : ""}\n`
            : `${h.name} ${h.playNum}场 ${h.winRate}\n`;
        }
        if (!hasPower) msg += "\n添加token解锁战力: #添加token userId&&token";
        e.reply(msg.trim());
      }
    } catch (err) {
      if (err.message.includes("过期")) {
        await TokenPool.markInvalid(campId);
        e.reply("Token 已过期，已标记失效\n请重新 #添加token userId&&token");
      } else {
        e.reply(`查询失败: ${err.message}`);
      }
    }
  },

  // ===================== 别名管理 =====================

  async addAlias(e) {
    const input = e.msg.replace(/^#添加别名\s*/, "").trim();
    const parts = input.split(/\s+/);
    if (parts.length < 2) {
      e.reply("格式: #添加别名 英雄名 别名\n例如: #添加别名 镜 小镜子");
      return;
    }
    const heroName = parts[0];
    const alias = parts[1];
    await HeroAlias.addUserAlias(alias, heroName);
    e.reply(`已添加别名: ${alias} → ${heroName}`);
  },

  async removeAlias(e) {
    const alias = e.msg.replace(/^#删除别名\s*/, "").trim();
    if (!alias) {
      e.reply("格式: #删除别名 别名");
      return;
    }
    await HeroAlias.removeUserAlias(alias);
    e.reply(`已删除别名: ${alias}`);
  },

  async listAlias(e) {
    const userAliases = await HeroAlias.getUserAliases();
    const entries = Object.entries(userAliases);
    if (entries.length === 0) {
      e.reply("暂无自定义别名\n添加: #添加别名 英雄名 别名");
      return;
    }
    let msg = "自定义别名:\n";
    for (const [alias, hero] of entries) {
      msg += `${alias} → ${hero}\n`;
    }
    e.reply(msg.trim());
  },
};

export default AuthHandler;
