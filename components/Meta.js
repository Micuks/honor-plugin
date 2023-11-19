import { Data } from "#honor";
import _ from "lodash";

const MetaStore = {};

class MetaData {
  constructor(type = "") {
    this.type = type;
    this.data = {};
    this.alias = {};
    this.abbr = {};
    this.cfg = {};
  }

  // Add data
  addData(datas, primaryKey = "id") {
    let { data, alias } = this;
    _.forEach(datas, (hero, id) => {
      id = hero[primaryKey] || id;
      data[id] = hero;
      if (hero.name && hero.name !== id) {
        alias[hero.name] = id;
      }
    });
  }

  // Add abbr
  addAbbr(hero) {
    let { data, alias } = this;
    _.forEach(hero, (txt, id) => {
      id = alias[id] || id;
      alias[txt.toLowerCase()] = id;
      if (data[id]) {
        data[id].abbr = txt;
      }
    });
  }

  // Add alias
  addAlias(hero, isPrivate = false) {
    let { alias } = this;
    _.forEach(hero, (txt, id) => {
      _.forEach((txt + "").split(","), (t) => {
        alias[_.trim(t + "").toLowerCase()] = alias[id] || id;
      });
    });
  }

  // Register alias function
  addAliasFn(fn) {
    if (fn) {
      this.aliasFn = fn;
    }
  }

  addMeta(cfgMap) {
    let { cfg } = this;
    _.forEach(cfgMap, (v, k) => {
      cfg[k] = v;
    });
  }

  // Get Hero ID from hero name or hero alias
  getId(txt) {
    txt = _.trim(txt + "").toLowerCase();
    let { data, alias } = this;
    // Txt is id
    if (data[txt]) {
      return txt;
    }

    // Txt is an alias
    if (alias[txt]) {
      return alias[txt];
    }

    return false;
  }

  getData(txt) {
    let id = this.getId(txt);
    let { data } = this;
    return data[id] || null;
  }

  getMeta(key = "") {
    if (!key) {
      return this.cfg;
    } else {
      return this.cfg[key];
    }
  }

  getIds() {
    return _.keys(this.data);
  }

  getAliases() {
    return _.keys(this.alias);
  }

  async forEach(fn) {
    for (let id in this.data) {
      let hero = this.data[id];
      let ret = fn(hero, id);
      ret = Data.isPromise(ret) ? await ret : ret;
      if (ret === false) {
        break;
      }
    }
  }
}

const MetaFn = (fnKey) => {
  return (type, args = "") => {
    let meta = Meta.create(type);
    return meta[fnKey](args);
  };
};

const Meta = {
  addAliasFn(type, fn) {
    let meta = Meta.create(type);
    meta.addAliasFn(fn);
  },

  // Get storage
  create(type) {
    let key = `${type}`;
    if (!MetaStore[key]) {
      MetaStore[key] = new MetaData(type);
    }
    return MetaStore[key];
  },
  getId: MetaFn("getId"),
  getIds: MetaFn("getIds"),
  getData: MetaFn("getData"),
  getAlias: MetaFn("getAlias"),
  getMeta: MetaFn("getMeta"),
  async forEach(type, fn) {
    let meta = Meta.create(type);
    meta.forEach(fn);
  },

  match(type, txt) {
    txt = _.trim(txt + "").toLowerCase();
    let id = Meta.getId(type, txt);
    if (id) {
      let data = Meta.getData(type, id);
      return { id, data };
    }
    return false;
  },
};

export default Meta;
