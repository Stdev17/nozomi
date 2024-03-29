import ts from 'typescript';

import path from 'path';
import fse from 'fs-extra';

import _ from 'lodash';

import { paths } from '../config';
import * as U from '../utils';

import { TSC } from '../compiler';

import {
	HandlerNodeInfoFactory,
} from '../nodeinfos';

import {
	MessageTransform,
} from '../transform';

import {
	Render,
	MessageTemplate,
	DispatcherTemplate,
	BaseDispatcherTemplate,
} from '../template';

import {
	TagNodePair,
	BaseGenerator,
} from './BaseGenerator';

export class MessageGenerator extends BaseGenerator<MessageTemplate>{
	public generate(tsc: TSC, sourceFile: ts.SourceFile) {
		const objs = findTaggedNodes(sourceFile)
			.map(x => processNode(tsc, x));

		const names = objs.map(x => x!.name);
		const duplicate = names.some((item, idx) => names.indexOf(item) !== idx);
		if (duplicate) {
			throw new Error(`${sourceFile.fileName}: duplicate tag name found`);
		}

		return objs;
	}

	public outputScript(objects: Array<{
		name: string;
		api: MessageTemplate;
	}>) {
		const channels: { [channels: string]: DispatcherTemplate } = {};
		for (const obj of objects) {
			const render = Render.message(obj.api);
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

			fse.outputFileSync(
				path.resolve(paths.csproj.generated, obj.name + '.cs'), render);
		}

		for (const name in channels) {
			if (!name) { continue; }
			const render = Render.generatedDispatcher(channels[name]);
			const fp = path.resolve(paths.csproj.generated, channels[name].dispatcher + '.cs');
			fse.outputFileSync(fp, render);
		}

		const baseDispatcherObj: BaseDispatcherTemplate = {
			namespace: U.getNozomiNamespace(),
			items: Object.keys(channels),
		};
		const baseDispatcherRender = Render.baseDispatcher(baseDispatcherObj);
		fse.outputFileSync(
			path.resolve(paths.csproj.generated, 'BaseDispatcher.cs'),
			baseDispatcherRender);
	}
}

function processNode(tsc: TSC, pair: TagNodePair) {
	const name = pair.type;
	const node = pair.node;

	if (name !== 'nozomi_handler') {
		throw new Error(`NotImplementedError: ${name}`);
	}

	const factory = new HandlerNodeInfoFactory(tsc);
	const transformer = new MessageTransform(tsc);
	const info = factory.create(node);
	return transformer.transform(info);
}

function findTaggedNodes(root: ts.Node) {
	const result: TagNodePair[] = [];
	aggregate(root);
	return result;

	function aggregate(node: ts.Node): void {
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

