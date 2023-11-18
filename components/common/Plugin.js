/**
 * V3 Yunzai plugin
 */
let stateArr = {};

/**
 * Represents a plugin.
 * @class
 */
/**
 * Represents a plugin in the application.
 */
/**
 * Represents a plugin in the application.
 */
export default class Plugin {
  /**
   * Creates a new instance of the plugin class.
   * @constructor
   * @param {Object} data - The data object containing plugin information.
   * @param {string} data.name - The name of the plugin.
   * @param {string} data.desc - The description of the plugin.
   * @param {string} [data.event="message"] - The listening event for the plugin.
   * @param {number} [data.priority=5000] - The priority level of the plugin.
   * @param {Object} [data.task] - The scheduled task for the plugin.
   * @param {string} [data.task.name=""] - The name of the task.
   * @param {string} [data.task.fnc=""] - The method name of the task.
   * @param {string} [data.task.cron=""] - The cron formula for the task.
   * @param {string} [data.task.fnc=""] - The method name of the task.
   * @param {Boolean} [data.task.log=false] - Whether to log the task.
   * @param {Array} [data.rule=[]] - The command rule for the plugin.
   */
  constructor(data) {
    this.name = data.name;
    this.desc = data.desc;
    this.event = data.event || "message";
    this.priority = data.priority || 5000;
    this.task = {
      name: "",
      fnc: data.task?.fnc || "",
      cron: data.task?.cron || "",
    };
    this.rule = data.rule || [];
  }

  /**
   * Reply to a message.
   * @param {string} msg - The message to reply with.
   * @param {boolean} [quote=false] - Whether to quote the original message.
   * @param {Object} [data={}] - Additional data for the reply.
   * @param {Boolean} [data.recallMsg=false] - Whether to recall the original message.
   * @param {Boolean} [data.at=false] - Whether to @ the user.
   * @returns {boolean} - Returns true if the reply was successful, false otherwise.
   */
  reply(msg = "", quote = false, data = {}) {
    if (!this.event.reply || !msg) return false;
    return this.event.reply(msg, quote, data);
  }

  /**
   * Get the conversation key for the plugin.
   * @param {boolean} [isGroup=false] - Whether the conversation is a group conversation.
   * @returns {string} - The conversation key.
   */
  conKey(isGroup = false) {
    if (isGroup) {
      return `${this.name}.${this.event.group_id}`;
    } else {
      return `${this.name}.${this.userId || this.e.user_id}`;
    }
  }

  /**
   * Sets the content for a specific type in the plugin.
   *
   * @param {string} type - The type of content to set.
   * @param {boolean} [isGroup=false] - Indicates whether the content is for a group.
   * @param {number} [time=120] - The execution time in seconds.
   */
  setContent(type, isGroup = false, time = 120) {
    let key = this.conKey(isGroup);
    if (!stateArr[key]) {
      stateArr[key] = {};
    }
    stateArr[key][type] = this.e;

    if (time) {
      /** Execution time */
      setTimeout(() => {
        if (stateArr[key][type]) {
          delete stateArr[key][type];
          this.e.reply("Execution timeout. Cancelled.", true);
        }
      }, time * 1000);
    }
  }

  /**
   * Retrieves the content based on the current key.
   * @returns {any} The content associated with the current key.
   */
  getContent() {
    let key = this.conKey();
    return stateArr[key];
  }

  /**
   * Retrieves the content group based on the current key.
   * @returns {Array} The content group associated with the key.
   */
  getContentGroup() {
    let key = this.conKey(true);
    return stateArr[key];
  }

  /**
   * Finish the specified type of operation.
   * @param {string} type - The type of operation to finish.
   * @param {boolean} [isGroup=false] - Indicates whether the operation is for a group.
   */
  finish(type, isGroup = false) {
    if (
      stateArr[this.conKey(isGroup)] &&
      stateArr[this.conKey(isGroup)][type]
    ) {
      delete stateArr[this.conKey(isGroup)][type];
    }
  }
}
