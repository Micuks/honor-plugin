/**
 * 英雄别名解析
 *
 * 数据来源（优先级从高到低）:
 *   1. 用户自定义别名 (Redis: honor:useralias)
 *   2. 内置别名表 (resources/data/hero_alias.json)
 *
 * 使用: HeroAlias.resolve("八戒") → "猪八戒"
 */
import fs from "node:fs";
import { Data } from "#honor";

const ALIAS_FILE = process.cwd() + "/plugins/honor-plugin/resources/data/hero_alias.json";
const USER_ALIAS_KEY = "honor:useralias";

// ===================== 内置别名 =====================

// 从 JSON 构建 alias→name 反向索引
let builtinMap = new Map();

function loadBuiltin() {
  try {
    const raw = fs.readFileSync(ALIAS_FILE, "utf-8");
    const data = JSON.parse(raw);
    builtinMap = new Map();
    for (const [heroName, aliases] of Object.entries(data)) {
      if (heroName.startsWith("_")) continue;
      // 官方名也指向自己
      builtinMap.set(heroName.toLowerCase(), heroName);
      for (const alias of aliases) {
        if (alias) builtinMap.set(alias.toLowerCase(), heroName);
      }
    }
  } catch (err) {
    console.log(`[honor] 加载英雄别名表失败: ${err.message}`);
  }
}

loadBuiltin();

// ===================== 用户自定义别名 =====================

async function getUserAliasMap() {
  try {
    const raw = await redis.hGetAll(USER_ALIAS_KEY);
    return raw || {};
  } catch {
    return {};
  }
}

// ===================== 对外接口 =====================

const HeroAlias = {
  /**
   * 解析英雄名（别名 → 官方名）
   * 优先用户自定义，其次内置表，找不到原样返回
   */
  async resolve(input) {
    if (!input) return input;
    const trimmed = input.trim();
    const lower = trimmed.toLowerCase();

    // 1. 用户自定义别名 (Redis)
    const userMap = await getUserAliasMap();
    if (userMap[lower]) return userMap[lower];

    // 2. 内置别名表
    if (builtinMap.has(lower)) return builtinMap.get(lower);

    // 3. 没匹配到，原样返回
    return trimmed;
  },

  /**
   * 检查是否是已知的官方英雄名
   */
  isOfficialHero(name) {
    if (!name) return false;
    // builtinMap 中官方名指向自己
    const resolved = builtinMap.get(name.toLowerCase());
    return resolved === name || resolved === name.toLowerCase();
  },

  /**
   * 获取所有官方英雄名
   */
  getOfficialHeroes() {
    const heroes = new Set();
    for (const [, name] of builtinMap) {
      heroes.add(name);
    }
    return [...heroes];
  },

  /**
   * 添加用户自定义别名（带校验）
   * @returns {{ ok: boolean, msg: string }}
   */
  async addUserAlias(alias, heroName) {
    const lowerAlias = alias.toLowerCase();
    const lowerHero = heroName.toLowerCase();

    // 校验1: 别名不能等于目标英雄名
    if (lowerAlias === lowerHero) {
      return { ok: false, msg: "别名不能和英雄名相同" };
    }

    // 校验2: 目标必须是已知的官方英雄名
    if (!builtinMap.has(lowerHero) || builtinMap.get(lowerHero).toLowerCase() !== lowerHero) {
      // 不是官方名，尝试解析
      const resolved = builtinMap.get(lowerHero);
      if (resolved) {
        // 输入的是别名而不是官方名，提示用官方名
        return { ok: false, msg: `「${heroName}」是别名，官方名是「${resolved}」\n请用: #添加别名 ${resolved} ${alias}` };
      }
      return { ok: false, msg: `「${heroName}」不是已知英雄名\n请使用官方英雄名（如 镜、露娜、孙悟空）` };
    }

    // 校验3: 别名不能是其他英雄的官方名（防止覆盖）
    if (builtinMap.has(lowerAlias)) {
      const existingHero = builtinMap.get(lowerAlias);
      if (existingHero.toLowerCase() === lowerAlias) {
        // 这个别名本身就是某个英雄的官方名
        return { ok: false, msg: `「${alias}」已经是英雄「${existingHero}」的官方名，不能用作别名` };
      }
    }

    // 校验4: 检查共轭冲突 — 如果反向映射已存在
    const userMap = await getUserAliasMap();
    if (userMap[lowerHero] && userMap[lowerHero].toLowerCase() === lowerAlias) {
      return { ok: false, msg: `存在冲突: 已有「${heroName} → ${userMap[lowerHero]}」\n请先 #删除别名 ${heroName}` };
    }

    const officialName = builtinMap.get(lowerHero);
    await redis.hSet(USER_ALIAS_KEY, lowerAlias, officialName);
    return { ok: true, msg: `已添加别名: ${alias} → ${officialName}` };
  },

  /**
   * 删除用户自定义别名
   */
  async removeUserAlias(alias) {
    await redis.hDel(USER_ALIAS_KEY, alias.toLowerCase());
  },

  /**
   * 获取所有用户自定义别名
   */
  async getUserAliases() {
    return getUserAliasMap();
  },

  /**
   * 重新加载内置别名表（编辑 JSON 后调用）
   */
  reload() {
    loadBuiltin();
  },
};

export default HeroAlias;
