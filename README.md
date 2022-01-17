# Logseg Publish Action

Publish your Logseq graph in a GitHub Action. ✨

This action is the missing piece for achieving a complete CD workflow for your public Logseq graph.

- It will load your graph and publish it into `www` (this is configurable) folder.
- Next, you can then deploy `www` folder with [JamesIves/github-pages-deploy-action](https://github.com/JamesIves/github-pages-deploy-action).

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

# Without GitHub Action
If you do not want to use GitHub Action, that is totally fine. You can refer to [action.yml](./action.yml) to see how it works.
