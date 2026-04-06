import ProficiencyQuery from "./proficiency/ProficiencyQuery.js";
import { App } from "#honor";

let app = App.init({
  id: "proficiency",
  name: "战力查询",
});

app.reg({
  // 新版简洁命令: #战力 英雄名 [平台]
  queryNew: {
    name: "战力查询(新)",
    rule: /^#战力\s+.+$/,
    fn: ProficiencyQuery.queryNew,
  },
  // 旧版兼容: #露娜查战力安卓qq
  queryOld: {
    name: "战力查询(旧)",
    rule: /^#*([^#]+?)\s*(?:honor)?(?:查战力|战力查询|战斗力查询)(安卓|安|果|苹果|ios|android|iOS|Android|华为|huawei|Huawei|HUAWEI)(QQ|q|qq|微信|w|wx|WX|微|v|vx|VX)?$/,
    fn: ProficiencyQuery.queryOld,
  },
  // 设置默认平台
  setPlatform: {
    name: "设置平台",
    rule: /^#设置平台\s*.+$/,
    fn: ProficiencyQuery.setPlatform,
  },
});

export default app;
