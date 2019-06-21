import ts from 'typescript';
import { TSC } from './compiler';
import * as U from './utils';

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

export class NodeInfo {
	public static nozomi(tsc: TSC, node: ts.Node) {
		const result = {} as NodeInfoRoot;

		this.descendant(node)
			.filter(x => this.isMyRequestNode(tsc, x))
			.map(x => visit(tsc, x));

		return result;

		function visit(tsc: TSC, x: ts.Node) {
			/**
			 * TypeNode
			 *
			 * NodeObject
			 * ㄴ parameters
			 *   ㄴ 0: NodeObject
			 *     ㄴ type
			 *       ㄴ typeArguments
			 *         ㄴ 0: NodeObject
			 *           ㄴ typeName
			 *             ㄴ text: ListReq
			 * ㄴ type: NodeObject
			 *   ㄴ typeArguments: Array(1)
			 *     ㄴ 0: NodeObject
			 *       ㄴ typeName
			 *         ㄴ text: ListResp
			 *
			 *
			 */

			const checker = tsc.checker;

			const typeNode = checker.typeToTypeNode(
				checker.getTypeAtLocation(x), node,
				ts.TypeFormatFlags.AllowUniqueESSymbolType |
				ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope) as ts.SignatureDeclaration;

			if (typeNode) {

				// checker는 TypeNode를 생성하기 전에 만들었기 때문에 type을 제대로 가져올 수 없다
				// 참고: https://github.com/Microsoft/TypeScript/issues/19740

				if (typeNode.parameters && typeNode.parameters[0]) {
					const parameter = typeNode.parameters[0] as ts.ParameterDeclaration;

					const paramTypeRef = parameter.type as ts.TypeReferenceNode;
					const returnTypeRef = typeNode.type as ts.TypeReferenceNode;

					const returnType = getTypeNode(returnTypeRef);
					const paramType = getTypeNode(paramTypeRef);

					// retunType이나 paramType에 해당하는 TypeReferenceNode 또는 TypeLiteralNode는 반드시 있어야 한다
					if (!returnType) {
						throw new Error('returnType must not be null');
					}

					if (!paramType) {
						throw new Error('paramType must not be null');
					}

					result.reqArrayType = ts.isArrayTypeNode(paramType);
					result.respArrayType = ts.isArrayTypeNode(returnType);

					const req = typeExtract(paramType, 'Req');
					if (!req) {
						throw new Error('Req must not be null');
					}

					const resp = typeExtract(returnType, 'Resp');
					if (!resp) {
						throw new Error('Resp must not be null');
					}

					const symbols = new Map([...Array.from(req.entries()), ...Array.from(resp.entries())]);
					result.item = { node, req, resp, symbols };
				}
			}

			function getTypeNode(node: ts.TypeReferenceNode): ts.TypeNode | undefined {
				return node && node.typeArguments && node.typeArguments[0]
					? node.typeArguments[0] : undefined;
			}
		}

		function typeExtract(node: ts.Node, aliasName: string) {
			if (ts.isTypeReferenceNode(node) && ts.isEntityName(node.typeName)) {
				const rnode = getEntitiyIdentifier(node.typeName);
				const symbol = tsc.getSymbol(rnode);
				if (symbol) {
					const members: ts.Node[] = NodeInfo.getSymbolMembers(symbol);
					const symbols = NodeInfo.getAllReferencedSymbols(tsc, members);
					symbols.set(aliasName, symbol);
					return symbols;
				}
				throw new Error('EntityName must have symbol');
			}

			if (ts.isTypeLiteralNode(node)) {
				const members: ts.Node[] = Array.from(node.members);
				const symbols = NodeInfo.getAllReferencedSymbols(tsc, members);
				symbols.set(aliasName, node);
				return symbols;
			}

			if (ts.isArrayTypeNode(node)) {
				const elementType = node.elementType;
				if (ts.isTypeLiteralNode(elementType)) {
					const members: ts.Node[] = Array.from(elementType.members);
					const symbols = NodeInfo.getAllReferencedSymbols(tsc, members);
					symbols.set(aliasName, node);
					return symbols;
				}
			}
			return null;

			function getEntitiyIdentifier(typeName: ts.EntityName) {
				return ('right' in typeName) ? typeName.right : typeName;
			}
		}
	}

