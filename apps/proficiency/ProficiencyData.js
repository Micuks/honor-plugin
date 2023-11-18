import GanHuoApi from "../../components/api/GanHuoApi.js";
import lodash from "lodash";
import { Format } from "#honor";

let ProficiencyData = {
  async getProficiency(hero_name, platform) {
    let proficiencyData = await GanHuoApi.getProficiency();
  },
};
