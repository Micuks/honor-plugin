import { Cfg, Data } from "#honor";

import susuApi from "./api/SusuApi.js";

import HeroReq from "./HeroReq.js";
import HeroServ from "./HeroServ.js";

const apis = {
  susu: susuApi,
};

const servs = {};

const Serv = {
  // Get HeroServ
  getServ() {
    return this.serv("susu");
  },

  // Get Hero info serv by key
  serv(key) {
    if (!servs[key]) {
      servs[key] = new HeroServ(apis[key]);
    }
  },

  // Yield request
  async req(e, hero) {
    let req = HeroReq.create(e);
    if (!req) {
      return false;
    }

    let serv = this.getServ();
    try {
      hero._update = [];
      await req.requestHeroInfo(hero, serv);
      return hero._update?.length || 0;
    } catch (err) {
      if (!e._isReplied) {
        e.reply(`英雄${hero.name}信息获取失败, 请稍后再试`);
      }
      console.log(err);
      return false;
    }
  },
};

export default Serv;
