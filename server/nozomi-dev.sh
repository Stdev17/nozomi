#!/bin/bash

export NOZOMI_NAMESPACE=Nozomi.Dev
export TARGET_FILES=src/index.ts

node ./node_modules/nozomi/dist/scripts/clean.js
node ./node_modules/nozomi/dist/src/main.js
node ./node_modules/nozomi/dist/scripts/publish.js
