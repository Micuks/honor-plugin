import proficiency from "./proficiency.js";
import auth from "./auth.js";
import help from "./help.js";

let apps = { proficiency, auth, help };
let rules = {}; // V3

for (let key in apps) {
  rules[`${key}`] = apps[key].v3App();
}

export { rules as apps };
