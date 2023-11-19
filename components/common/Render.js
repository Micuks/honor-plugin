import { Version, Cfg } from "#honor";

const Render = {
  async render(path, params, cfg) {
    let { e } = cfg;
    if (!e.runtime) {
      console.log("e.runtime not found. Please update Yunzai bot to date.");
    }
    return e.runtime.render(cfg.plugin || "honor-plugin", path, params, {
      retType: cfg.retMsgId ? "msgId" : "default",
      beforeRender({ data }) {
        let pluginName = "";
        if (data.pluginName !== false) {
          pluginName = ` & ${data.pluginName || "Honor-Plugin"}`;
          if (data.pluginVersion !== false) {
            pluginName += `<span class="version">${
              data.pluginVersion || Version.version
            }`;
          }
        }
        const layoutPath =
          process.cwd() + "/plugins/honor-plugin/resources/common/layout/";
        let resPath = data.pluResPath;
        return {
          ...data,
          _honor_path: resPath,
          _layout_path: layoutPath,
          defaultLayout: layoutPath + "default.html",
          sys: {
            scale: Cfg.scale(cfg.scale || 1),
          },
          copyright: `Created By ${Version.name}<span class="version">${Version.yunzai}</span>${pluginName}</span>`,
          pageGotoParams: {
            waitUntil: "networkidle2",
          },
        };
      },
    });
  },
};

export default Render;
