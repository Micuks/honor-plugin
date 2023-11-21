/**
 * 干货助手API Honor-Plugin 封装
 * https://www.sapi.run/wangzhe/
 */

import { Data } from "#honor";
import FetchToolkit from "../../tools/fetch.js";

const host = "https://www.sapi.run";
const fetch = FetchToolkit.fetch;

function getApi(api) {
  return `${host}${api}`;
}

let GanHuoApi = {
  async req(url, param = {}, EX = 3600) {
    let cacheData = await Data.getCacheJSON(`honor:ganhuo:${url}`);
    if (cacheData && cacheData.data && cacheData.data.name !== undefined) {
      return cacheData;
    }

    const response = await fetch(getApi(`${url}`), {
      ...param,
      method: param.method || "GET",
      headers: param.headers || {
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",

        "Accept-Encoding": "gzip, deflate, br",

        "Accept-Language": "en-US,en;q=0.5",

        "Connection": "keep-alive",

        "Cookie": "X_CACHE_KEY=f07ef42a5c50d2310a8fbb10490fea15",

        "Host": "www.sapi.run",

        "Sec-Fetch-Dest": "document",

        "Sec-Fetch-Mode": "navigate",

        "Sec-Fetch-Site": "none",

        "Sec-Fetch-User": "?1",

        "Upgrade-Insecure-Requests": "1",

        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0",
      },
    });

    // JSON is automatically parsed
    const retData = response;
    if (retData && retData.data) {
      const d = new Date();
      retData.lastUpdate = `${d.toLocaleDateString()} ${
        d
          .toTimeString()
          .slice(0, 5)
      }`;
      await Data.setCacheJSON(`honor:ganhuo:${url}`, retData, EX);
    }
  },

  async getHeroProficiency(hero_name = "露娜", platform = "aqq") {
    // Form query url
    const queryParams = { hero: hero_name, type: platform };
    const query = new URLSearchParams(queryParams).toString();
    const url = `/hero/select.php?${query}`;

    return await GanHuoApi.req(url);
  },
};

export default GanHuoApi;
