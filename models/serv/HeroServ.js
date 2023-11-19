import _ from "lodash";
import Base from "../Base.js";
import { Data } from "#honor";

let { sysCfg, customCfg } = await Data.importCfg("hero");

export default class HeroServ extends Base {
  constructor(cfg) {
    super();
    this._name = cfg.name;
    this.cfgKey = cfg.cfgKey || cfg.id;
    this.customCfg = customCfg[this.cfgKey] || {};
    this.sysCfg = sysCfg[this.cfgKey] || {};
    this._cfg = cfg;
  }

  get name() {
    let url = this.getCfg("url");
    return this._name || url.replace("https://", "").replace("/", "").trim();
  }

  getCfg(key, def = "") {
    if (!_.isUndefined(this.customCfg[key])) {
      return this.customCfg[key];
    }
    if (!_.isUndefined(this.sysCfg[key])) {
      return this.sysCfg[key];
    }
    return def;
  }

  /**
   * Retrieves the request parameters for the HeroServ.
   * @returns {Object} The request parameters object.
   */
  async getReqParam() {
    let url = this.getCfg("url");
    let params = this.getCfg("params");
    let ret = { url: url };
    if (params) {
      _.extend(ret, { params: params });
    }

    return ret;
  }

  async getDynamicApi() {
    return this.sysCfg.params.dynamicApi();
  }

  async getStaticApi() {
    return this.sysCfg.params.staticApi();
  }

  async dynamicReq(url, params = {}) {
    let dynamicApi = this.getDynamicApi();
    let req = await fetch(`${dynamicApi}${url}`, params);
    let data = await JSON.parse(req);
    return data;
  }

  async response(data, req) {
    // Parse response
    let cfg = this._cfg;
    if (cfg.response) {
      return await cfg.response.call(this, data, req);
    }
  }

  execFn(fn, args = [], def = false) {
    let _cfg = this._cfg;
    if (_cfg[fn]) {
      return _cfg[fn].apply(this, args);
    }
    return def;
  }

  updateHero(hero, data) {
    return this.execFn("updateHero", [hero, data], {});
  }
}
