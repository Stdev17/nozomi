import path from 'path';

/**
 * __dirname은 현재 파일의 경로를 가져오는데 publish는 외부에서 실행됨
 * 스크립트를 실행중인 폴더를 가져와야 한다
 */
const runningPath = path.resolve('.');

export const paths = {
	root: __dirname,
	running: runningPath,
	csproj: {
		base: path.resolve(__dirname, '../csproject/Nozomi'),
		managedClient: path.resolve(__dirname, '../csproject/Nozomi.ManagedClient'),
		test: path.resolve(__dirname, '../csproject/NozomiTest'),
		generated: path.resolve(__dirname, '../csproject/Nozomi/Generated'),
	},
	output: path.resolve(runningPath, 'output'),
};
