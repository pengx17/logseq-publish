import fs from "node:fs";

async function getLogseqLatestTag() {
  // Fetch the latest release from the Logseq repository
  const token = process.env.GH_TOKEN;
  const res = await fetch(
    "https://api.github.com/repos/logseq/logseq/releases/latest",
    {
      headers: {
        Authorization: `token ${token}`,
      },
    }
  );

  const latestRelease = await res.json();

  // Get the tag name from the latest release
  return latestRelease.tag_name;
}

async function getDockerTags() {
  const ghcrToken = process.env.GHCR_TOKEN;
  const res = await fetch(
    "https://ghcr.io/v2/pengx17/logseq-publish/tags/list",
    {
      headers: {
        Authorization: `Bearer ${ghcrToken}`,
      },
    }
  );
  return (await res.json()).tags;
}

(async () => {
  const latestTagName = await getLogseqLatestTag();

  if (!latestTagName) {
    throw new Error("Unable to fetch the latest release tag name");
  }

  const dockerTags = await getDockerTags();

  if (!dockerTags) {
    throw new Error("Docker tags not being found");
  }

  // Check if the latest Logseq tag is present in the Docker tags
  const isNewRelease = !dockerTags.includes(latestTagName);

  fs.writeFileSync(
    "check-release.out.txt",
    `isNewRelease=${isNewRelease}\nlatestTag=${latestTagName}\n`
  );

  console.log(fs.readFileSync("check-release.out.txt", "utf-8"));
})();
