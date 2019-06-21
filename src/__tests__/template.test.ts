import * as U from '@src/utils';
import * as G from '@src/generator';
import { Render } from '@src/template';

import { TSC } from '@src/compiler';
import { CSharpContext } from '@transform/csharp';

const csharpContext = new CSharpContext();
const tsc = new TSC({}, csharpContext);

/**
 * template.json을 읽어 CS 코드를 제너레이트하고, 예상되는 결과가 같은지 대조합니다
 */
export function assertTemplate(name: string) {
	const templatePath = `./__tests__/testcases/template/${name}/template.json`;
	const expectedPath = `./__tests__/testcases/template/${name}/expected.cs`;

	const template = U.loadJson(templatePath);
	const actual = Render.nozomi(template.api);
	const expected = U.loadFile(expectedPath);

	expect(actual).toMatch(expected);
}

describe.skip('template.test', () => {
	test('enum type', () => assertTemplate('enum-type'));
});
