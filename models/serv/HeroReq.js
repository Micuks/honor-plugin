import Base from "../Base.js";
import fetch from "node-fetch";

export default class HeroReq extends Base {
  constructor(e) {
    super();
    this.e = e;
  }

  static create(e) {
    if (!e) {
      return false;
    }

    return new HeroReq(e);
  }

  log(msg) {
    logger.mark(`[HeroReq] ${msg}`);
  }

  async requestHeroInfo(hero, serv) {
    let self = this;
    this.serv = serv;
    let reqParam = await serv.getReqParam();

    setTimeout(() => {
      if (self._isReq) {
        this.e.reply(`开始获取英雄${hero.name}信息...`);
      }
    }, 2000);
    // Yield request
    this.log(
      `${logger.yellow(`开始请求${hero.name}信息`)}, 数据源: ${serv.name}...`
    );

    let data = {};
    try {
      let params = reqParam.params || {};
      if (serv.name === "susu") {
        // Static Api and dynamic api
        let queryParams = {};
        if (hero._id) {
          queryParams = { type: "getHeroInfo", heroId: hero._id };
        } else if (hero.name) {
          queryParams = { type: "getHeroInfo", heroName: hero.name };
        } else if (id) {
          // Form id query url
          queryParams = { type: "getHeroInfo", id: id };
        }
        const query = new URLSearchParams(queryParams).toString();
        const url = `/app.php?${query}`;

        self._isReq = true;
        let req = await serv.dynamicReq(url);
        data = await JSON.parse(req);
        self._isReq = false;
      } else {
        // TODO: Other api not implemented
        return false;
      }
    } catch (e) {
      console.log(`英雄${hero.name}查询错误`, e);
      self._isReq = false;
      data = {};
    }

    data = await serv.response(data, this);

    serv.updateHero(hero, data);

    return hero;
  }
}
