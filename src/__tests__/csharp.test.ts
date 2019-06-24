import { TSC } from '../compiler';
import { CSharpContext } from '../transform/csharp';

const csharpContext = new CSharpContext();
const tsc = new TSC({}, csharpContext);

function assertType(code: string, expectType: string) {
	const ast = tsc.compile(code)!;
	const checker = tsc.checker;
	const node = tsc.getIdentifier(ast, 'a')!;
	const type = checker.getTypeAtLocation(node);
	expect(tsc.transform.obtainTypeName(type)).toBe(expectType);
}

describe('obtainTypeName', () => {
	test('string', () => assertType('var a: string;', 'string'));
	test('boolean', () => assertType('var a: boolean;', 'bool'));
	test('number', () => assertType('var a: number;', 'int'));
	test('type array string', () => assertType('var a: string[];', 'List<string>'));
	test('string array', () => assertType('var a: Array<string>;', 'List<string>'));
	test('typealias number', () => assertType('type int = number; var a: int;', 'int'));
	test('non-primitive object', () => assertType('var a: { b: number }', '__type'));
	test('regexp object', () => assertType('var a: { b: RegExp }', '__type'));

});
