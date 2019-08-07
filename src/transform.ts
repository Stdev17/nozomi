import ts from 'typescript';

import * as T from './template';
import * as U from './utils';

import { TSC, NodeType } from './compiler';
import { CSharpContext } from './transform/csharp';
import {
	NodeInfoRoot,
	NodeInfoItem,
	NodeTags,
} from './nodeinfos';

export interface NozomiObject {
	name: string;
	api: T.NozomiTemplate | T.NozomiHandlerTemplate;
}

export interface TransformContext {
	obtainTypeName: (type: ts.Type) => string;
}

const cs = new CSharpContext();

export class Transform {
	public static nozomi(tsc: TSC, info: NodeInfoRoot) {
		const checker = tsc.checker;
		const item = info.item;
		const tags = getNodeTags(item.node);
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
			classes: getTemplateClasses(item),
			method: { resp, req, url, method },
			kind: 'NozomiTemplate',
		};

		const object: NozomiObject = {
			name: tags.name,
			api: template,
		};
		return object;

		function getTemplateClasses(nodeInfo: NodeInfoItem) {
			const classes: T.BaseTemplateClasses[] = [];
			if (nodeInfo.req) {
				nodeInfo.req.forEach(s => {
					const className = Transform.getName(tsc, nodeInfo, s) || reqText;
					const flag = tsc.isRegularEnumNode(s) ? { enum: true } : { class: true };
					const members = Transform.getMembersItems(tsc, nodeInfo, s, className);
					if (members) {
						classes.push({ className, flag, members });
					}
				});
			}

			if (nodeInfo.resp) {
				nodeInfo.resp.forEach(s => {
					const className = Transform.getName(tsc, nodeInfo, s) || respText;
					const flag = tsc.isRegularEnumNode(s) ? { enum: true } : { class: true };
					const members = Transform.getMembersItems(tsc, nodeInfo, s, className);
					if (members) {
						classes.push({ className, flag, members });
					}
				});
			}
			return U.getUniqueArray(classes);
		}

