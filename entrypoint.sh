#!/bin/sh

if [ ! -d ${LOGSEQ_SRC}/${LOGSEQ_DEST} ]; then mkdir -p ${LOGSEQ_SRC}/${LOGSEQ_DEST}; fi
touch ${LOGSEQ_SRC}/${LOGSEQ_DEST}/.nojekyll

# executing like "xvfb-run node publish.mjs -p graph -o www -t true --theme light"
xvfb-run node publish.mjs -p ${LOGSEQ_SRC} \
    -o ${LOGSEQ_SRC}/${LOGSEQ_DEST} -t ${LOGSEQ_IS_TRACE} --theme ${LOGSEQ_THEME}