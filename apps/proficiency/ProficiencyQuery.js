import lodash from "lodash";
import ProficiencyData from "./ProficiencyData.js";
import UserStore from "../../model/UserStore.js";
import Render from "../../components/Render.js";
import HeroAlias from "../../model/HeroAlias.js";

// 平台别名映射
const OS_MAP = {
  "安卓": "a", "安": "a", "android": "a", "a": "a",
  "苹果": "i", "果": "i", "ios": "i", "i": "i",
  "华为": "a", "huawei": "a",
};

const CLIENT_MAP = {
  "qq": "qq", "q": "qq", "QQ": "qq",
  "微信": "wx", "wx": "wx", "微": "wx", "v": "wx", "vx": "wx",
  "w": "wx",
};

/**
 * 解析平台字符串 → API 参数
 * 输入: "安卓qq" / "iosv" / "苹果微信" / "aqq" / ...
 * 输出: "aqq" / "awx" / "iqq" / "iwx"
 */
function parsePlatform(str) {
  if (!str) return null;
  str = str.trim().toLowerCase();

  // 直接匹配短格式
  if (["aqq", "awx", "iqq", "iwx"].includes(str)) return str;

  // 拆分: 找第一个匹配 OS 的前缀，剩下的是 client
  let os = null, client = null;

  for (const [key, val] of Object.entries(OS_MAP)) {
    if (str.startsWith(key.toLowerCase())) {
      os = val;
      str = str.slice(key.length);
      break;
    }
  }

  for (const [key, val] of Object.entries(CLIENT_MAP)) {
    if (str === key.toLowerCase() || str === val) {
      client = val;
      break;
    }
  }

  if (os && client) return `${os}${client}`;
  if (os) return `${os}qq`; // 默认 QQ
  return null;
}

// 新版正则: #战力 英雄名 [平台]
const newReg = /^#战力\s+(.+?)(?:\s+([\u4e00-\u9fa5a-zA-Z]+))?$/;

// 旧版正则（兼容）
const oldReg =
  /^#*([^#]+?)\s*(?:honor)?(?:查战力|战力|查询|战斗力|战力查询|战斗力查询)(安卓|安|果|苹果|ios|android|iOS|Android|华为|huawei|Huawei|HUAWEI)(QQ|q|qq|微信|w|wx|WX|微|v|vx|VX)?$/;

// 设置平台正则
const setPlatformReg = /^#设置平台\s*(.+)$/;

const ProficiencyQuery = {
  /**
   * #战力 英雄名 [平台] — 新版简洁命令
   */
  async queryNew(e) {
    const match = newReg.exec(e.msg);
    if (!match) return;

    const heroName = match[1].trim();
    const platformStr = match[2] || null;

    // 确定平台: 命令指定 > 用户默认 > 提示设置
    let platform = parsePlatform(platformStr);
    if (!platform) {
      const saved = await UserStore.getPlatform(String(e.user_id));
      if (saved) {
        platform = saved;
      } else {
        e.reply("请指定平台，如: #战力 露娜 安卓qq\n或设置默认: #设置平台 安卓qq");
        return;
      }
    }

    await doQuery(e, heroName, platform);
  },

  /**
   * 旧版命令兼容: #露娜查战力安卓qq
   */
  async queryOld(e) {
    const match = oldReg.exec(e.msg);
    if (!match) return;

    const heroName = match[1].trim();
    let os = "a", client = "qq";

    if (["安卓", "安", "android", "Android"].includes(match[2])) os = "a";
    else os = "i";

    if (match[3] && ["QQ", "qq", "q"].includes(match[3])) client = "qq";
    else if (match[3]) client = "wx";

    await doQuery(e, heroName, `${os}${client}`);
  },

  /**
   * #设置平台 安卓qq
   */
  async setPlatform(e) {
    const match = setPlatformReg.exec(e.msg);
    if (!match) return;

    const platform = parsePlatform(match[1]);
    if (!platform) {
      e.reply("无法识别平台\n支持: 安卓qq / 安卓微信 / 苹果qq / 苹果微信\n简写: aqq / awx / iqq / iwx");
      return;
    }

    await UserStore.savePlatform(String(e.user_id), platform);

    const names = { aqq: "安卓QQ", awx: "安卓微信", iqq: "苹果QQ", iwx: "苹果微信" };
    e.reply(`默认平台已设为: ${names[platform] || platform}\n现在可以直接: #战力 英雄名`);
  },
};

/**
 * 执行查询
 */
async function doQuery(e, heroName, platform) {
  // 别名/错别字 → 官方英雄名
  const resolvedName = HeroAlias.resolve(heroName);

  const proficiency = await ProficiencyData.getProficiency(resolvedName, platform);
  if (lodash.isEmpty(proficiency) || proficiency.name === undefined) {
    const hint = resolvedName !== heroName ? `（已尝试「${resolvedName}」）` : "";
    e.reply(`没有找到「${heroName}」的战力信息${hint}`);
    return;
  }

  const names = { aqq: "安卓QQ", awx: "安卓微信", iqq: "苹果QQ", iwx: "苹果微信" };
  const platformName = names[platform] || platform;

  const rendered = await Render.render("proficiency/index", {
    data: proficiency,
    platformName
  }, { e, scale: 1.4 });

  if (!rendered) {
    let msg = `${proficiency.name}`;
    if (proficiency.alias) msg += `(${proficiency.alias})`;
    msg += ` [${platformName}]\n`;
    msg += `地区: ${proficiency.area} ${proficiency.areaPower}\n`;
    msg += `城市: ${proficiency.city} ${proficiency.cityPower}\n`;
    msg += `省份: ${proficiency.province} ${proficiency.provincePower}\n`;
    msg += `国标: ${proficiency.guobiao}\n`;
    msg += `更新: ${proficiency.updatetime}`;

    e.reply(msg);
  }
  return true;
}

export default ProficiencyQuery;
