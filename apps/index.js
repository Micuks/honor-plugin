import proficiency from "./proficiency.js";
import heroinfo from "./heroinfo.js";

let apps = { proficiency, heroinfo };
let rules = {}; // V3

for (let key in apps) {
  rules[`${key}`] = apps[key].v3App();
}

export { rules as apps };
