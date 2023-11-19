/**
 * Base Model
 */
import { Data } from "#honor";

let cacheMap = {};
let reFn = {};
let metaMap = {};

export default class Base {
  constructor() {
    let proxy = new Proxy(this, {
      get(self, key, receiver) {
        if (self._uuid && key === "meta") {
          return metaMap[self._uuid];
        }
        if (key in self) {
          return Reflect.get(self, key, receiver);
        }
        if (self._get) {
          return self._get.call(receiver, key);
        }
        if (self._uuid) {
          return (metaMap[self._uuid] || {})[key];
        } else {
          return (self.meta || {})[key];
        }
      },
      set(target, key, newValue) {
        if (target._uuid && key === "meta") {
          metaMap[target._uuid] = newValue;
          return true;
        } else {
          return Reflect.set(target, key, newValue);
        }
      },
    });
    return proxy;
  }

  getData(arrList = "", cfg = {}) {
    arrList = arrList || this._dataKey || this.constructor._dataKey || "";
    return Data.getData(this, arrList, cfg);
  }

  // Set cache
  _cache(time = 3600) {
    let id = this._uuid;
    if (id) {
      cacheMap[id] = this;
      this._expire(time);
      return cacheMap[id];
    }
    return this;
  }

  // Get cache
  _getCache(uuid = "", time = 3600) {
    if (uuid && cacheMap[uuid]) {
      return cacheMap[uuid]._expire(time);
    }
    this._uuid = uuid;
  }

  // Set expire time
  _expire(time = 3600) {
    let id = this._uuid;
    let self = this;
    reFn[id] && clearTimeout(reFn[id]);
    if (time > 0) {
      if (id) {
        reFn[id] = setTimeout(() => {
          delete cacheMap[id];
        }, time * 1000);
      }

      return cacheMap[id];
    }
  }

  _delCache() {
    let id = this._uuid;
    reFn[id] && clearTimeout(reFn[id]);
    delete reFn[id];
    delete cacheMap[id];
  }
}
