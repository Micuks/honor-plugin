/**
 * Honor Plugin 渲染器
 * 封装 e.runtime.render() 调用
 */
import { Version } from "#honor";

const _pluginPath = process.cwd() + "/plugins/honor-plugin/";

const Render = {
  /**
   * 渲染 HTML 模板为图片
   * @param {string} path - 模板路径 (相对于 resources/)
   * @param {object} data - 传入模板的数据
   * @param {object} cfg - { e, scale }
   */
  async render(path, data, cfg) {
    const { e, scale = 1.2 } = cfg;
    if (!e?.runtime?.render) {
      // 降级为纯文本
      return false;
    }

    const resPath = _pluginPath + "resources/";
    const layoutPath = resPath + "common/layout.html";

    return e.runtime.render("honor-plugin", path, {
      ...data,
      version: Version.version || "1.0",
    }, {
      retType: "default",
      beforeRender({ data }) {
        return {
          ...data,
          _res_path: resPath,
          layout: layoutPath,
          sys: {
            scale: `style="transform:scale(${scale});transform-origin:0 0;"`,
          },
        };
      },
    });
  },
};

export default Render;
