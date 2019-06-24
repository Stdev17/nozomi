import path from 'path';

/**
 * __dirname은 현재 파일의 경로를 가져오는데 publish는 외부에서 실행됨
 * 스크립트를 실행중인 폴더를 가져와야 한다
 */
const runningPath = path.resolve('.');

/**
 * ts-node: src/foo.ts
 * tsc + node: dist/src/foo.js
 * 경로의 깊이가 다르다
 */
function getRootPath() {
	if (process.argv[0].includes('ts-node')) {
		return path.resolve(__dirname, '..');
	} else {
		return path.resolve(__dirname, '../..');
	}
}

const rootPath = getRootPath();
const csprojPath = path.resolve(rootPath, 'csproject');

export const paths = {
	root: rootPath,
	running: runningPath,
	csproj: {
		base: path.resolve(csprojPath, 'Nozomi'),
		managedClient: path.resolve(csprojPath, 'Nozomi.ManagedClient'),
		test: path.resolve(csprojPath, 'NozomiTest'),
		generated: path.resolve(csprojPath, 'Nozomi/Generated'),
	},
	output: path.resolve(runningPath, 'output'),
};
