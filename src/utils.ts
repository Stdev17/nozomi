import ts from 'typescript';

import _ from 'lodash';
import path from 'path';
import glob from 'glob';
import fse from 'fs-extra';
import findUp from 'findup-sync';
import relaxedJson from 'relaxed-json';

import { paths } from '../src/config';

interface CompilerOptionsWrapper {
	compilerOptions?: ts.CompilerOptions;
}

export function firstWordCaptalize(text: string) {
	return text[0].toUpperCase() + text.substr(1);
}

export function clean(dir: string) {
	try {
		const files = glob.sync(dir);
		files.forEach(f => fse.unlinkSync(f));
	} catch { /* */ }
}

export function outputClean() {
	const outputPath = paths.output;
	console.log(`clean output folder: ${outputPath}`);
	clean(outputPath);
}

export function toCaseName(name: string) {
	name = _.camelCase(name);
	return name[0].toUpperCase() + name.substr(1);
}

export function getCompilerOptions(files: string[]): ts.CompilerOptions {
	files = files.map(f => path.resolve(f));

	const compilerOptions: ts.CompilerOptions = {
		/* 이 옵션을 켜야 external library에서 type checking이 제대로 됨! */
		allowSyntheticDefaultImports: true,
	};

	const resolvedFileName = path.resolve(files[0]);
	const tsConfFileName = findUp('tsconfig.json', {
		cwd: resolvedFileName,
	}) as string;

	if (!tsConfFileName) {
		throw new Error('invalid paths');
	}

	const configFile = ts.readConfigFile(tsConfFileName, ts.sys.readFile);

	if (configFile.error) {
		console.error('Failed to find tsconfig.json in parent folder: ');
		console.error(configFile.error);
		return compilerOptions;
	}

	/**
	 * Mapped Path가 Resolve 되어야 하므로
	 * CompilerOptions의 baseUrl을 tsconfig.json의 위치로 바꿈
	 */
	const input = fse.readFileSync(tsConfFileName, { encoding: 'utf8' });
	const tsconfig = relaxedJson.parse(input) as CompilerOptionsWrapper;
	if (tsconfig && tsconfig.compilerOptions) {
		const tsConfDirName = path.dirname(tsConfFileName);

		compilerOptions.baseUrl = tsConfDirName;
		compilerOptions.paths = tsconfig.compilerOptions.paths;
		compilerOptions.target = tsconfig.compilerOptions.target;
		compilerOptions.module = tsconfig.compilerOptions.module;

		compilerOptions.typeRoots = tsconfig.compilerOptions.typeRoots || [];
		compilerOptions.typeRoots!.push(path.join(path.dirname(tsConfFileName), 'node_modules', '@types'));
	}

	return compilerOptions;
}

export function loadJson(name: string) {
	return fse.readJSONSync(path.join(__dirname, name));
}

export function loadFile(name: string) {
	return fse.readFileSync(path.join(__dirname, name), { encoding: 'utf8'});
}

export function getSourceFileName(node: ts.Node) {
	return path.basename(node.getSourceFile().fileName);
}

export function getUniqueArray<T>(array: T[]) {
	return array.filter((item, index) => {
		return index === array.findIndex(obj => {
			return JSON.stringify(obj) === JSON.stringify(item);
		});
	});
}

export function getNozomiNamespace() {
	return (process.env.NOZOMI_NAMESPACE) ?
		process.env.NOZOMI_NAMESPACE : 'Nozomi';
}
