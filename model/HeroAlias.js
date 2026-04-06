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
   * 添加用户自定义别名
   */
  async addUserAlias(alias, heroName) {
    await redis.hSet(USER_ALIAS_KEY, alias.toLowerCase(), heroName);
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
