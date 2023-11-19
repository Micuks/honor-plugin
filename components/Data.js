import _ from "lodash";
import fs from "node:fs";

const _path = process.cwd();
const getRoot = (root = "") => {
  if (!root) {
    root = `${_path}/`;
  } else if (root === "honor") {
    root = `${_path}/plugins/honor-plugin/`;
  } else if (root === "root") {
    root = `${_path}/`;
  } else {
    root = `${_path}/plugins/${root}/`;
  }
  return root;
};

let Data = {
  getRoot,

  async getCacheJSON(key) {
    try {
      let value = await redis.get(key);
      if (value) {
        return JSON.parse(value);
      }
    } catch (e) {
      console.log(e);
    }
    return {};
  },

  /**
   * Set Cache JSON in redis
   * @param {string} key Cache key
   * @param {JSON} data Cache data
   * @param {number} EX Expiration time in seconds
   */
  async setCacheJSON(key, data, EX = 3600 * 24 * 365) {
    await redis.set(key, JSON.stringify(data), { EX });
  },

  createDir(path = "", root = "", includeFile = false) {
    root = getRoot(root);
    let pathList = path.split("/");
    let nowPath = root;
    pathList.forEach((name, idx) => {
      name = name.trim();
      if (!includeFile && idx <= pathList.length - 1) {
        nowPath += name + "/";
        if (name) {
          if (!fs.existsSync(nowPath)) {
            fs.mkdirSync(nowPath);
          }
        }
      }
    });
  },

  // FIXME: don't understand this
  writeJSON(cfg, data, root = "", space = 2) {
    if (arguments.length > 1) {
      return Data.writeJSON({
        name: cfg,
        data,
        space,
        root,
      });
    }
    // Check and create directory
    let name = cfg.path ? cfg.path + "/" + cfg.name : cfg.name;
    Data.createDir(name, cfg.root, true);
    root = getRoot(cfg.root);
    data = cfg.data;
    delete data._res;
    data = JSON.stringify(data, null, cfg.space || 2);
    if (cfg.rn) {
      data = data.replaceAll("\n", "\r\n");
    }
    return fs.writeFileSync(`${root}/${name}`, data);
  },

  async importModule(file, root = "") {
    root = getRoot(root);
    if (!/\.js$/.test(file)) {
      file = file + ".js";
    }
    if (fs.existsSync(`${root}/${file}`)) {
      try {
        let data = await import(`file://${root}/${file}?t=${new Date() * 1}`);
        return data || {};
      } catch (e) {
        console.log(e);
      }
    }
  },

  async importCfg(key) {
    let sysCfg = await Data.importModule(
      `config/system/${key}_system.js`,
      "honor"
    );
    let customCfg = await Data.importModule(`config/${key}.js`, "honor");
    if (customCfg.isSys) {
      console.error(`honor-plugin: config/${key}.js is invalid, ignored.`);
      console.error(
        `如果要配置请复制 config/${key}_default.js 为 config/${key}.js, 不要复制 config/system 下的系统文件`
      );
      customCfg = {};
    }
    return {
      sysCfg,
      customCfg,
    };
  },

  /**
   * Retrieves data from a target object based on a list of keys.
   *
   * @param {Object} target - The target object to retrieve data from.
   * @param {string} keyList - A comma-separated list of keys to retrieve data for. key1, key2, toKey1:fromKey1, toKey2:fromObj.key
   * @param {Object} cfg - Configuration options for data retrieval.
   * @param {Object} cfg.defaultData - Default data to use if a key is not found in the target object.
   * @param {boolean} cfg.lowerFirstKey - Whether to convert the first character of each key to lowercase.
   * @param {string} cfg.keyPrefix - A prefix to add to each key.
   *
   * @returns {Object} - An object containing the retrieved data, with keys modified according to the configuration options.
   */
  getData(target, keyList = "", cfg = {}) {
    target = target || {};
    let defaultData = cfg.defaultData || {};
    let ret = {};
    // split by ,
    if (typeof keyList === "string") {
      keyList = keyList.split(",");
    }

    _.foreach(keyList, (keyCfg) => {
      // Specify toKey & fromKey
      let _keyCfg = keyCfg.split(":");
      let keyTo = _keyCfg[0].trim();
      let keyFrom = (_keyCfg[1] || _keyCfg[0]).trim();
      let keyRet = keyTo;
      if (cfg.lowerFirstKey) {
        keyRet = _.lowerFirst(keyRet);
      }
      if (cfg.keyPrefix) {
        keyRet = cfg.keyPrefix + keyRet;
      }
      // Get data from Data.getVal
      ret[keyRet] = Data.getVal(target, keyFrom, defaultData[keyTo]);
    });

    return ret;
  },

  getVal(target, keyFrom, defaultVal) {
    return _.get(target, keyFrom, defaultVal);
  },
};

export default Data;
