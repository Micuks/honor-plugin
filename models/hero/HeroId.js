/**
 * Hero alias and hero ID related
 */
import _ from "lodash";
import { Data, Format, Meta } from "#honor";

async function init() {
  let { diyCfg } = await Data.importCfg("hero");
  let meta = Meta.create("hero");
  let customAlias = {};
  _.forEach(diyCfg.customHeros, (alias, id) => {
    let heroId = meta.getId(id);
    if (!heroId) {
      console.log(`Hero ${id} not found`);
    }
    customAlias[id] = alias.join(",");
  });
  meta.addData(customAlias);
}

await init();

const HeroId = {
  getId(hero = "") {
    if (!hero) {
      return false;
    }
    if (_.isObject(hero)) {
      for (let key of ["id", "name"]) {
        if (!hero[key]) continue;
        let ret = HeroId.getId(hero[key]);
        if (ret) return ret;
      }
      return false;
    }

    const ret = (data) => {
      let { id, name } = data;
      return { id, data, name };
    };

    let match = Meta.match("hero", hero);
    if (match) {
      return ret(match.data);
    }

    // Match failed
    return false;
  },
};

export default HeroId;
