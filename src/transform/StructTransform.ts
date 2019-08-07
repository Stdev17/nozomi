import ts from 'typescript';

import * as T from '../template';
import * as U from '../utils';

import {
	NodeInfoRoot,
	NodeInfoItem,
} from '../nodeinfos';

import { BaseTransform } from './BaseTransform';

interface NodeTags {
	name: string;
}

export class StructTransform extends BaseTransform {
	public transform(info: NodeInfoRoot) {
		const { tsc } = this;

		const checker = tsc.checker;
		const item = info.item;
		const tags = this.getNodeTags(item.node);
		console.log(`generate <Struct> ${tags.name}.cs...`);

		const name = tags.name;
		const classes = this.getTemplateClasses(item);
		const template: T.StructTemplate = {
			name,
			namespace: U.getNozomiNamespace(),
			kind: T.TemplateKind.Struct,
			base: classes.filter(x => x.className === 'Base')[0],
			classes: classes.filter(x => x.className !== 'Base'),
		};

		const object = {
			name: tags.name,
			api: template,
		};

		return object;
	}

	private getTemplateClasses(nodeInfo: NodeInfoItem) {
		const { tsc } = this;
		const classes: T.BaseTemplateClass[] = [];
		nodeInfo.symbols.forEach(s => {
			const className = this.getName(tsc, nodeInfo, s)!;
			const flag = tsc.isRegularEnumNode(s) ? { enum: true } : { class: true };
			const members = this.getMembersItems(tsc, nodeInfo, s, className);
			if (members) {
				classes.push({ className, flag, members });
			}
		});
		return U.getUniqueArray(classes);
	}

	private getNodeTags(root: ts.Node) {
		const tags: NodeTags = {
			name: '',
		};
		const items = ['nozomi_struct'];
		ts.getJSDocTags(root).forEach(async (t) => {
			if (items.includes(t.tagName.text) && t.comment) {
				if (t.tagName.text === 'nozomi_struct') {
					tags.name = t.comment;
				}
			}
		});

		if (!tags.name) {
			throw new Error(`(${U.getSourceFileName(root)}) invalid nozomi_struct tags. require tags:nozomi_struct`);
		}

		return tags;
	}
}
