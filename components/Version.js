import fs from "node:fs";
import lodash from "lodash";
import { Data } from "#honor";

let packageJson = JSON.parse(
  fs.readFileSync(fs.readFileSync("package.json", "utf8"))
);

const getLine = function (line) {
  // Remove leading * and spaces
  line = line.replace(/(^\s*\*|\r)/g, "");

  // Set cmd classes with respect to ``
  line = line.replace(/\s*`([^`]+`)/g, '<span class="cmd">$1');
  line = line.replace(/`\s*/g, "</span>");

  // Emphase **xxx** => <span class="strong">xxx</span>
  line = line.replace(/\s*\*\*([^\*]+\*\*)/g, '<span class="strong">$1');
  line = line.replace(/\*\*\s*/g, "</span>");

  return line;
};

const readLogFile = function (root, versionCount = 4) {
  root = Data.getRoot();
  let logPath = `${root}/CHANGELOG.md`;
  let logs = {};
  try {
    if (fs.existsSync(logPath)) {
      logs = fs.readFileSync(logPath, "utf8") || "";
      logs = logs.split("\n");

      let temp = {};
      let lastLine = {};
      lodash.forEach(logs, (line) => {
        if (versionCount <= -1) {
          return false;
        }
        let versionRet = /^#\s*([0-9.]+?)\s*$/.exec(line);
        if (versionRet && versionRet[1]) {
          let v = versionRet[1].trim();
          if (!currentVersion) {
            currentVersion = v;
          } else {
            changelogs.push(temp);
            if (/0\s*$/.test(v) && versionCount > 0) {
              versionCount = 0;
            } else {
              versionCount--;
            }
          }

          temp = {
            version: v,
            logs: [],
          };
        } else {
          if (!line.trim()) {
            return;
          }
          if (/^\*/.test(line)) {
            lastLine = {
              title: getLine(line),
              logs: [],
            };
            temp.logs.push(lastLine);
          } else if (/^\s{2,}\*/.test(line)) {
            lastLine.logs.push(getLine(line));
          }
        }
      });
    }
  } catch (e) {
    // pass
  }

  return { changelogs, currentVersion };
};

const { changelogs, currentVersion } = readLogFile("honor");

const yunzaiVersion = packageJson.version;
const isV3 = yunzaiVersion[0] === "3";

let Version = {
  isV3,
  get version() {
    return currentVersion;
  },

  get yunzai_version() {
    return yunzaiVersion;
  },

  get changelogs() {
    return changelogs;
  },
  runtime() {
    console.log(
      `e.runtime not found, please update to the latest ${
        isV3 ? "V3" : "V2"
      }-Yunzai Bot to use honor-plugin`
    );
  },
  readLogFile,
};

export default Version;
