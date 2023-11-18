import proficiency from "./proficiency.js";

let apps = { proficiency };
let rules = {}; // V3

for (let key in apps) {
  rules[`${key}`] = apps[key].v3App();
}

export { rules as apps };
