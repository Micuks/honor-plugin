import Help from "./help/Help.js";
import { App } from "#honor";

let app = App.init({
  id: "help",
  name: "Honor帮助",
});

app.reg({
  help: {
    rule: /^#(荣耀|农|农药|Honor|honor)?(帮助|命令|菜单|help|说明|功能|指令|使用说明)$/,
    fn: Help.render,
  },
  version: {
    rule: /^#?Honor版本$/,
    fn: Help.version,
  },
});

export default app;
