import * as WebSocket from 'ws';
import Timer = NodeJS.Timer;
const port = 40510;
const wss = new WebSocket.Server({ port });
console.log(`nozomi: websocket server open. port: ${port}`);

let timer: Timer;

wss.on('connection', (ws: WebSocket) => {
	let counter = 0;

	timer = setInterval(() => {
		if (ws && ws.readyState === WebSocket.OPEN) {
			const value = Math.sin(counter++ * 0.1);
			const data = {
				ty: 3,
				type: 'WSTest',
				message: 'wstest_message',
			};
			ws.send(JSON.stringify(data));
			console.log('send');
		} else {
			clearInterval(timer);
		}
	}, 1000); // ~ 256 Hz
});
