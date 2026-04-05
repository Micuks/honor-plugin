import { App } from "#honor";
import AuthHandler from "./auth/AuthHandler.js";

let app = App.init({ id: "auth", name: "营地功能" });

app.reg({
  campLogin:    { name: "营地绑定引导", rule: /^#(营地登录|营地绑定|荣耀登录)$/, fn: AuthHandler.campLogin },
  bindCamp:     { name: "绑定营地", rule: /^#绑定营地\s*(.+)$/, fn: AuthHandler.bindCamp },
  unbindCamp:   { name: "解绑营地", rule: /^#(解绑营地|取消绑定)$/, fn: AuthHandler.unbindCamp },
  addToken:     { name: "添加token", rule: /^#添加token\s*(.*)$/i, fn: AuthHandler.addToken },
  removeToken:  { name: "删除token", rule: /^#删除token\s*(.+)$/i, fn: AuthHandler.removeToken },
  poolStatus:   { name: "token池", rule: /^#(token池|Token池)$/i, fn: AuthHandler.poolStatus },
  campInfo:     { name: "营地信息", rule: /^#(营地信息|营地状态|我的营地)$/, fn: AuthHandler.campInfo },
  myHeroPower:  { name: "我的战力", rule: /^#(我的战力|英雄战力|我的英雄)$/, fn: AuthHandler.myHeroPower },
});

export default app;
