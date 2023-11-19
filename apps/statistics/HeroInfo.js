import _ from "lodash";
import { getHeroInfoRefresh } from "./HeroCommon";
import { Common, Data, Format } from "#honor";
import { Hero } from "#honor.models";

const heroInfoReg = /^#*([^#]+)\s*(查询|详细|详情|数据|信息)\s*$/;

let HeroInfo = {
  async heroinfo(e) {
    let msg = e.original_msg || e.msg;
    if (!msg) {
      return false;
    }

    let ret = heroInfoReg.exec(msg);

    let heroName = ret[1];
    let hero = Hero.get(heroName);
    if (!hero) {
      return false;
    }

    return HeroInfo.render({ e, hero });
  },

  async render({ e, hero }) {
    let heroInfo = e._heroInfo || (await getHeroInfoRefresh(e, hero.id));
    if (!heroInfo) {
      return true;
    }

    // TODO: Implement

    return await Common.render(
      "hero-info/hero-info",
      {
        data,
        imgs: hero.getImgs(),
      },
      { e, scale: 1.4 }
    );
  },
};

export default HeroInfo;
