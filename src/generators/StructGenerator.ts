import ts from 'typescript';

import path from 'path';
import fse from 'fs-extra';

import _ from 'lodash';

import { paths } from '../config';

import { TSC } from '../compiler';

import {
	StructNodeInfoFactory,
} from '../nodeinfos';

import {
	StructTransform,
} from '../transform';

import {
	Render,
	StructTemplate,
} from '../template';

import {
	TagNodePair,
	BaseGenerator,
} from './BaseGenerator';

export class StructGenerator extends BaseGenerator<StructTemplate> {
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
		api: StructTemplate;
	}>) {
		for (const obj of objects) {
			const render = Render.struct(obj.api);
			const fp = path.resolve(paths.csproj.generated, obj.name + '.cs');
			fse.outputFileSync(fp, render);
		}
	}
}

function processNode(tsc: TSC, pair: TagNodePair) {
	const name = pair.type;
	const node = pair.node;

	if (name !== 'nozomi_struct') {
		throw new Error(`NotImplementedError: ${name}`);
	}

	const factory = new StructNodeInfoFactory(tsc);
	const transformer = new StructTransform(tsc);
	const info = factory.create(node);
	return transformer.transform(info);
}

function findTaggedNodes(root: ts.Node) {
	const result: TagNodePair[] = [];
	aggregate(root);
	return result;

	function aggregate(node: ts.Node): void {
		if (ts.isInterfaceDeclaration(node)) {
			getTagNode('nozomi_struct');
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

