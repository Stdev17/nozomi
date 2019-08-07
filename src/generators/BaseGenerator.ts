import ts from 'typescript';
import { TSC } from '../compiler';

export interface TagNodePair {
	type: string;
	node: ts.Node;
}

export abstract class BaseGenerator<T> {
	public abstract generate(
		tsc: TSC,
		sourceFile: ts.SourceFile,
	): Array<{ name: string, api: T }>;

	public abstract outputScript(objects: Array<{
		name: string;
		api: T;
	}>): void;
}
