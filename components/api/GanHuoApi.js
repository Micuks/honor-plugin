/**
 * 干货助手API Honor-Plugin 封装
 * https://www.sapi.run/wangzhe/
 */

import fetch from "node-fetch";
import { Data } from "#honor";

const host = "https://www.sapi.run";

function getApi(api) {
  return `${host}${api}`;
}

let GanHuoApi = {
  async req(url, param = {}, EX = 3600) {
    let cacheData = await Data.getCacheJSON(`honor:ganhuo:${url}`);
    if (cacheData && cacheData.data && cacheData.data.name !== "undefined") {
      return cacheData;
    }

    let response = await fetch(getApi(`${url}`), {
      ...param,
      method: param.method || "GET",
      headers: param.headers || {
        "User-Agent": "Yunzai-Bot/Honor-Plugin",
      },
    });

    console.log(response);

    let retData = await response.json();
    if (retData && retData.data) {
      let d = new Date();
      retData.lastUpdate = `${d.toLocaleDateString()} ${d
        .toTimeString()
        .slice(0, 5)}`;
      await Data.setCacheJSON(`honor:ganhuo:${url}`, retData, EX);
    }
    return retData;
  },

  async getHeroProficiency(hero_name = "露娜", platform = "aqq") {
    // Form query url
    const queryParams = { hero: hero_name, type: platform };
    const query = new URLSearchParams(queryParams).toString;
    const url = `/hero/select.php?${query}`;

    return await GanHuoApi.req(url);
  },
};

export default GanHuoApi;
