import * as U from './utils';

import { TSC } from './compiler';
import { generate, outputScript } from './generators';
import { CSharpContext } from './transform/csharp';

async function main(files: string[]) {
	const csharpContext = new CSharpContext();
	const tsc = new TSC(U.getCompilerOptions(files), csharpContext);
	tsc.load(files);

	const program = tsc.program;
	U.outputClean();

	if (!program.getSourceFiles().length) {
		throw new Error('SourceFile is empty');
	}

	for (const sf of program.getSourceFiles()) {
		if (sf.isDeclarationFile) {
			continue;
		}

		outputScript(generate(tsc, sf));
	}
}

if (!process.env.TARGET_FILES) {
	console.log('TARGET_FILES REQUIRED');
} else {
	main(process.env.TARGET_FILES.split(','));
}
