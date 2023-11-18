import lodash from "lodash";
import ProficiencyData from "./ProficiencyData.js";
import { Common } from "#honor";

const proficiencyReg =
  /^#*([^#]+?)\s*(?:honor)?(?:查战力|战力|查询|战斗力|战力查询|战斗力查询|战斗力查询)(安卓|安|果|苹果|ios|android|iOS|Android|华为|huawei|Huawei|HUAWEI)?(QQ|q|qq|微信|w|wx|WX)?$/;

const ProficiencyQuery = {
  async query(e) {
    let ret = proficiencyReg.exec(e.msg);

    // TODO: Platform regularize to android and ios
    if (ret.length === 4) {
      e.hero_name = ret[1];
      e.os = ret[2] || "android";
      e.platform = ret[3] || "qq";
    } else if (ret.length === 2) {
      e.hero_name = ret[1];
      e.os = ret[2] || "android";
      e.platform = "qq";
    }

    // regularize os
    if (["安卓", "安", "android", "Android"].includes(e.os)) {
      e.os = "a";
    } else {
      e.os = "i";
    }

    // regularize platform
    if (["QQ", "qq", "q"].includes(e.platform)) {
      e.platform = "qq";
    } else {
      e.platform = "wx";
    }

    e.platform = `${e.os}${e.platform}`;

    let proficiency = await ProficiencyData.getProficiency(
      e.hero_name,
      e.platform
    );
    if (lodash.isEmpty(proficiency) || proficiency.name === undefined) {
      e.reply("没有找到该英雄的战力信息");
      return;
    }
    // TODO: Render.render message
    // 头像: ${data.photo}
    let msg = `${proficiency.name}(${proficiency.alias})
    区服: ${proficiency.platform}
    地区: ${proficiency.area} (战力: ${proficiency.areaPower})
    城市: ${proficiency.city} (战力: ${proficiency.cityPower})
    省份: ${proficiency.province} (战力: ${proficiency.provincePower})
    国标: ${proficiency.guobiao}
    更新时间: ${proficiency.updatetime}`;
    e.reply(msg);
    return true;
  },
};

export default ProficiencyQuery;
