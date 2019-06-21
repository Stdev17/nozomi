import ts from 'typescript';

import fse from 'fs-extra';
import path from 'path';

import { TransformContext } from './transform';

export type NodeType = ts.Symbol | ts.TypeLiteralNode | ts.ArrayTypeNode;

export class TSC {
	public options: ts.CompilerOptions;
	public host: ts.CompilerHost;
	public program: ts.Program;
	public checker: ts.TypeChecker;

	public files: { [key: string]: { version: number; text: string; } };
	public inputFiles: string[];
	public count: number;

	public transform: TransformContext;

	constructor(options: ts.CompilerOptions = {}, transform: TransformContext) {
		if (options.target == null) {
			options.target = ts.ScriptTarget.ES5;
		}

		if (options.module == null) {
			options.module = ts.ModuleKind.CommonJS;
		}

		this.inputFiles = [];
		this.files = {};
		this.options = options;
		this.count = 1;
		this.transform = transform;
	}

	public load(input: string[]) {
		this.inputFiles = input;
		this.program = ts.createProgram(input, this.options, this.host, this.program);
		this.checker = this.program.getTypeChecker();
	}

	public loadFile(input: string) {
		const paths = path.join(__dirname, input);
		const code = fse.readFileSync(paths, 'utf8');
		return this.compile(code);
	}

	public compile(code: string, fileName?: string) {
		if (!fileName) {
			fileName = this.count + '.ts';
		}

		if (!this.program) {
			this.host = this.createHost();
		}

		const file = this.files[fileName];
		if (file) {
			file.text = code;
			file.version++;
		} else {
			this.files[fileName] = { version: 0, text: code };
		}

		const rootNames = Object.keys(this.files);
		this.program = ts.createProgram(rootNames, this.options, this.host, this.program);
		this.checker = this.program.getTypeChecker();

		return this.program.getSourceFile(fileName);
	}

	private createHost(): ts.CompilerHost {
		return {
			getSourceFile: this.getSourceFile.bind(this),
			getDefaultLibFileName: this.getDefaultLibFileName.bind(this),
			getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
			getDirectories: (path) => ts.sys.getDirectories(path),
			getNewLine: () => ts.sys.newLine,
			getCanonicalFileName: fileName =>
				ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
			readFile: (fileName) => ts.sys.readFile(fileName),
			writeFile: (fileName, content) => ts.sys.writeFile(fileName, content),
			fileExists: (fileName) => ts.sys.fileExists(fileName),
			useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
		};
	}

	private getSourceFile(
		fileName: string,
		languageVersion: ts.ScriptTarget,
		onError?: (message: string) => void,
	) {
		const baseDir = path.dirname(require.resolve('typescript'));

		const sourceText = (this.files[fileName]) ? this.files[fileName].text :
			ts.sys.readFile(path.join(baseDir, fileName)) ||
			ts.sys.readFile(path.join(this.host.getCurrentDirectory(), fileName));

		return sourceText !== undefined
			? ts.createSourceFile(fileName, sourceText, languageVersion)
			: undefined;
	}

	private getDefaultLibFileName(options: ts.CompilerOptions) {
		switch (options.target) {
			case ts.ScriptTarget.ES2015:
				return 'lib.es6.d.ts';
			case ts.ScriptTarget.ES2016:
				return 'lib.es2016.d.ts';
			case ts.ScriptTarget.ES2017:
			case ts.ScriptTarget.ESNext:
			case ts.ScriptTarget.Latest:
				return 'lib.es2017.d.ts';
			default:
				return 'lib.d.ts';
		}
	}

	public printNodes(root: ts.Node | undefined) {
		if (!root) {
			return;
		}

		const result: string[] = [];
		const visit = (node: ts.Node, depth: number) => {

			const type = this.checker.getTypeAtLocation(node);
			const typestring = this.checker.typeToString(type);

			let output = '  '.repeat(depth) + ts.SyntaxKind[node.kind];
			if (ts.isIdentifier(node)) {
				output += ' ' + node.getText();
			}
			output += ': ' + typestring;
			result.push(output);
			node.forEachChild(x => visit(x, depth + 1));
		};
		root.forEachChild(x => visit(x, 0));
		console.log(result.join('\r\n'));
	}

	public getIdentifier(root: ts.Node, name: string) {
		let findNode: ts.Identifier | null = null;
		root.forEachChild(visitNode);
		return findNode;

		function visitNode(node: ts.Node) {
			if (findNode !== null || ts.isImportDeclaration(node)) {
				return;
			}

			if (ts.isIdentifier(node) && node.getText() === name) {
				findNode = node;
				return;
			}
			node.forEachChild(visitNode);
		}
	}

	public getID<T>(obj: T) {
		return (obj as T & { id?: number }).id;
	}

	public getSymbol<T>(obj: T) {
		return (obj as T & { symbol?: ts.Symbol }).symbol;
	}

	public getType<T>(obj: T) {
		return (obj as T & { type?: ts.Type }).type;
	}

	public getText<T>(obj: T) {
		return (obj as T & { text?: string }).text;
	}

	public getInitializer<T>(obj: T) {
		return (obj as T & { initializer?: ts.Node }).initializer;
	}

	public getTypeArguments(type: ts.Type) {
		return (type as ts.Type & { typeArguments?: ts.Type[] }).typeArguments;
	}

	public isTypeLiteralNode(s: NodeType) {
		return ts.isTypeLiteralNode(s as ts.Node);
	}

	public isArrayTypeNode(s: NodeType) {
		return ts.isArrayTypeNode(s as ts.Node);
	}

	public isRegularEnumNode(s: NodeType) {
		return s.flags === ts.SymbolFlags.RegularEnum;
	}

	public isEnumType(type: ts.Type) {
		return !!(type.flags & ts.TypeFlags.EnumLiteral);
	}

}
