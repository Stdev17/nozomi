import ts from 'typescript';

import * as T from '../template';
import * as U from '../utils';

import { TSC, NodeType } from '../compiler';
import { CSharpContext } from './csharp';
import {
	NodeInfoRoot,
	NodeInfoItem,
	NodeTags,
} from '../nodeinfos';

import { BaseTransform, NozomiObject } from './BaseTransform';

export class NozomiHandlerTransform extends BaseTransform {
	public transform(info: NodeInfoRoot) {
		const { tsc } = this;

		const nozomiObject = {} as NozomiObject;
		const checker = tsc.checker;
		const item = info.item;
		const tags = this.getNodeTags(item.node);
		console.log(`generate <NozomiHandler> ${tags.name}.cs...`);

		const name = tags.name;
		const channel = tags.channel;
		const template: T.NozomiHandlerTemplate = {
			name,
			channel,
			namespace: U.getNozomiNamespace(),
			kind: 'NozomiHandlerTemplate',
			type: `${name}.Base`,
			event: `On${name}Event`,
			dispatcher: `${name}Dispatcher`,
			classes: this.getTemplateClasses(item),
		};

		const object: NozomiObject = {
			name: tags.name,
			api: template,
		};

		return object;
	}

	private getTemplateClasses(nodeInfo: NodeInfoItem) {
		const { tsc } = this;
		const classes: T.BaseTemplateClasses[] = [];
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
		const tags = {} as { [key: string]: string } & NodeTags;
		const item: string[] = ['nozomi_handler', 'nozomi_channel'];
		ts.getJSDocTags(root).forEach(async (t) => {
			if (item.includes(t.tagName.text) && t.comment) {
				if (t.tagName.text === 'nozomi_handler') {
					tags.name = t.comment;
				}
				if (t.tagName.text === 'nozomi_channel') {
					tags.channel = t.comment;
				}
			}
		});

		if (!tags.name || !tags.channel) {
			throw new Error(`(${U.getSourceFileName(root)}) invalid nozomi_handler tags. require tags:nozomi_handler, nozomi_channel`);
		}
		return tags;
	}

}
