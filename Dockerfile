# > step 1: Initializa running environment 
ARG LOGSEQ_TAG
FROM ghcr.io/pengx17/logseq-base:${LOGSEQ_TAG} as logseq

# > stpe 2: Remove useless dependencies to build slim docker image
FROM mcr.microsoft.com/playwright:focal

ENV LOGSEQ_THEME=${LOGSEQ_THEME:-"light"}
ENV LOGSEQ_IS_TRACE=${LOGSEQ_IS_TRACE:-true}
ENV LOGSEQ_SRC="graph"
ENV LOGSEQ_DEST=${LOGSEQ_DEST:-"www"}

WORKDIR /home/logseq

COPY --from=logseq /home/logseq/public/ ./public
COPY --from=logseq /home/logseq/node_modules ./node_modules
COPY publish.mjs entrypoint.sh ./

ENTRYPOINT ["sh", "./entrypoint.sh"]