import lodash from "lodash";
import ProficiencyData from "./ProficiencyData.js";
import { Common } from "#honor";

const ProficiencyQuery = {
  async query(e) {
    let hero_name = e.matches[1];
    let platform = e.matches[4] || "安卓";
    let proficiency = await ProficiencyData.getProficiency(hero_name, platform);
    if (lodash.isEmpty(proficiency)) {
      e.reply("没有找到该英雄的战力信息");
      return;
    }
    let msg = Common.format(
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
