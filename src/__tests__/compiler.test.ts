import * as U from '@src/utils';
import * as G from '@src/generator';

import { TSC } from '@src/compiler';
import { CSharpContext } from '@transform/csharp';

const csharpContext = new CSharpContext();
const tsc = new TSC({}, csharpContext);

/**
 * code 파일을 읽어 컴파일하고 expected 값과 대조합니다
 *
 * basePath: /__tests__/testcases/{name}
 * actual: {basePath}/code.ts
 * expected: {basePath}/expected.json
 */
export function assertCode(tsc: TSC, name: string) {
	const codePath = `./__tests__/testcases/${name}/code.ts`;
	const expectedPath = `./__tests__/testcases/${name}/expected.json`;

	const ast = tsc.loadFile(codePath)!;
	const actual = G.generate(tsc, ast)[0];
	const expected = U.loadJson(expectedPath);

	expect(actual).toMatchObject(expected);
}

export function assertCodeThrow(tsc: TSC, name: string, exceptionMsg: string) {
	try {
		assertCode(tsc, name);
		throw new Error('This test must be thrown exception');
	} catch (e) {
		expect(e.toString()).toBe(exceptionMsg);
	}
}

describe('compiler.test', () => {
	test('empty handler', () => assertCode(tsc, 'empty-handler'));
	test('regexp', () => assertCode(tsc, 'regexp'));
	test('date', () => assertCode(tsc, 'date'));
	test('nested object', () => assertCode(tsc, 'nested-object'));
	test('nullable type', () => assertCode(tsc, 'nullable-type'));
	test('enum type', () => assertCode(tsc, 'enum-type'));
	test('union type', () => assertCodeThrow(tsc, 'union-type', 'Error: Union type not supported'));
	test('non primitive type', () => assertCodeThrow(tsc, 'non-primitive', 'Error: Non primitive type not supported'));
});
