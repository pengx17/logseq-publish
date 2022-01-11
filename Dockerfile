# Copied from https://github.com/logseq/logseq/blob/master/Dockerfile 
ARG LOGSEQ_TAG

# Builder image
FROM ghcr.io/pengx17/logseq-base:${LOGSEQ_TAG}

WORKDIR /home/logseq

COPY publish.mjs ./

ENTRYPOINT [ "xvfb-run", "node", "publish.mjs" ]
