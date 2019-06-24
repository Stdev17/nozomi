#!/bin/bash

export NOZOMI_NAMESPACE=Nozomi.Matchmaker
export TARGET_FILES=../pop-matchmaker/src/index.ts

npx ts-node	\
	-r tsconfig-paths/register --transpile-only \
	--files	./scripts/clean.ts
	

npx ts-node	\
	-r tsconfig-paths/register --transpile-only	\
	--files ./src/main.ts
	

npx ts-node \
	-r tsconfig-paths/register --transpile-only	\
	--files ./scripts/publish.ts
	
