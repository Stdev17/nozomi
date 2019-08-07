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

export interface NozomiObject {
	name: string;
	api: T.NozomiTemplate | T.NozomiHandlerTemplate;
}

export interface TransformContext {
	obtainTypeName: (type: ts.Type) => string;
}

const cs = new CSharpContext();

export abstract class BaseTransform {
	protected readonly tsc: TSC;

	constructor(tsc: TSC) {
		this.tsc = tsc;
	}

	public abstract transform(info: NodeInfoRoot): NozomiObject;

	protected typeString = typeString;
	protected getMembersItems = getMembersItems;
	protected getNodeInfoSymbol = getNodeInfoSymbol;
	protected getName = getName;
}

function typeString(tsc: TSC, nodeInfo: NodeInfoItem, type: ts.Type) {
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
			const symbolArray = getNodeInfoSymbol(tsc, nodeInfo, symbol);
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

function getMembersItems(tsc: TSC, nodeInfo: NodeInfoItem, s: NodeType, className: string) {
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
		const typeText = typeString(tsc, nodeInfo, type);
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

function getNodeInfoSymbol(tsc: TSC, nodeInfo: NodeInfoItem, symbol: ts.Symbol) {
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

function getName(tsc: TSC, nodeInfo: NodeInfoItem, s: NodeType) {
	if (!tsc.isTypeLiteralNode(s) && !tsc.isArrayTypeNode(s)) {
		const symbol = s as ts.Symbol;
		const nodeInfoSymbol = getNodeInfoSymbol(tsc, nodeInfo, symbol);
		if (nodeInfoSymbol) {
			return nodeInfoSymbol[0];
		}
		return symbol.name;
	}
	return null;
}
