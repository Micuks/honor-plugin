import fs from "node:fs";

for (let type of ["hero"]) {
  let file = `./plugins/honor-plugin/resources/meta/${type}/index.js`;
  if (fs.existsSync(file)) {
    try {
      await import(`file://${process.cwd()}/${file}`);
    } catch (e) {
      console.log(e);
    }
  }
}

export { Base, Hero };