	public static nozomiHandler(tsc: TSC, node: ts.Node) {
		const result = {} as NodeInfoRoot;
		result.item = {} as NodeInfoItem;
		const symbols = getSymbols(node);
		result.item.node = node;
		result.item.symbols = symbols;
		return result;

		function getSymbols(node: ts.Node): Map<string, NodeType> {
			const symbol = tsc.getSymbol(node);
			if (symbol) {
				const members: ts.Node[] = NodeInfo.getSymbolMembers(symbol);
				const symbols = NodeInfo.getAllReferencedSymbols(tsc, members);
				symbols.set('Base', symbol);
				return symbols;
			}
			return new Map<string, NodeType>();
		}
	}

	public static descendant(node: ts.Node) {
		const result: ts.Node[] = [];
		aggregate(node);
		return result;

		function aggregate(node: ts.Node) {
			result.push(node);
			node.forEachChild(aggregate);
		}
	}

	public static isMyRequestNode(tsc: TSC, node: ts.Node) {
		/**
		 * TypeObject
		 * ㄴ symbol: SymbolObject
		 *   ㄴ valueDeclaration: NodeObject
		 *     ㄴ parameters: Array(1) [NodeObject]
		 *       ㄴ 0: NodeObject
		 *         ㄴ type: NodeObject <TypeReferenceNode>
		 *           ㄴ typeName: IdentifierObject
		 *             ㄴ text: MyRequest
		 */

		const checker = tsc.checker;
		const symbol = checker.getSymbolAtLocation(node);
		if (symbol) {
			const declaration = symbol.valueDeclaration as ts.SignatureDeclaration;
			if (declaration) {
				const parameters = declaration.parameters;
				if (parameters && parameters[0] && parameters[0].type) {
					const typeReference = parameters[0].type as ts.TypeReferenceNode;
					return typeReference.typeName.getText() === 'MyRequest';
				}
			}
		}
		return false;
	}
	public static getSymbolMembers(symbol: ts.Symbol) {
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

	// kind 153 = PropertySignature
	public static getAllReferencedSymbols(tsc: TSC, root: ts.Node[]) {
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

					const members = NodeInfo.getSymbolMembers(symbol);
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
					map.set(aliasText, symbol);
					if (symbol.members) {
						const members: ts.Node[] = NodeInfo.getSymbolMembers(symbol);
						members.forEach(visitNode);
					}
				}

				function typeReference(typeNode: ts.TypeReferenceNode) {
					const typeName = typeNode.typeName;
					const type = checker.getTypeAtLocation(typeName);
					if (type.flags & ts.TypeFlags.EnumLiteral) {
						const symbol = type.symbol || type.aliasSymbol;
						map.set(aliasText, symbol);
						if (symbol.exports) {
							const members: ts.Node[] = NodeInfo.getSymbolExports(symbol);
							members.forEach(visitNode);
						}
					}
					if (type.flags & ts.TypeFlags.Object) {
						const symbol = type.symbol || type.aliasSymbol;
						if (checkValidSymbol(symbol)) {
							map.set(symbol.name, symbol);
							if (symbol.members) {
								const members: ts.Node[] = NodeInfo.getSymbolExports(symbol);
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
					const members: ts.Node[] = NodeInfo.getSymbolMembers(symbol);
					members.forEach(visitNode);
				}
			}

			function getAliasText(name: ts.PropertyName) {
				const text = tsc.getText(name);
				if (text) {
					return NodeInfo.getAvailableAliasName(U.firstWordCaptalize(text));
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

		function checkValidSymbol(symbol: ts.Symbol) {
			const array = ['Array', 'Promise', 'Date', 'RegExp'];
			return !array.includes(symbol.name);
		}
	}

	public static getAvailableAliasName(name: string) {
		return name;
	}

	public static getSymbolExports(symbol: ts.Symbol) {
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

}
