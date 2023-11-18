import GanHuoApi from "../../components/api/GanHuoApi.js";
import lodash from "lodash";
import { Format } from "#honor";

let ProficiencyData = {
  async getProficiency(hero_name, platform) {
    let proficiencyData =
      (await GanHuoApi.getHeroProficiency(hero_name, platform)) || {};
    proficiencyData = proficiencyData.data || {};
      let {uid, name, alias, platform, photo, area, }
  },
};
