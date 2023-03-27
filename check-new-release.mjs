import fs from 'node:fs';

async function getLogseqLatestTag() {
  // Fetch the latest release from the Logseq repository
  const res = await fetch(
    "https://api.github.com/repos/logseq/logseq/releases/latest"
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
      }
    }
  );
  console.log(res);
  return (await res.json()).tags;
}

(async () => {
  const latestTagName = await getLogseqLatestTag()

  if (!latestTagName) {
    throw new Error("Unable to fetch the latest release tag name");
  }

  const dockerTags = await getDockerTags();

  if (!dockerTags) {
    throw new Error('Docker tags not being found')
  }

  // Check if the latest Logseq tag is present in the Docker tags
  const isNewRelease = !dockerTags.includes(latestTagName);

  // Write output to the GITHUB_OUTPUT file
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `isNewRelease=${isNewRelease}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `latestTag=${latestTagName}\n`);
})();
