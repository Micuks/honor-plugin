import GanHuoApi from "../../components/api/GanHuoApi.js";
import lodash from "lodash";
import { Format } from "#honor";
import HeroProficiency from "./heroData.js";

let ProficiencyData = {
  /**
   * Retrieves the proficiency data for a specific hero on a given platform.
   * @param {string} hero_name - The name of the hero.
   * @param {string} platform - The platform on which the hero's proficiency data is requested.
   * @returns {Promise<HeroProficiency>} - A promise that resolves to the hero's proficiency data.
   */
  async getProficiency(hero_name, platform) {
    let proficiencyData =
      (await GanHuoApi.getHeroProficiency(hero_name, platform)) || {};
    proficiencyData = proficiencyData.data || {};
    let heroProficiency = new HeroProficiency(
      proficiencyData.uid,
      proficiencyData.name,
      proficiencyData.alias,
      proficiencyData.platform,
      proficiencyData.photo,
      proficiencyData.area,
      proficiencyData.areaPower,
      proficiencyData.city,
      proficiencyData.cityPower,
      proficiencyData.province,
      proficiencyData.provincePower,
      proficiencyData.guobiao,
      proficiencyData.stamp,
      proficiencyData.updatetime
    );

    return heroProficiency;
  },
};

export default ProficiencyData;
