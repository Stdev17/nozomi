import express from 'express';
import 'express-async-errors';
import { mgsPackResponse } from './msgpack';
import { PublicNozomiController, PrivateNozomiController, handle } from './controller';

const opened = new PublicNozomiController();
const closed = new PrivateNozomiController();

/**
 * @nozomi NozomiSimpleGet
 * @swagger
 * /simple:
 *   get:
 *     summary: simple get
 *     tags: [nozomi]
 */
const lazy_get = handle(opened.simple_get.bind(opened), undefined);

/**
 * @nozomi NozomiSimplePost
 * @swagger
 * /simple:
 *   post:
 *     summary: simple post
 *     tags: [nozomi]
 */
const lazy_post = handle(opened.simple_post.bind(opened), undefined);

/**
 * @nozomi NozomiSimpleDelete
 * @swagger
 * /simple:
 *   delete:
 *     summary: simple delete
 *     tags: [nozomi]
 */
const lazy_delete = handle(opened.simple_delete.bind(opened), undefined);

/**
 * @nozomi NozomiSimplePut
 * @swagger
 * /simple:
 *   put:
 *     summary: simple put
 *     tags: [nozomi]
 */
const lazy_put = handle(opened.simple_put.bind(opened), undefined);

/**
 * @nozomi NozomiTimeout
 * @swagger
 * /timeout:
 *   get:
 *     summary: timeout
 *     tags: [nozomi]
 */
const timeout = handle(opened.timeout.bind(opened), undefined);

/**
 * @nozomi NozomiSampleError
 * @swagger
 * /error:
 *   get:
 *     summary: sample error
 *     tags: [nozomi]
 */
const simple_error = handle(opened.error.bind(opened), undefined);

/**
 * @nozomi NozomiUserGet
 * @swagger
 * /user:
 *   get:
 *     summary: user get
 *     tags: [nozomi]
 */
const user_get = handle(closed.user_get.bind(closed), undefined);

/**
 * @nozomi NozomiUserPost
 * @swagger
 * /user:
 *   post:
 *     summary: user post
 *     tags: [nozomi]
 */
const user_post = handle(closed.user_post.bind(closed), undefined);

/**
 * @nozomi NozomiStringEnumGet
 * @swagger
 * /enum/string:
 *   get:
 *     summary: string enum get
 *     tags: [nozomi]
 */
const enum_string_get = handle(opened.enum_string_get.bind(opened), undefined);

/**
 * @nozomi NozomiStringEnumPost
 * @swagger
 * /enum/string:
 *   post:
 *     summary: string enum post
 *     tags: [nozomi]
 */
const enum_string_post = handle(opened.enum_string_post.bind(opened), undefined);

/**
 * @nozomi NozomiStringEnumDelete
 * @swagger
 * /enum/string:
 *   delete:
 *     summary: string enum delete
 *     tags: [nozomi]
 */
const enum_string_delete = handle(opened.enum_string_delete.bind(opened), undefined);

/**
 * @nozomi NozomiStringEnumPut
 * @swagger
 * /enum/string:
 *   put:
 *     summary: string enum put
 *     tags: [nozomi]
 */
const enum_string_put = handle(opened.enum_string_put.bind(opened), undefined);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mgsPackResponse({ auto_detect: true }));

app.get('/simple', lazy_get);
app.post('/simple', lazy_post);
app.delete('/simple', lazy_delete);
app.put('/simple', lazy_put);
app.get('/timeout', timeout);
app.get('/error', simple_error);
app.get('/user', user_get);
app.post('/user', user_post);
app.get('/enum/string', enum_string_get);
app.post('/enum/string', enum_string_post);
app.delete('/enum/string', enum_string_delete);
app.put('/enum/string', enum_string_put);

export default app;
