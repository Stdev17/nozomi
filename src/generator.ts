import ts from 'typescript';

import path from 'path';
import fse from 'fs-extra';

import _ from 'lodash';

import { paths } from './config';
import * as U from './utils';

import { TSC } from './compiler';
import {
	RESTNodeInfoFactory,
	HandlerNodeInfoFactory,
	BaseNodeInfoFactory,
} from './nodeinfos';

import {
	BaseTransform,
	NozomiHandlerTransform,
	NozomiTransform,
	NozomiObject,
} from './transform';

import {
	Render,
	NozomiHandlerTemplate,
	NozomiTemplate,
	NozomiDispatcherTemplate,
	NozomiBaseDispatcherTemplate,
	NozomiRequestHandlerTemplate,
} from './template';
import { transform } from '@babel/core';

interface TagNodePair {
	type: string;
	node: ts.Node;
}
export function generate(tsc: TSC, sourceFile: ts.SourceFile) {

	const objs = findTaggedNodes(sourceFile)
		.map(x => processNode(tsc, x));

	const names = objs.map(x => x!.name);
	const duplicate = names.some((item, idx) => names.indexOf(item) !== idx);
	if (duplicate) {
		throw new Error(`${sourceFile.fileName}: duplicate tag name found`);
	}

	return objs;
}

export function processNode(tsc: TSC, pair: TagNodePair) {
	const name = pair.type;
	const node = pair.node;

	let factory: BaseNodeInfoFactory;
	let transformer: BaseTransform;

	switch (name) {
		case 'nozomi':
			factory = new RESTNodeInfoFactory(tsc);
			transformer = new NozomiTransform(tsc);
			break;
		case 'nozomi_handler':
			factory = new HandlerNodeInfoFactory(tsc);
			transformer = new NozomiHandlerTransform(tsc);
			break;
		default:
			throw new Error(`NotImplementedError: ${name}`);
	}

	const info = factory.create(node);
	return transformer.transform(info);
}

export function findTaggedNodes(root: ts.Node) {
	const result: TagNodePair[] = [];
	aggregate(root);
	return result;

	function aggregate(node: ts.Node): void {
		if (ts.isVariableStatement(node) || ts.isExpressionStatement(node)) {
			getTagNode('nozomi');
		}

		if (ts.isInterfaceDeclaration(node)) {
			getTagNode('nozomi_handler');
		}

		function getTagNode(tagName: string) {
			const tags = _.filter(ts.getJSDocTags(node),
				['tagName.escapedText', tagName])
				.map(x => x.parent as ts.JSDoc)[0];

			if (tags) {
				result.push({ type: tagName, node });
				return;
			}
		}

		node.forEachChild(aggregate);
	}
}
function isNozomiTemplate(obj: NozomiTemplate | NozomiHandlerTemplate): obj is NozomiTemplate {
	return obj.kind === 'NozomiTemplate' as any;
}
function isNozomiHandlerTemplate(obj: NozomiTemplate | NozomiHandlerTemplate): obj is NozomiHandlerTemplate {
	return obj.kind === 'NozomiHandlerTemplate' as any;
}

export function outputScript(objects: NozomiObject[]) {
	const channels: { [channels: string]: NozomiDispatcherTemplate } = {};
	for (const obj of objects) {
		let render: string;
		if (isNozomiTemplate(obj.api)) {
			render = Render.nozomi(obj.api);
		} else if (isNozomiHandlerTemplate(obj.api)) {
			render = Render.nozomiHandler(obj.api);
			const channel = obj.api.channel;
			if (!channels[channel]) {
				channels[channel] = {
					name: channel,
					namespace: U.getNozomiNamespace(),
					dispatcher: `Base${U.firstWordCaptalize(channel)}Dispatcher`,
					items: [],
				};
			}
			channels[channel].items.push(obj.api);
		} else {
			throw new Error('InvalidArgumentException');
		}
		fse.outputFileSync(
			path.resolve(paths.csproj.generated, obj.name + '.cs'), render);
	}

	for (const name in channels) {
		if (name) {
			const render = Render.generatedDispatcher(channels[name]);
			fse.outputFileSync(
				path.resolve(paths.csproj.generated,
					channels[name].dispatcher + '.cs'), render);
		}
	}

	const baseDispatcherObj: NozomiBaseDispatcherTemplate = {
		namespace: U.getNozomiNamespace(),
		items: Object.keys(channels),
	};
	const baseDispatcherRender = Render.baseDispatcher(baseDispatcherObj);
	fse.outputFileSync(
		path.resolve(paths.csproj.generated, 'BaseDispatcher.cs'),
		baseDispatcherRender);

	const requestHandlerObj: NozomiRequestHandlerTemplate = {
		namespace: U.getNozomiNamespace(),
	};
	const requestHandlerRender = Render.baseRequestHandler(requestHandlerObj);
	fse.outputFileSync(
		path.resolve(paths.csproj.generated, 'RequestHandler.cs'),
		requestHandlerRender);
}

