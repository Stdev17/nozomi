import ts from 'typescript';

import * as T from '../template';
import * as U from '../utils';

import { CSharpContext } from './csharp';
import {
	NodeInfoRoot,
	NodeInfoItem,
	NodeTags,
} from '../nodeinfos';

import {
	BaseTransform,
} from './BaseTransform';

const cs = new CSharpContext();

export class NozomiTransform extends BaseTransform {
	public transform(info: NodeInfoRoot) {
		const { tsc } = this;

		const checker = tsc.checker;
		const item = info.item;
		const tags = this.getNodeTags(item.node);
		console.log(`generate ${tags.name}.cs...`);

		const reqText = 'Req';
		const respText = 'Resp';

		const objectName = cs.getKnownObjectName('Array');

		const req = info.reqArrayType ?
			`${objectName}<${tags.name}.${reqText}>` : `${tags.name}.${reqText}`;

		if (tags.name === 'MM_Inspect_GameSession') {
			console.log('catch');
		}

		const resp = info.respArrayType ?
			`${objectName}<${tags.name}.${respText}>` : `${tags.name}.${respText}`;

		const url = tags.route;
		const method = tags.method;

		const template: T.NozomiTemplate = {
			rootName: tags.name,
			namespace: U.getNozomiNamespace(),
			classes: this.getTemplateClasses(item, reqText, respText),
			method: { resp, req, url, method },
			kind: 'NozomiTemplate',
		};

		const object = {
			name: tags.name,
			api: template,
		};
		return object;

	}


	private getTemplateClasses(
		nodeInfo: NodeInfoItem,
		reqText: string,
		respText: string,
	) {
		const { tsc } = this;

		const classes: T.BaseTemplateClasses[] = [];
		if (nodeInfo.req) {
			nodeInfo.req.forEach(s => {
				const className = this.getName(tsc, nodeInfo, s) || reqText;
				const flag = tsc.isRegularEnumNode(s) ? { enum: true } : { class: true };
				const members = this.getMembersItems(tsc, nodeInfo, s, className);
				if (members) {
					classes.push({ className, flag, members });
				}
			});
		}

		if (nodeInfo.resp) {
			nodeInfo.resp.forEach(s => {
				const className = this.getName(tsc, nodeInfo, s) || respText;
				const flag = tsc.isRegularEnumNode(s) ? { enum: true } : { class: true };
				const members = this.getMembersItems(tsc, nodeInfo, s, className);
				if (members) {
					classes.push({ className, flag, members });
				}
			});
		}
		return U.getUniqueArray(classes);
	}

	private getNodeTags(root: ts.Node) {
		const tags = {} as { [key: string]: string } & NodeTags;
		const item: string[] = ['swagger', 'nozomi'];
		ts.getJSDocTags(root).forEach(async (t) => {
			if (item.includes(t.tagName.text) && t.comment) {
				if (t.tagName.text === 'swagger') {
					// TODO: 정규식이 아닌 yaml로 파싱
					// 현재 Typescript Compiler API에서 JSDoc Comment가 Trim이 됨
					const match = t.comment.match(/^([^\:]+)\:[\r\n]+([^\:]+)/m);
					if (!match || match.length < 3) {
						throw new Error(`(${U.getSourceFileName(root)}) Invalid swagger tag: ${t.comment}`);
					} else {
						const route = match[1];
						const method = match[2];
						tags.route = route;
						tags.method = method.trim().toUpperCase();
					}
				} else if (t.tagName.text === 'nozomi') {
					tags.name = t.comment;
				}
			}
		});

		if (!tags.name) {
			throw new Error(`(${U.getSourceFileName(root)}) The nozomi tag must contain content.`);
		}
		return tags;
	}
}
