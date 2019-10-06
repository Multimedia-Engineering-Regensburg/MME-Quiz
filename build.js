#!/usr/bin/env node

/* eslint-env node */
/* eslint-disable no-console */

const fs = require("fs-extra"),
 TARGET_DIR = "demo/",
 DIST_DIR = "dist/";

console.log("Building MME-Quiz lib");

function createTargetDir() {
  console.log(`Ensure target directory [${TARGET_DIR}] and distribution directory [${DIST_DIR}] exist and are empty`);
  fs.ensureDirSync(TARGET_DIR);
  fs.emptyDirSync(TARGET_DIR); 
  fs.ensureDirSync(DIST_DIR);
  fs.emptyDirSync(DIST_DIR);
}

function copyFiles() {
  console.log(`Copying files to ${TARGET_DIR}`);
  fs.copySync("lib/index.js", `${TARGET_DIR}js/mme-quiz.js`);
  fs.copySync("lib/mme-quiz.css", `${TARGET_DIR}mme-quiz.css`);
  fs.copySync("example-quiz.md", `${TARGET_DIR}data/example-quiz.md`);
  fs.copySync("index.html", `${TARGET_DIR}index.html`);
  fs.copySync("lib/index.js", `${DIST_DIR}mme-quiz.js`);
  fs.copySync("lib/mme-quiz.css", `${DIST_DIR}mme-quiz.css`);
}

createTargetDir();
copyFiles();