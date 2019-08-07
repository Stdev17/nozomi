import ts from 'typescript';

import path from 'path';
import fse from 'fs-extra';

import _ from 'lodash';

import { paths } from '../config';
import * as U from '../utils';

import { TSC } from '../compiler';

import {
	RESTNodeInfoFactory,
} from '../nodeinfos';

import {
	RESTTransform,
} from '../transform';

import {
	Render,
	RESTTemplate,
	RequestHandlerTemplate,
} from '../template';

import {
	TagNodePair,
	BaseGenerator,
} from './BaseGenerator';

export class RESTGenerator extends BaseGenerator<RESTTemplate>{
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
		api: RESTTemplate;
	}>) {
		for (const obj of objects) {
			const render = Render.rest(obj.api);
			fse.outputFileSync(
				path.resolve(paths.csproj.generated, obj.name + '.cs'), render);
		}

		const requestHandlerObj: RequestHandlerTemplate = {
			namespace: U.getNozomiNamespace(),
		};
		const requestHandlerRender = Render.baseRequestHandler(requestHandlerObj);
		fse.outputFileSync(
			path.resolve(paths.csproj.generated, 'RequestHandler.cs'),
			requestHandlerRender);
	}
}

function processNode(tsc: TSC, pair: TagNodePair) {
	const name = pair.type;
	const node = pair.node;

	if (name !== 'nozomi') {
		throw new Error(`NotImplementedError: ${name}`);
	}

	const factory = new RESTNodeInfoFactory(tsc);
	const transformer = new RESTTransform(tsc);
	const info = factory.create(node);
	return transformer.transform(info);
}

function findTaggedNodes(root: ts.Node) {
	const result: TagNodePair[] = [];
	aggregate(root);
	return result;

	function aggregate(node: ts.Node): void {
		if (ts.isVariableStatement(node) || ts.isExpressionStatement(node)) {
			getTagNode('nozomi');
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


