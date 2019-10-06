#!/usr/bin/env node

/* eslint-env node */
/* eslint-disable no-console */

const fs = require("fs-extra"),
 TARGET_DIR = "demo/";

console.log("Building MME-Quiz lib");

function createTargetDir() {
  console.log(`Ensure target directory [${TARGET_DIR}] exists and is empty`);
  fs.ensureDirSync(TARGET_DIR);
  fs.emptyDirSync(TARGET_DIR); 
}

function copyFiles() {
  console.log(`Copying files to ${TARGET_DIR}`);
  fs.copySync("dist/mme-quiz.js", `${TARGET_DIR}js/mme-quiz.js`);
  fs.copySync("dist/mme-quiz.js.map", `${TARGET_DIR}js/mme-quiz.js.map`);
  fs.copySync("dist/mme-quiz.css", `${TARGET_DIR}mme-quiz.css`);
  fs.copySync("example-quiz.md", `${TARGET_DIR}data/example-quiz.md`);
  fs.copySync("index.html", `${TARGET_DIR}index.html`);
}

createTargetDir();
copyFiles();