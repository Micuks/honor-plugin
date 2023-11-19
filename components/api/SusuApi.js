/**
 * 苏苏的荣耀助手API Honor-plugin 封装
 * 静态接口: https://pvp.91m.top/hero/v1/app/public
 * 动态接口: https://pvp.91m.top/hero/v1
 */

import fetch from "node-fetch";
import { Data } from "#honor";

const host = "https://pvp.91m.top";
const staticPath = "/hero/v1/app/public";
const dynamicPath = "/hero/v1";

function getApi(api) {
  return `${host}${api}`;
}

let SusuApi = {
  /**
   * Makes a dynamic request to the specified URL with optional parameters.
   * Caches the response data for a specified expiration time.
   *
   * @param {string} url - The URL to make the request to.
   * @param {Object} [param={}] - Optional parameters for the request.
   * @param {number} [EX=3600] - Expiration time for the cached data in seconds.
   * @returns {Promise<Object>} - The response data from the request.
   * @throws {Error} - If there is an error parsing the response as JSON.
   */
  async dynamicReq(url, param = {}, EX = 3600) {
    let cacheData = await Data.getCacheJSON(`honor:susu:${url}`);
    if (cacheData && cacheData.data && param.method != "POST") {
      return cacheData;
    }

    let response = await fetch(getApi(`${dynamicPath}${url}`), {
      ...param,
      method: param.method || "GET",
      headers: param.headers || {
        "User-Agent": "Yunzai-Bot/Honor-Plugin",
      },
    });

    // Parse response json
    let retData = None;
    try {
      retData = await response.json();
    } catch (e) {
      // Throw json parse error
      throw e;
    }
    if (retData && retData.data) {
      let d = new Date();
      retData.lastUpdate = `${d.toLocaleDateString()} ${d
        .toTimeString()
        .slice(0, 5)}`;
      await Data.setCacheJSON(`honor:susu:${url}`, retData, EX);
    }

    return retData;
  },

  async staticReq(url, param = {}, EX = 3600) {
    let cacheData = await Data.getCacheJSON(`honor:susu:${url}`);
    if (cacheData && cacheData.data && param.method != "POST") {
      return cacheData;
    }

    let response = await fetch(getApi(`${staticPath}${url}`), {
      ...param,
      method: param.method || "GET",
      headers: param.headers || {
        "User-Agent": "Yunzai-Bot/Honor-Plugin",
      },
    });

    // Response is [{}...] like, wrap it in {"data": <raw response>}
    let retData = None;
    try {
      retData = await response.json();
      retData = { data: retData };
    } catch (e) {
      // Throw json parse error
      throw e;
    }

    if (retData) {
      let d = new Date();
      retData.lastUpdate = `${d.toLocaleDateString()} ${d
        .toTimeString()
        .slice(0, 5)}`;
      await Data.setCacheJSON(`honor:susu:${url}`, retData, EX);
    }
  },

  // Static Apis
  // 昨日结算信息
  async getCrawlerInfo() {
    return await this.staticReq("/json/heroPosition.json");
  },
  // 出装(推荐)
  async getHeroEquipmentAll() {
    return await this.staticReq("/json/heroEquipment_All.json");
  },
  // 出装(单件)
  async getHeroEquipmentOne() {
    return await this.staticReq("/json/heroEquipment_One.json");
  },
  // 英雄技能, 分路的合并, 可以看到摇摆位
  async getHeroGenre() {
    return await this.staticReq("/json/heroGenre.json");
  },
  // 昨日英雄排行
  async getHeroList() {
    return await this.staticReq("/json/heroList.json");
  },
  // 英雄技能(deprecated, 建议使用上面的getHeroGenre())
  async getHeroPosition() {
    return await this.staticReq("/json/heroPosition.json");
  },
  // 英雄技能(deprecated, 建议使用getHeroGenre())
  async getHeroSkill() {
    return await this.staticReq("/json/heroSkill.json");
  },
  // 英雄强势期
  async getHeroTrend() {
    return await this.staticReq("/json/heroTrend.json");
  },

  // Dynamic Apis
  // 英雄信息, id, heroId, heroName三选一, heroId只支持数字
  // id不知道是什么, heroId不知道映射关系
  async getHeroInfo(id = None, heroId = None, heroName = None) {
    let queryParams = {};
    if (heroName) {
      queryParams = { type: "getHeroInfo", heroName: heroName };
    } else if (heroId) {
      queryParams = { type: "getHeroInfo", heroId: heroId };
    } else if (id) {
      // Form id query url
      queryParams = { type: "getHeroInfo", id: id };
    }
    const query = new URLSearchParams(queryParams).toString();
    const url = `/app.php?${query}`;

    return await this.dynamicReq(url);
  },
};

export default SusuApi;
