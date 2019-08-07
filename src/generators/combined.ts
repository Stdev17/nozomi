import ts from 'typescript';
import _ from 'lodash';
import { TSC } from '../compiler';
import { NozomiGenerator } from './NozomiGenerator';
import { NozomiHandlerGenerator } from './NozomiHandlerGenerator';
import {
	NozomiHandlerTemplate,
	NozomiTemplate,
} from '../template';

const nozomiGenerator = new NozomiGenerator();
const nozomiHandlerGenerator = new NozomiHandlerGenerator();

const generators = [
	nozomiGenerator,
	nozomiHandlerGenerator,
];

type AllTemplate = NozomiTemplate | NozomiHandlerTemplate;

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
	const nozomiItems: Array<NameApiPair<NozomiTemplate>> = [];
	const handlerItems: Array<NameApiPair<NozomiHandlerTemplate>> = [];

	for (const obj of objects) {
		const api = obj.api;
		if (isNozomiTemplate(api)) {
			nozomiItems.push({ name: obj.name, api });
		} else if (isNozomiHandlerTemplate(api)) {
			handlerItems.push({ name: obj.name, api });
		}
	}

	nozomiGenerator.outputScript(nozomiItems);
	nozomiHandlerGenerator.outputScript(handlerItems);
}

function isNozomiTemplate(obj: AllTemplate): obj is NozomiTemplate {
	return obj.kind === 'NozomiTemplate' as any;
}
function isNozomiHandlerTemplate(obj: AllTemplate): obj is NozomiHandlerTemplate {
	return obj.kind === 'NozomiHandlerTemplate' as any;
}
