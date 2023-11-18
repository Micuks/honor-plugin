import { Data, Version } from "#honor";
import fs from "node:fs";

let replyPrivate = async function () {};
let common = await Data.importModule("lib/common/common.js", "root");
if (common && common.default && common.default.replyPrivate) {
  replyPrivate = common.default.replyPrivate;
}

const Index = {
  async init() {
    await Index.checkVersion();
    await Index.startMsg();
  },

  async startMsg() {
    let mstStr = await redis.get("honor:restart-msg");
    if (msgStr) {
      let msg = JSON.parse(msgStr);
      await replyPrivate(msg.qq, msg.msg);
      await redis.del("honor:restart-msg");
      let msgs = [
        `Current Honor plugin version: ${Version.version}`,
        "You can use #honor版本 command to check changelog",
      ];
      await replyPrivate(msg.qq, msgs.join("\n"));
    }
  },

  async checkVersion() {
    if (!Version.isV3) {
      console.log(
        `ERROR: honor-plugin require V3 Yunzai to function properly.`
      );
    }
    if (!fs.existsSync(process.cwd() + "/lib/plugins/runtime.js")) {
      let msg =
        "ERROR: Runtime file not found, please check if you have installed Yunzai-Bot V3 or Miao-Yunzai correctly.";
      if (!(await redis.get("honor:runtime-warning"))) {
        await replyPrivate(msg.qq, msg);
        await redis.set("honor-runtime-warning", "true", { EX: 3600 * 24 });
      } else {
        console.log(msg);
      }
    }
  },
};

export default Index;