		function getNodeTags(root: ts.Node) {
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

	public static nozomiHandler(tsc: TSC, info: NodeInfoRoot) {
		const nozomiObject = {} as NozomiObject;
		const checker = tsc.checker;
		const item = info.item;
		const tags = getNodeTags(item.node);
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
			classes: getTemplateClasses(item),
		};

		const object: NozomiObject = {
			name: tags.name,
			api: template,
		};

		return object;

		function getTemplateClasses(nodeInfo: NodeInfoItem) {
			const classes: T.BaseTemplateClasses[] = [];
			nodeInfo.symbols.forEach(s => {
				const className = Transform.getName(tsc, nodeInfo, s)!;
				const flag = tsc.isRegularEnumNode(s) ? { enum: true } : { class: true };
				const members = Transform.getMembersItems(tsc, nodeInfo, s, className);
				if (members) {
					classes.push({ className, flag, members });
				}
			});
			return U.getUniqueArray(classes);
		}

		function getNodeTags(root: ts.Node) {
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

	public static getMembersItems(tsc: TSC, nodeInfo: NodeInfoItem, s: NodeType, className: string) {
		const members: T.BaseTemplateMembers[] = [];

		if (tsc.isArrayTypeNode(s)) {
			const node = s as ts.ArrayTypeNode;
			const elementType = node.elementType as ts.TypeLiteralNode;
			elementType.members.map(x => tsc.getSymbol(x.name)).forEach(addMembersItem);
			return members;
		} else if (tsc.isTypeLiteralNode(s)) {
			const node = s as ts.TypeLiteralNode;
			node.members.map(x => tsc.getSymbol(x.name)).forEach(addMembersItem);
			return members;
		} else if (tsc.isRegularEnumNode(s)) {
			const node = s as NodeType & { exports: Map<string, ts.Symbol> };
			for (const [k, v] of node.exports) {
				const initializer = tsc.getInitializer(v.valueDeclaration);
				const optional = !!(v.flags & ts.SymbolFlags.Optional);
				const type = k;
				const name = initializer ? initializer.getText().replace(/['"]+/g, '') : k;
				const caseName = substitute(k);

				const m = { type, name, caseName } as T.BaseTemplateMembers;

				if (optional) {
					m.optional = optional;

					if (m.type === 'int' || m.type === 'bool') {
						m.type += '?';
					}
				}
				members.push(m);
			}
			return members;
		} else {
			const symbol = s as ts.Symbol;
			if (symbol.members) {
				symbol.members.forEach(addMembersItem);
				return members;
			}
			return null;
		}

		function substitute(name: string) {
			name = U.toCaseName(name);
			if (className === name) {
				name = 'Var' + name;
			}
			return name;
		}

		function addMembersItem(symbol: ts.Symbol | undefined) {
			if (!symbol) {
				return;
			}

			const type = tsc.checker.getTypeAtLocation(symbol.valueDeclaration);
			const optional = !!(symbol.flags & ts.SymbolFlags.Optional);
			const isEnum = tsc.isEnumType(type);
			const typeText = Transform.typeString(tsc, nodeInfo, type);
			if (!typeText) {
				return;
			}

			const m = {} as T.BaseTemplateMembers;
			m.type = typeText;
			m.name = symbol.name;
			m.flag = {
				enum: isEnum,
			};
			if (optional) {
				m.optional = optional;

				if (m.type === 'int' || m.type === 'bool') {
					m.type += '?';
				}
			}

			m.caseName = substitute(symbol.name);
			members.push(m);
		}
	}

	public static typeString(tsc: TSC, nodeInfo: NodeInfoItem, type: ts.Type) {
		return recursive(type);

		function recursive(type: ts.Type): string | null {
			if (tsc.getTypeArguments(type)) {
				return typeArguments(type);
			} else if (tsc.getSymbol(type)) {
				return symbol(type.symbol) || typeToString(type);
			} else {
				return typeToString(type);
			}

			function typeArguments(type: ts.Type) {
				const symbol = tsc.getSymbol(type) || type.aliasSymbol;
				if (!symbol) {
					return null;
				}
				const typeArguments = tsc.getTypeArguments(type);
				const objectName = cs.getKnownObjectName(symbol.name);
				if (typeArguments) {
					return `${objectName}<${typeArguments.map(recursive).join(', ')}>`;
				} else {
					if (cs.isFilteredType(objectName)) {
						console.log(`Warning: ${objectName} type is filtered. Member variable is deleted`);
						return null;
					} else if (cs.isForceChangeType(objectName)) {
						console.log(`Warning: ${objectName} type is filtered. Force converted to string`);
						return 'string';
					}
					return objectName;
				}
			}

			function symbol(symbol: ts.Symbol) {
				const symbolArray = Transform.getNodeInfoSymbol(tsc, nodeInfo, symbol);
				if (symbolArray) {
					const objectName = cs.getKnownObjectName(symbolArray[0]);
					if (cs.isFilteredType(objectName)) {
						console.log(`Warning: ${objectName} type is filtered. Member variable is deleted`);
						return null;
					} else if (cs.isForceChangeType(objectName)) {
						console.log(`Warning: ${objectName} type is filtered. Force converted to string`);
						return 'string';
					}
					return cs.getKnownObjectName(objectName);
				}
				return null;
			}

			function typeToString(type: ts.Type) {
				const typeText = tsc.checker.typeToString(type);
				if (cs.isFilteredType(typeText)) {
					console.log(`Warning: ${typeText} type is filtered. Member variable is deleted`);
					return null;
				} else if (cs.isForceChangeType(typeText)) {
					console.log(`Warning: ${typeText} type is filtered. Force converted to string`);
					return 'string';
				}
				return cs.obtainTypeName(type);
			}
		}
	}

	public static getNodeInfoSymbol(tsc: TSC, nodeInfo: NodeInfoItem, symbol: ts.Symbol) {
		const pid = tsc.getID(symbol);
		const array = Array.from(nodeInfo.symbols).filter(([, typeNode]) => {

			if (!tsc.isTypeLiteralNode(typeNode) && !tsc.isArrayTypeNode(typeNode)) {
				const symbol = typeNode as ts.Symbol;
				const id = tsc.getID(symbol);
				return (pid === id);
			}
			return false;
		});
		return (array.length) ? array[0] : null;
	}

	public static getName(tsc: TSC, nodeInfo: NodeInfoItem, s: NodeType) {
		if (!tsc.isTypeLiteralNode(s) && !tsc.isArrayTypeNode(s)) {
			const symbol = s as ts.Symbol;
			const nodeInfoSymbol = Transform.getNodeInfoSymbol(tsc, nodeInfo, symbol);
			if (nodeInfoSymbol) {
				return nodeInfoSymbol[0];
			}
			return symbol.name;
		}
		return null;
	}
}
