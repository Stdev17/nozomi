import ts from 'typescript';
import { TSC } from '../compiler';
import * as U from '../utils';

export interface NodeInfoRoot {
	reqArrayType?: boolean;
	respArrayType?: boolean;
	item: NodeInfoItem;
}

export interface NodeInfoItem {
	req?: NodeTable;
	resp?: NodeTable;
	node: ts.Node;
	symbols: NodeTable;
}

export interface NodeTags {
	name: string;
	route: string;
	method: string;
}

export type NodeType = ts.Symbol | ts.TypeLiteralNode | ts.ArrayTypeNode;
export type NodeTable = Map<string, NodeType>;

export abstract class BaseNodeInfoFactory {
	protected readonly tsc: TSC;

	constructor(tsc: TSC) {
		this.tsc = tsc;
	}

	public abstract create(node: ts.Node): NodeInfoRoot;

	protected getAllReferencedSymbols = getAllReferencedSymbols;
	protected getSymbolMembers = getSymbolMembers;
	protected descendant = descendant;
}

// kind 153 = PropertySignature
function getAllReferencedSymbols(tsc: TSC, root: ts.Node[]) {
	const map: NodeTable = new Map();
	const visitedTypes: number[] = [];
	const checker = tsc.checker;

	root.forEach(visitNode);
	return map;

	/**
	 * members의 PropertySignature에서 symbol.type.typeArguments를 얻어오자
	 *
	 * root
	 * ㄴ name: IdentifierObject
	 *   ㄴ symbol: SymbolObject
	 *     ㄴ type: TypeObject
	 *       ㄴ typeArguments: Array(1) [TypeObject]
	 *
	 */

	function visitNode(node: ts.Node) {
		if (!node) {
			throw new Error('node cannot be undefined or null');
		}
		if (ts.isPropertySignature(node)) {
			return propertySignature(node);
		}
		if (ts.isInterfaceDeclaration(node)) {
			return interfaceDeclaration(node);
		}

		function propertySignature(node: ts.PropertySignature) {
			const aliasText = getAliasText(node.name);
			const symbol = tsc.getSymbol(node.name);

			if (symbol) {
				const type = tsc.getType(symbol);
				if (type) {
					visitType(type, aliasText);

					const typeArguments = tsc.getTypeArguments(type);
					if (typeArguments) {
						typeArguments.forEach(t => visitType(t, aliasText));
					}
				}

				const members = getSymbolMembers(symbol);
				members.forEach(visitNode);
			} else if (node.type) {
				visitTypeNode(node.type);
			}

			function visitTypeNode(typeNode: ts.TypeNode) {
				if (ts.isArrayTypeNode(typeNode)) {
					return arrayType(typeNode);
				}
				if (ts.isTypeLiteralNode(typeNode)) {
					return typeLiteral(typeNode);
				}
				if (ts.isTypeReferenceNode(typeNode)) {
					return typeReference(typeNode);
				}
			}

			function arrayType(typeNode: ts.ArrayTypeNode) {
				const elementType = typeNode.elementType;
				if (ts.isTypeReferenceNode(elementType)) {
					const typeName = elementType.typeName;
					const type = checker.getTypeAtLocation(typeName);

					visitType(type, aliasText);

					const typeArguments = elementType.typeArguments;
					if (typeArguments) {
						typeArguments.forEach(t => visitTypeNode(t));
					}
				}
			}

			function typeLiteral(typeNode: ts.TypeLiteralNode) {
				const symbol = (typeNode as ts.TypeLiteralNode & { symbol: ts.Symbol }).symbol;
				const name = (symbol.name !== '__type' && symbol.name) ? symbol.name : aliasText;
				map.set(name, symbol);
				if (symbol.members) {
					const members: ts.Node[] = getSymbolMembers(symbol);
					members.forEach(visitNode);
				}
			}

			function typeReference(typeNode: ts.TypeReferenceNode) {
				const typeName = typeNode.typeName;
				const type = checker.getTypeAtLocation(typeName);
				if (type.flags & ts.TypeFlags.EnumLiteral) {
					const symbol = type.symbol || type.aliasSymbol;
					const name = (symbol.name !== '__type' && symbol.name) ? symbol.name : aliasText;
					map.set(name, symbol);
					if (symbol.exports) {
						const members: ts.Node[] = getSymbolExports(symbol);
						members.forEach(visitNode);
					}
				}
				if (type.flags & ts.TypeFlags.Object) {
					const symbol = type.symbol || type.aliasSymbol;
					if (checkValidSymbol(symbol)) {
						const name = (symbol.name !== '__type' && symbol.name) ? symbol.name : aliasText;
						map.set(name, symbol);
						if (symbol.members) {
							const members: ts.Node[] = getSymbolMembers(symbol);
							members.forEach(visitNode);
						}
					}
				}
				const typeArguments = tsc.getTypeArguments(type) || type.aliasTypeArguments;
				if (typeArguments) {
					typeArguments.forEach(t => visitType(t, aliasText));
				}
			}
		}

		function interfaceDeclaration(node: ts.InterfaceDeclaration) {
			const symbol = tsc.getSymbol(node);
			if (symbol) {
				const members: ts.Node[] = getSymbolMembers(symbol);
				members.forEach(visitNode);
			}
		}

		function getAliasText(name: ts.PropertyName) {
			const text = tsc.getText(name);
			if (text) {
				return getAvailableAliasName(U.firstWordCaptalize(text));
			}
			throw new Error('Property name must have text');
		}

		function visitType(type: ts.Type, text: string) {
			if (detectCyclic(type)) {
				return;
			}

			if (type.symbol) {
				if (checkValidSymbol(type.symbol)) {
					map.set(text, type.symbol);
				}
				if (type.symbol.valueDeclaration) {
					visitNode(type.symbol.valueDeclaration);
				} else if (type.symbol.declarations.length) {
					visitNode(type.symbol.declarations[0]);
				}
			}
		}

		function detectCyclic(type: ts.Type) {
			const id = tsc.getID(type);
			if (!id) {
				return false;
			}
			if (visitedTypes.includes(id)) {
				return true;
			}
			visitedTypes.push(id);
			return false;
		}
	}
}

function getSymbolMembers(symbol: ts.Symbol) {
	const array: ts.Node[] = [];
	if (!symbol || !symbol.members) {
		return array;
	}

	symbol.members.forEach(s => {
		if (s.valueDeclaration) {
			array.push(s.valueDeclaration);
		}
	});
	return array;
}

function checkValidSymbol(symbol: ts.Symbol) {
	const array = ['Array', 'Promise', 'Date', 'RegExp'];
	return !array.includes(symbol.name);
}

function descendant(node: ts.Node) {
	const result: ts.Node[] = [];
	aggregate(node);
	return result;

	function aggregate(node: ts.Node) {
		result.push(node);
		node.forEachChild(aggregate);
	}
}


function getSymbolExports(symbol: ts.Symbol) {
	const array: ts.Node[] = [];
	if (!symbol || !symbol.exports) {
		return array;
	}

	symbol.exports.forEach(s => {
		if (s.valueDeclaration) {
			array.push(s.valueDeclaration);
		}
	});
	return array;
}

function getAvailableAliasName(name: string) {
	return name;
}
