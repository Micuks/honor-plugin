import { Data, Version } from "#honor";
import Index from "./tools/index.js";

if (!global.segment) {
  global.segment = (await import("oicq")).segment;
}

export * from "./apps/index.js";

if (Bot?.logger?.info) {
  Bot.logger.info("------O.o------");
  Bot.logger.info(`农活插件${Version.version}初始化~`);
} else {
  console.log(`农活插件${Version.version}初始化~`);
}

setTimeout(Index.init, 1000);
