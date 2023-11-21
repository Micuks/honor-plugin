import Base from "./Base.js";
import HeroId from "./hero/HeroId.js";
import { Data, Format, Cfg, Meta } from "#honor";
import Serv from "./serv/Serv.js";

/**
 * Represents a Hero.
 * @class
 * @extends Base
 */
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

  get _file() {
    return `/data/HeroData/${this._id}.json`;
  }

  /**
   * Save to json file
   * @param {boolean} flag
   */
  save(flag = null) {
    if (flag === true) {
      this._save = true;
    } else if (flag === false || this._save === false) {
      this._save = false;
      return false;
    }
    let ret = Data.getData(
      this,
      "id",
      "name",
      "cName",
      "gradient",
      "title",
      ""
    );
    Data.writeJSON(this._file, ret, "root");
  }

  // Get specified hero's Hero Info
  getInfo(id) {
    let heroInfo = this._heroInfo;
    if (!heroInfo) {
      return false;
    }
    return heroInfo;
  }

  getAttrList() {}

  /**
   * Sets the basic data for a Hero.
   * @param {Object} dataSource - The data source containing the properties for the Hero.
   */
  setBasicData(dataSource) {
    this._id = dataSource.id || this._id || -1;
    this.name = dataSource.name || this.name || "";
    this.nickName = dataSource.nickName || this.nickName || "";
    this.gradient = dataSource.gradient || this.gradient || -1;
    this.title = dataSource.title || this.title || "";
    this.label = dataSource.label || this.label || "";
    this.banRate = dataSource.banRate || this.banRate || [];
    this.pickRate = dataSource.pickRate || this.pickRate || [];
    this.bpRate = dataSource.bpRate || this.bpRate || [];
    this.winRate = dataSource.winRate || this.winRate || [];
    this.score = dataSource.score || this.score || [];
    this.behavior = dataSource.behavior || this.behavior || [];
    this.highlight = dataSource.highlight || this.highlight || [];
    this.skill = dataSource.skill || this.skill || [];
    this.skin = dataSource.skin || this.skin || [];
    this.feature = dataSource.feature || this.feature || {};
    this.dominanceRate = dataSource.dominanceRate || this.dominanceRate || 0;
    this.equimentMoney = dataSource.equimentMoney || this.equimentMoney || 0;
    this.equipmentMoneyMin =
      dataSource.equipmentMoneyMin || this.equipmentMoneyMin || 0;
    this.img = dataSource.img || this.img || "";
    // this.likeStatus = dataSource.likeStatus || this.likeStatus || 0;
    this.change = dataSource.change || this.change || {};
    this.updateTime = dataSource.updateTime || this.updateTime || "";
    this.adjustmentTime =
      dataSource.adjustmentTime || this.adjustmentTime || "";
  }

  async refresh(cfg) {
    this.save(false);
    try {
      await this.refreshHeroInfo();
    } catch (e) {
      Bot.logger.mark(`英雄${this.name}信息获取失败, 请稍后再试`);
      console.log(e);
    }
    this.save(true);
  }

  /**
   * Refreshes the hero information.
   * @param {Object} hero - The hero object.
   * @param {number} [force=2] - The force value.
   * @returns {boolean|number} - Returns false if the hero does not need to be refreshed, otherwise returns the length of the hero's update.
   */
  async refreshHeroInfo(force = 2) {
    let { e } = this;
    if (!e) {
      return false;
    }
    let ret = await Serv.req(e, this);
    if (ret) {
      // Hero._heroInfo marks the last time the hero was updated
      // heroInfo data are stored in Hero.<fieldName> directly
      this._heroInfo = new Date() * 1;
      this.save();
      return this._update.length;
    }
  }
}

export default Hero;
