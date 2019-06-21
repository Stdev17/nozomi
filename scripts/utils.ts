import glob from 'glob';
import fse from 'fs-extra';
import iconv from 'iconv-lite';
import { spawn } from 'child_process';

interface ExecCommandOptions {
	noError?: boolean;
}

export function execCommand(cmd: string, args: string[], options: ExecCommandOptions = {}) {
	return new Promise((resolve, reject) => {
		const c = spawn(cmd, args, { env: process.env });
		c.stdout.on('data', data => {
			const text = iconv.decode(data, 'euc-kr');
			console.log(text);
		});

		c.stderr.on('data', data => {
			const text = iconv.decode(data, 'euc-kr');
			console.error(text);
		});

		c.on('exit', code => {
			if (code && !options.noError) {
				reject('test process exited with code ' + code);
			}
			resolve();
		});
	});
}

export function clean(dir: string) {
	try {
		const files = glob.sync(dir);
		files.forEach(f => fse.unlinkSync(f));
	} catch { /* */ }
}
