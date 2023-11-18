import lodash from "lodash";
import Plugin from "./common/Plugin.js";
import { Version } from "#honor";

class App {
  /**
   * Represents the constructor of the App class.
   * @constructor
   * @param {Object} cfg - The configuration object for the App.
   * @param {string} cfg.id - The ID of the App.
   */
  constructor(cfg) {
    this.id = cfg.id;
    this.cfg = cfg;
    this.apps = {};
  }

  /**
   * Registers a key with a function and optional configuration.
   * If the key is an object, each key-value pair will be registered recursively.
   * @param {string|Object} key - The key or object containing key-value pairs to register.
   * @param {Function} fn - The function to be registered.
   * @param {Object} [cfg={}] - Optional configuration for the registered key.
   */
  reg(key, fn, cfg = {}) {
    if (lodash.isPlainObject(key)) {
      lodash.forEach(key, (cfg, k) => {
        this.reg(k, cfg.fn, cfg);
      });
    } else {
      this.apps[key] = {
        fn,
        ...cfg,
      };
    }
  }

  // Get V3 Execution method
  /**
   * Creates a v3App class for the Honor plugin.
   * @returns {Class} The v3App class.
   */
  v3App() {
    let cfg = this.cfg || {};
    let rules = [];
    let check = [];
    let event = cfg.event;
    let cls = class extends Plugin {
      constructor() {
        super({
          name: `Honor:${cfg.name || cfg.id}`,
          dsc: cfg,
          event: event === "poke" ? "notice.*.poke" : "message",
          priority: cfg.priority || 50,
          rule: rules,
        });
      }

      accept(e) {
        e.original_msg = e.original_msg || e.msg;
        for (let idx = 0; idx < check.length; idx++) {
          if (check[idx](e, e.original_msg) === true) {
            return true;
          }
        }
      }
    };

    for (let key in this.apps) {
      let app = this.apps[key];
      key = lodash.camelCase(key);
      let rule = app.rule || app.reg || "noCheck";
      if (event !== "poke") {
        if (typeof event === "string") {
          if (rule === "noCheck") {
            rule = ".*";
          }
        } else {
          rule = lodash.trim(rule.toString(), "/");
        }
      } else {
        rule = ".*";
      }

      rules.push({
        reg: rule,
        fnc: key,
      });

      if (app.check) {
        check.push(app.check);
      }

      cls.prototype[key] = async function (e) {
        e = this.e || e;
        const self_id = e.self_id || e.bot?.uid || Bot.uin;
        if (event === "poke") {
          if (e.notice_type === "group") {
            if (e.target_id !== self.id && !e.isPoke) {
              // FIXME: Maybe && instead of ||
              return false;
            }
            // Usually the poke issuer is the operator in GROUP
            if (e.user_id === self_id) {
              e.user_id = e.operator_id;
            }
          }
          e.isPoke = true;
          // 随便指定一个不常见msg来触发msg正则
          e.msg = "#poke#";
        }
        e.original_msg = e.original_msg || e.msg;
        try {
          return await app.fn.call(this, e);
        } catch (err) {
          if (err?.message) {
            // if (err instanceof HonorError) {
            //   // TODO: Customize error
            //   return e.reply(err.message);
            // }
            // else {
            //   // Throw errors which are not an instance of custom error
            //   throw err;
            // }
            return e.reply(err.message);
          }
        }
      };

      // FIXME: Idk what this is, this seems the same with above code
      if (app.yzRule && app.yzCheck) {
        let yzKey = `Yz${key}`;
        let yzRule = lodash.trim(app.yzRule.toString(), "/");
        rules.push({
          reg: yzRule,
          fnc: yzKey,
        });
        cls.prototype[yzKey] = async function (e) {
          if (!app.yzCheck()) {
            return false;
          }
          e.this.e || e;
          e.original_msg = e.original_msg || e.msg;
          return await app.fn.call(this, e);
        };
      }
    }
    return cls;
  }
}

App.init = function (cfg) {
  return new App(cfg);
};

export default App;
