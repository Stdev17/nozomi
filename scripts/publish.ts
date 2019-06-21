import glob from 'glob';
import path from 'path';
import fse from 'fs-extra';

import { paths } from '../src/config';
import { execCommand } from './utils';
import { clean } from '@src/utils';

const namespace = process.env.NOZOMI_NAMESPACE;

async function build(basePath: string, buildPath: string) {
	console.log(`clean build folder: ${buildPath}`);
	clean(path.resolve(buildPath + '/*.*'));
	const outputPath = paths.output;

	await execCommand('dotnet', ['publish', basePath]);

	const files = glob.sync(buildPath + '/!(MessagePack|System)*.dll');
	files.forEach(f => {
		let fileName = path.basename(f);
		if (namespace && fileName === 'Nozomi.dll') {
			fileName = namespace + '.dll';
		}
		if (!fse.pathExistsSync(outputPath)) {
			fse.mkdirSync(outputPath);
		}
		fse.copyFileSync(f, path.resolve(outputPath, fileName));
		console.log(`Publish: ${path.resolve(outputPath, fileName)}`);
	});
}

async function main() {
	await build(
		paths.csproj.base,
		path.resolve(paths.csproj.base, 'bin/Debug/netstandard2.0/publish'),
	);
	await build(
		paths.csproj.managedClient,
		path.resolve(paths.csproj.managedClient, 'bin/Debug/netstandard2.0/publish'),
	);
}

main();
