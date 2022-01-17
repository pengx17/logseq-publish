# Logseg Publish Action

Publish your [Logseq](http://github.com/logseq/logseq) graph with a GitHub Action. ✨

This action is the missing piece for achieving a complete CD workflow for your public Logseq graph.

- It will load your graph and publish it into `www` (this is configurable) folder.
- Next, you can then deploy `www` folder with [JamesIves/github-pages-deploy-action](https://github.com/JamesIves/github-pages-deploy-action).

## Example Logseq Graphs Published with this Action

- https://docs.logseq.com/
- https://note.xuanwo.io/
- https://pengx17.github.io/knowledge-garden/

## Usage

Firstly, add this step to your Github workflow. You can refer to My Example Graph's [workflows/main.yml](https://github.com/pengx17/knowledge-garden/blob/main/.github/workflows/main.yml) as an example.

```yml
steps:
  - uses: actions/checkout@v2
  - name: Logseq Publish 🚩
    uses: pengx17/logseq-publish@v0.1
  - name: add a nojekyll file # to make sure asset paths are correctly identified
    run: touch $GITHUB_WORKSPACE/www/.nojekyll
  - name: Deploy 🚀
    uses: JamesIves/github-pages-deploy-action@4.1.9
    with:
      branch: gh-pages # The branch the action should deploy to.
      folder: www # The folder the action should deploy.
      clean: true
```

Whenever you push changes to your Github repo, your graph will be published to the `gh-pages` branch. A few minutes later, your GitHub Pages will get updated.

## All options

- `dest`: Publish destination directory. Defaults to `www`.
- `trace`: Whether or not to generate and publish trace file for debugging. This trace file will be uploaded as an artifact to the run. Defaults to `true`.

## How it works

Here is a [document](https://pengx17.github.io/knowledge-garden/#/page/logseq%20publish%20github%20action) about the story behind this action. 

TLDR., this action will start Logseq desktop App in a Docker container, automate it by Playwright and finally load & publish the graph.

Since most of the work is done in a [prepared Docker container](https://github.com/pengx17/logseq-publish/pkgs/container/logseq-publish), you can refer to [action.yml](./action.yml) and adapt it in other places without the need for GitHub actions.
