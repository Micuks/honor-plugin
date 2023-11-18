/**
 * 干货助手API
 */

import ProficiencyQuery from "./proficiency/ProficiencyQuery.js";
import { App } from "#honor";

let app = App.init({
  id: "proficiency",
  name: "战力查询",
});

app.reg({
  proficiencyQuery: {
    name: "战力查询",
    rule: /^#*([^#]+)\s*(honor)?(查战力|战力|查询|战斗力|战力查询|战斗力查询|战斗力查询)?(安卓|安|果|苹果|ios|android|iOS|Android|华为|huawei|Huawei|HUAWEI)?(QQ|q|qq|微信|w|wx|WX)?$/,
    fn: ProficiencyQuery.query,
    desc: "[#战力查询] 查询战力",
  },
});

export default app;
