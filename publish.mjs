// @ts-check
import { _electron as electron } from "playwright";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import path from "path";
import fs from "fs";

const argv = yargs(hideBin(process.argv))
  .option("path", {
    alias: "p",
    type: "string",
  })
  .parse();

const traceFile = "trace.zip";

// @ts-ignore
const graphPath = path.resolve(process.cwd(), argv.path);
const graphDistPath = path.resolve(process.cwd(), graphPath + "-www");

let graphFolderExists = false;

try {
  if (graphPath && fs.statSync(graphPath).isDirectory()) {
    graphFolderExists = true;
  }
} catch (err) {
  //
}

let distPathExists = false;

function checkGraphDistPathExist() {
  try {
    if (
      distPathExists ||
      (graphDistPath &&
        fs.statSync(path.join(graphDistPath, "static")).isDirectory())
    ) {
      if (!distPathExists) {
        console.log("checkGraphDistPathExist: true");
      }
      distPathExists = true;
      return true;
    }
  } catch (err) {
    console.log("checkGraphDistPathExist: false");
    return false;
  }
}

function checkGraphPublishing() {
  try {
    if (
      fs
        .statSync(path.join(graphDistPath, "static", "js", "publishing"))
        .isDirectory()
    ) {
      console.log("publishing ...");
      return true;
    }
  } catch (err) {
    console.log("publishing ... done");
    return false;
  }
}

if (!graphFolderExists) {
  console.log(`Provided graph folder ${graphPath} doesn't exist!`);
  process.exit(1);
}

async function main() {
  const electronApp = await electron.launch({
    cwd: "./public/static",
    args: ["--disable_splash_screen", "electron.js"],
  });

  const context = electronApp.context();
  await context.tracing.start({ screenshots: true, snapshots: true });

  const page = await electronApp.firstWindow();

  page.once("load", async () => {
    console.log("Page loaded!");
  });

  await page.waitForLoadState("domcontentloaded");
  await page.waitForFunction('window.document.title != "Loading"');

  // set next open directory
  page.evaluate(
    ([graphPath]) => {
      Object.assign(window, {
        __MOCKED_OPEN_DIR_PATH__: graphPath,
      });
    },
    [graphPath]
  );

  await page.waitForSelector("#head");

  const hasOpenButton = await page.$("a.button >> span:has-text('Open')");
  if (hasOpenButton) {
    await page.click("#head >> .button >> text=Open", { force: true });
  } else {
    if (!(await page.$(".ls-left-sidebar-open"))) {
      await page.click(".cp__header-left-menu.button", { force: true });
    }
    await page.click("#left-sidebar >> #repo-switch");
    await page.click("text=Add new graph");
    await page.waitForSelector('h1:has-text("Open a local directory")');
    await page.click('h1:has-text("Open a local directory")');
  }

  await page.waitForTimeout(3000); // ?

  // Parsing files
  await page.waitForSelector(':has-text("Parsing files")', {
    state: "hidden",
    timeout: 1000 * 60 * 15, // 15 minutes
  });

  await page.waitForFunction('window.document.title != "Loading"');

  console.log("Graph loaded for " + graphPath);

  page.evaluate(
    ([graphDistPath]) => {
      Object.assign(window, {
        __MOCKED_OPEN_DIR_PATH__: graphDistPath,
      });
    },
    [graphDistPath]
  );

  await page.click(".button >> i.ti-dots");
  await page.click("a.menu-link >> text=Export graph");
  await page.click(`a:text("Export public pages")`);

  await page.waitForTimeout(1000);

  let TTT = 30;
  while (!checkGraphDistPathExist() || checkGraphPublishing()) {
    await page.waitForTimeout(1000);
    TTT--;
    if (TTT === 0) {
      await context.tracing.stop({ path: traceFile });
      console.log("export timeout");
      process.exit(1);
    }
  }

  await page.waitForTimeout(1000);

  await context.tracing.stop({ path: traceFile });
  console.log("Graph exported. closing ....");
  process.exit(0);
}

main();
