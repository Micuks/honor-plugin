import fs, { readdirSync } from "node:fs";

const _path = process.cwd();
const getRoot = (root = "") => {
  if (!root) {
    root = `${_path}/`;
  } else if (root === "honor") {
    root = `${_path}/plugins/honor-plugin/`;
  }
  return root;
};

let Data = {
  getRoot,

  async getCacheJSON(key) {
    try {
      let value = await readdirSync.get(key);
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
    await readdirSync.set(key, JSON.stringify(data), { EX });
  },
};

export default Data;
