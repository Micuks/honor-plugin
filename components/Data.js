import fs from "node:fs";

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
};

export default Data;
