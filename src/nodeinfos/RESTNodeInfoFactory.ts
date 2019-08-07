import ts from 'typescript';
import { TSC } from '../compiler';
import {
	BaseNodeInfoFactory,
	NodeInfoRoot,
} from './BaseNodeInfoFactory';

export class RESTNodeInfoFactory extends BaseNodeInfoFactory {
	public create(node: ts.Node) {
		const { tsc } = this;
		const result = {} as NodeInfoRoot;

		this.descendant(node)
			.filter(x => isMyRequestNode(tsc, x))
			.map(x => this.visit(tsc, node, x, result));

		return result;
	}

	private visit(tsc: TSC, node: ts.Node, x: ts.Node, result: NodeInfoRoot) {
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

				const req = this.typeExtract(paramType, 'Req');
				if (!req) {
					throw new Error('Req must not be null');
				}

				const resp = this.typeExtract(returnType, 'Resp');
				if (!resp) {
					throw new Error('Resp must not be null');
				}

				const symbols = new Map([
					...Array.from(req.entries()),
					...Array.from(resp.entries()),
				]);
				result.item = { node, req, resp, symbols };
			}
		}

		function getTypeNode(node: ts.TypeReferenceNode): ts.TypeNode | undefined {
			return node && node.typeArguments && node.typeArguments[0]
				? node.typeArguments[0] : undefined;
		}
	}

	protected typeExtract(node: ts.Node, aliasName: string) {
		const { tsc } = this;

		if (ts.isTypeReferenceNode(node) && ts.isEntityName(node.typeName)) {
			const rnode = getEntitiyIdentifier(node.typeName);
			const symbol = tsc.getSymbol(rnode);
			if (symbol) {
				const members: ts.Node[] = this.getSymbolMembers(symbol);
				const symbols = this.getAllReferencedSymbols(tsc, members);
				symbols.set(aliasName, symbol);
				return symbols;
			}
			throw new Error('EntityName must have symbol');
		}

		if (ts.isTypeLiteralNode(node)) {
			const members: ts.Node[] = Array.from(node.members);
			const symbols = this.getAllReferencedSymbols(tsc, members);
			symbols.set(aliasName, node);
			return symbols;
		}

		if (ts.isArrayTypeNode(node)) {
			const elementType = node.elementType;
			if (ts.isTypeLiteralNode(elementType)) {
				const members: ts.Node[] = Array.from(elementType.members);
				const symbols = this.getAllReferencedSymbols(tsc, members);
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

function isMyRequestNode(tsc: TSC, node: ts.Node) {
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
