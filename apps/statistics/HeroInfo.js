import lodash from "lodash";
import { Common, Data, Format } from "#honor";

const heroInfoReg = /^#*([^#]+)\s*(查询|详细|详情|数据|信息)\s*$/;

let HeroInfo = {
  async heroinfo(e) {
    let msg = e.original_msg || e.msg;
    if (!msg) {
      return false;
    }

    let ret = heroInfoReg.exec(msg);

    let heroName = ret[1];
    // TODO: 别名识别, 在models/下

    return HeroInfo.render(e, heroName);
  },

  async render(e, heroName, params = {}) {},
};

export default HeroInfo;
