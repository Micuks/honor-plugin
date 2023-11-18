import Help from "./help/Help.js";
import { App } from "#honor";

let app = App.init({
  id: "help",
  name: "Honor帮助",
  desc: "Honor帮助",
});

app.reg({
  help: {
    rule: /^#(荣耀|Honor|honor)?(帮助|命令|菜单|help|说明|功能|指令|使用说明)$/,
    fn: Help.render,
    desc: "[#帮助] #Honor帮助",
  },
  version: {
    rule: /^#?Honor版本$/,
    fn: Help.version,
    desc: "[#帮助] Honor版本",
  },
});

export default app;
