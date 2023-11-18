import lodash from "lodash";
import ProficiencyData from "./ProficiencyData.js";
import { Common } from "#honor";

const proficiencyReg =
  /^#*([^#]+?)\s*(?:honor)?(?:查战力|战力|查询|战斗力|战力查询|战斗力查询|战斗力查询)(安卓|安|果|苹果|ios|android|iOS|Android|华为|huawei|Huawei|HUAWEI)?(QQ|q|qq|微信|w|wx|WX)?$/;

const ProficiencyQuery = {
  async query(e) {
    let ret = proficiencyReg.exec(e.msg);

    console.log(ret);
    // TODO: Platform regularize to android and ios
    if (length(ret) === 4) {
      e.hero_name = ret[1];
      e.os = ret[2] || "android";
      e.platform = ret[3] || "qq";
    } else if (length(ret) === 2) {
      e.hero_name = ret[1];
      e.os = ret[2] || "android";
      e.platform = "qq";
    }

    // regularize os
    if (e.os in ["安卓", "安", "android", "Android"]) {
      e.os = "a";
    } else {
      e.os = "i";
    }

    // regularize platform
    if (e.platform in ["QQ", "qq", "q"]) {
      e.platform = "qq";
    } else {
      e.platform = "wx";
    }

    e.platform = `${e.os}${e.platform}}`;

    console.log(e.hero_name, e.platform);

    let proficiency = await ProficiencyData.getProficiency(
      e.hero_name,
      e.platform
    );
    if (lodash.isEmpty(proficiency)) {
      e.reply("没有找到该英雄的战力信息");
      return;
    }
    // TODO: Render.render message
    let msg = format(
      "{0}({1})\n战力: {2}\n区服: {3}\n城市: {4}\n省份: {5}\n国标: {6}\n更新时间: {7}",
      proficiency.name,
      proficiency.alias,
      proficiency.power,
      proficiency.area,
      proficiency.city,
      proficiency.province,
      proficiency.guobiao,
      proficiency.updatetime
    );
    e.reply(msg);
    return true;
  },
};

export default ProficiencyQuery;
