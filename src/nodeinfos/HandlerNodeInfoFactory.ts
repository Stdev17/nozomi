import ts from 'typescript';
import {
	BaseNodeInfoFactory,
	NodeInfoRoot,
	NodeInfoItem,
	NodeType,
} from './BaseNodeInfoFactory';

export class HandlerNodeInfoFactory extends BaseNodeInfoFactory {
	public create(node: ts.Node) {
		const result = {} as NodeInfoRoot;
		result.item = {} as NodeInfoItem;
		const symbols = this.getSymbols(node);
		result.item.node = node;
		result.item.symbols = symbols;
		return result;
	}

	private getSymbols(node: ts.Node): Map<string, NodeType> {
		const symbol = this.tsc.getSymbol(node);
		if (symbol) {
			const members: ts.Node[] = this.getSymbolMembers(symbol);
			const symbols = this.getAllReferencedSymbols(this.tsc, members);
			symbols.set('Base', symbol);
			return symbols;
		}
		return new Map<string, NodeType>();
	}
}
