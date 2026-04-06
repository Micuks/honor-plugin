/**
 * 帮助命令
 */
import Render from "../../components/Render.js";

const helpGroups = [
  {
    name: "战力查询",
    items: [
      { cmd: "#战力 露娜", desc: "查最低上榜战力（用默认平台）" },
      { cmd: "#战力 镜 苹果微信", desc: "临时指定平台" },
      { cmd: "#设置平台 安卓qq", desc: "设置默认平台，之后只打英雄名" },
    ],
  },
  {
    name: "营地数据",
    items: [
      { cmd: "#绑定营地 <营地ID>", desc: "绑定你的营地ID（营地App「我的」页面可见）" },
      { cmd: "#我的战力", desc: "查看英雄战力列表（需添加token）" },
      { cmd: "#营地信息", desc: "查看个人资料、段位、胜率" },
      { cmd: "#解绑营地", desc: "解除营地ID绑定" },
    ],
  },
  {
    name: "Token 管理",
    items: [
      { cmd: "#添加token userId&&token", desc: "添加营地token，解锁战力查询" },
      { cmd: "#token池", desc: "查看当前token池状态" },
      { cmd: "#删除token <userId>", desc: "删除指定token（管理员）" },
    ],
  },
  {
    name: "别名管理",
    items: [
      { cmd: "#添加别名 别名 英雄名", desc: "添加自定义别名（如: #添加别名 喵喵 梦奇）" },
      { cmd: "#删除别名 <别名>", desc: "删除自定义别名" },
      { cmd: "#别名列表", desc: "查看所有自定义别名" },
    ],
  },
  {
    name: "其他",
    items: [
      { cmd: "#荣耀帮助 / #农帮助", desc: "显示本帮助" },
    ],
  },
];

const tips = [
  "营地ID: 打开王者营地App →「我的」→ 头像旁的数字",
  "添加token后可查看完整英雄战力; 不添加只能看场次和胜率",
  "Token获取: 安卓手机用HttpCanary抓包王者营地App, 从请求头提取userId和token",
  "战力查询(#战力 英雄名)不需要绑定营地, 直接可用",
  "支持英雄别名: 猴子→孙悟空, 黄香蕉→镜, 鲁班→鲁班七号 等",
];

const Help = {
  async render(e) {
    // 先尝试图片渲染
    try {
      const result = await Render.render("help/index", {
        helpGroups,
        tips,
      }, { e, scale: 1.2 });
      if (result) return result;
    } catch (err) {
      // 渲染失败，降级文本
    }

    // 降级纯文本
    let msg = "=== Honor Plugin 帮助 ===\n";
    for (const g of helpGroups) {
      msg += `\n【${g.name}】\n`;
      for (const item of g.items) {
        msg += `${item.cmd}\n  ${item.desc}\n`;
      }
    }
    msg += "\n【Tips】\n";
    for (const t of tips) msg += `- ${t}\n`;
    e.reply(msg.trim());
  },

  async version(e) {
    e.reply("Honor Plugin v1.1");
  },
};

export default Help;
