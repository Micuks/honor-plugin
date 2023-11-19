import Base from "./Base.js";
import HeroId from "./hero/HeroId.js";
import { Data, Format, Cfg, Meta } from "#honor";

class Hero extends Base {
  constructor({ id, name = "" }) {
    super();
    // Check cache
    let cacheObj = this._getCache(`hero:${id}`);
    if (cacheObj) {
      return cacheObj;
    }
    // Set data
    this._id = id;
    this.name = name;

    let meta = Meta.getData("hero", name);
    this.meta = meta || {};

    return this._cache();
  }
  // Get hero from hero name or hero alias
  static get(val) {
    let id = HeroId.getId(val);
    if (!id) {
      return false;
    }
    return new Hero(id);
  }
}
