import HeroInfo from "./statistics/HeroInfo.js";

import { App } from "#honor";

let app = App.init({
  id: "statistics",
  name: "英雄信息统计",
});

app.reg({
  heroInfo: {
    name: "英雄信息",
    desc: "查询英雄信息",
    rule: /^#*([^#]+)\s*(?:查询|详细|详情|数据|信息)\s*$/,
    fn: HeroInfo.heroinfo,
  },
});

export default app;
