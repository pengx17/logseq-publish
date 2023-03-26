import { execSync } from "child_process";

(async () => {
  // Fetch the latest release from the Logseq repository
  const res = await fetch(
    "https://api.github.com/repos/logseq/logseq/releases/latest"
  );

  console.log(res);

  const latestRelease = await res.json();

  // Get the tag name from the latest release
  const latestTagName = latestRelease.tag_name;

  if (!latestTagName) {
    throw new Error("Unable to fetch the latest release tag name");
  }

  // Fetch all tags from the current repository
  const gitTags = execSync("git tag", { encoding: "utf-8" });

  // Check if the latest Logseq tag is present in the current repository
  const isNewRelease = !gitTags.split("\n").includes(latestTagName);

  console.log(`::set-output name=isNewRelease::${isNewRelease}`);
  console.log(`::set-output name=latestTag::${latestTagName}`);
})();
