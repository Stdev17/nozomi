import ts from 'typescript';
import _ from 'lodash';
import { TSC } from '../compiler';
import { NozomiGenerator } from './NozomiGenerator';
import { NozomiHandlerGenerator } from './NozomiHandlerGenerator';
import {
	NozomiHandlerTemplate,
	NozomiTemplate,
	NozomiStructTemplate,
} from '../template';
import { StructGenerator } from './StructGenerator';

const nozomiGenerator = new NozomiGenerator();
const nozomiHandlerGenerator = new NozomiHandlerGenerator();
const structGenerator = new StructGenerator();

const generators = [
	nozomiGenerator,
	nozomiHandlerGenerator,
	structGenerator,
];

type AllTemplate = (
	| NozomiTemplate
	| NozomiHandlerTemplate
	| NozomiStructTemplate
);

interface NameApiPair<T> {
	name: string;
	api: T;
}

export function generate(tsc: TSC, sourceFile: ts.SourceFile) {
	let objs: Array<NameApiPair<AllTemplate>> = [];
	for (const g of generators) {
		const items = g.generate(tsc, sourceFile);
		objs = [...objs, ...items];
	}
	return objs;
}

export function outputScript(objects: Array<NameApiPair<AllTemplate>>) {
	const nozomiItems = [];
	const handlerItems = [];
	const structItems = [];

	for (const obj of objects) {
		if (isNozomiPair(obj)) {
			nozomiItems.push(obj);
		} else if (isHandlerPair(obj)) {
			handlerItems.push(obj);
		} else if (isStructPair(obj)) {
			structItems.push(obj);
		}
	}

	nozomiGenerator.outputScript(nozomiItems);
	nozomiHandlerGenerator.outputScript(handlerItems);
	structGenerator.outputScript(structItems);
}

function isNozomiPair(
	pair: NameApiPair<AllTemplate>,
): pair is NameApiPair<NozomiTemplate> {
	return pair.api.kind === 'NozomiTemplate';
}

function isHandlerPair(
	pair: NameApiPair<AllTemplate>,
): pair is NameApiPair<NozomiHandlerTemplate> {
	return pair.api.kind === 'NozomiHandlerTemplate';
}

function isStructPair(
	pair: NameApiPair<AllTemplate>,
): pair is NameApiPair<NozomiStructTemplate> {
	return pair.api.kind === 'NozomiStruct';
}
