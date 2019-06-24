/**
 * Nozomi Server를 이용한 통합 테스트
 * 노조미 개발 서버를 로컬호스트에 띄운 후 테스트를 돌리고 끝나면 서버를 끈다
 * 실패하거나 로그 생성이 안되면 빌드가 멈춤
 */
import app from '../server/src/app';
import { execCommand } from './utils';

async function listenNozomiServer(port: number) {
	return app.listen(port, '127.0.0.1', () => {
		console.log(`nozomi: server open. 127.0.0.1:${port}`);
	});
}

async function main() {
	const cmd = 'dotnet';
	const args = 'test csproject/NozomiAPITest --logger trx;LogFileName=../../../output/APITestResults.xml';
	const port = 12396;
	const server = await listenNozomiServer(port);
	await execCommand(cmd, args.split(/\s/)).finally(() => {
		server.close();
	});
}
main();
