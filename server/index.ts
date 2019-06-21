import app from './app';

const port = 12396;
app.listen(port, () => {
	console.log(`nozomi: server open. port: ${port}`);
});
