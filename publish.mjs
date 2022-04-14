// @ts-check
import { _electron as electron } from "playwright";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import path from "path";
import fs from "fs";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 *
 * @param {import('playwright').Page} page
 * @param {string} path
 */
export async function setMockedOpenDirPath(page, path) {
  // set next open directory
  await page.evaluate(
    ([path]) => {
      Object.assign(window, {
        __MOCKED_OPEN_DIR_PATH__: path,
      });
    },
    [path]
  );
}

/**
 *
 * @param {import('playwright').Page} page
 * @param {string} path
 */
export async function loadLocalGraph(page, path) {
  await setMockedOpenDirPath(page, path);

  const onboardingOpenButton = page.locator(
    'strong:has-text("Choose a folder")'
  );

  if (await onboardingOpenButton.isVisible()) {
    await onboardingOpenButton.click();
  } else {
    await page.click("#left-menu.button");
    let sidebar = page.locator("#left-sidebar");
    if (!/is-open/.test(await sidebar.getAttribute("class"))) {
      await page.click("#left-menu.button");
    }

    await page.click("#left-sidebar #repo-switch");
    await page.waitForSelector(
      '#left-sidebar .dropdown-wrapper >> text="Add new graph"',
      { state: "visible" }
    );

    await page.click("text=Add new graph");
    await page.waitForSelector('strong:has-text("Choose a folder")', {
      state: "visible",
    });
    await page.click('strong:has-text("Choose a folder")');

    const skip = page.locator('a:has-text("Skip")');
    await skip.click();
  }

  await page.waitForSelector(':has-text("Parsing files")', {
    state: "hidden",
    timeout: 1000 * 60 * 5,
  });

  const title = await page.title();
  if (title === "Import data into Logseq" || title === "Add another repo") {
    await page.click("a.button >> text=Skip");
  }

  await page.waitForFunction('window.document.title === "Logseq"');

  console.log("Graph loaded for " + path);
}

/**
 *
 * @param {import('playwright').Page} page
 * @param {string} graphDistPath
 */
async function publish(page, graphDistPath) {
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

  await setMockedOpenDirPath(page, graphDistPath);

  await page.click(".button >> i.ti-dots");
  await page.click("a.menu-link >> text=Export graph");
  await page.click(`a:text("Export public pages")`);

  await delay(1000);

  let TTT = 30;
  while (!checkGraphDistPathExist() || checkGraphPublishing()) {
    await delay(1000);
    TTT--;
    if (TTT === 0) {
      throw "Export Timeout";
    }
  }
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option("path", {
      alias: "p",
      type: "string",
    })
    .option("output", {
      alias: "o",
      type: "string",
    })
    .option("trace", {
      alias: "t",
      type: "boolean",
      default: true,
    })
    .parse();

  const graphPath = path.resolve(process.cwd(), argv.path);
  const graphDistPath = path.resolve(
    process.cwd(),
    argv.output || graphPath + "-www"
  );

  let graphFolderExists = false;

  try {
    if (graphPath && fs.statSync(graphPath).isDirectory()) {
      graphFolderExists = true;
    }
  } catch (err) {
    //
  }

  if (!graphFolderExists) {
    console.log(`Provided graph folder ${graphPath} doesn't exist!`);
    process.exit(1);
  }

  const traceFile = path.join(graphDistPath, "trace.zip");

  const electronApp = await electron.launch({
    cwd: "./public/static",
    args: ["--disable_splash_screen", "electron.js"],
    locale: "en",
  });

  const context = electronApp.context();
  await context.tracing.start({ screenshots: true, snapshots: true });

  let exportSuccess = false;

  try {
    const page = await electronApp.firstWindow();

    page.once("load", async () => {
      console.log("Page loaded!");
    });

    await page.waitForLoadState("domcontentloaded");
    await page.waitForFunction('window.document.title != "Loading"');

    await page.waitForSelector(':has-text("Loading")', {
      state: "hidden",
      timeout: 1000 * 15,
    });

    await loadLocalGraph(page, graphPath);
    await publish(page, graphDistPath);

    exportSuccess = true;
  } catch (err) {
    console.error(err);
  } finally {
    if (argv.trace) {
      await context.tracing.stop({ path: traceFile });
      console.log("Trace file saved to " + traceFile);
    }
    if (exportSuccess) {
      console.log("Graph exported. closing ....");
      process.exit(0);
    } else {
      console.log("Export failed");
      process.exit(1);
    }
  }
}

main();
