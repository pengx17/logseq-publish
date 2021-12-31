FROM ghcr.io/pengx17/logseq-publish:latest

WORKDIR /home/logseq
COPY . ./graph

RUN xvfb-run node publish.mjs -p ./graph
