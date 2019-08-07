import ts from 'typescript';
import _ from 'lodash';
import { TSC } from '../compiler';
import { RESTGenerator } from './RESTGenerator';
import { MessageGenerator } from './MessageGenerator';
import {
	MessageTemplate,
	RESTTemplate,
	StructTemplate,
	TemplateKind,
} from '../template';
import { StructGenerator } from './StructGenerator';

const nozomiGenerator = new RESTGenerator();
const nozomiHandlerGenerator = new MessageGenerator();
const structGenerator = new StructGenerator();

const generators = [
	nozomiGenerator,
	nozomiHandlerGenerator,
	structGenerator,
];

type AllTemplate = (
	| RESTTemplate
	| MessageTemplate
	| StructTemplate
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
	const restItems = [];
	const messageItems = [];
	const structItems = [];

	for (const obj of objects) {
		if (isRESTPair(obj)) {
			restItems.push(obj);
		} else if (isMessagePair(obj)) {
			messageItems.push(obj);
		} else if (isStructPair(obj)) {
			structItems.push(obj);
		}
	}

	nozomiGenerator.outputScript(restItems);
	nozomiHandlerGenerator.outputScript(messageItems);
	structGenerator.outputScript(structItems);
}

function isRESTPair(
	pair: NameApiPair<AllTemplate>,
): pair is NameApiPair<RESTTemplate> {
	return pair.api.kind === TemplateKind.REST;
}

function isMessagePair(
	pair: NameApiPair<AllTemplate>,
): pair is NameApiPair<MessageTemplate> {
	return pair.api.kind === TemplateKind.Message;
}

function isStructPair(
	pair: NameApiPair<AllTemplate>,
): pair is NameApiPair<StructTemplate> {
	return pair.api.kind === TemplateKind.Struct;
}
