import express from 'express';
import { Request } from 'express';
import _ from 'lodash';
import * as yup from 'yup';

type Modify<T, R> = Pick<T, Exclude<keyof T, keyof R>> & R;

interface MyRequest<T extends object> {
	body: T;
	req: express.Request;
	res: express.Response;
}

const readArguments = async <T extends object>(
	raw: object,
	schema: yup.ObjectSchema<yup.Shape<{}, T>> | undefined,
) => {
	if (schema) {
		return await schema.validate(raw, { abortEarly: true });
	} else {
		return raw as T;
	}
};

// query같은 경우 key=string, value=string인걸 알지만
// express.Request에 있던 타입 그대로 갖다붙임
interface SimpleRequest {
	body: Request['body'];
	query: Request['query'];
	params: Request['params'];
}

// TODO T의 내부 타입을 보고 분기할수 있으면 좋겠다
// req.body가 string으로 들어와도 T에 number로 선언한것은 number가 되면 좋겠다
export const getRequestContext = <T>(req: SimpleRequest): T => {
	const list: Array<Request['body'] | Request['query'] | Request['params']> = [];
	if (!_.isEmpty(req.body)) { list.push(req.body); }
	if (!_.isEmpty(req.query)) { list.push(req.query); }
	if (!_.isEmpty(req.params)) { list.push(req.params); }

	let body: { [P in keyof T]?: any; } = {};
	for (const x of list) {
		body = { ...body, ...x };
	}

	return body as Required<T>;
};

type RequestSchema<T extends object> = yup.ObjectSchema<yup.Shape<{}, T>> | undefined;

export const makeRequest = async <T extends object>(
	req: express.Request,
	res: express.Response,
	schema: RequestSchema<T>,
): Promise<MyRequest<T>> => {
	const raw = getRequestContext<T>({
		body: req.body,
		params: req.params,
		query: req.query,
	});
	const body = await readArguments(raw, schema);
	console.log({ body });
	return {
		body,
		req,
		res,
	};
};

interface SimpleReq {
	n: number;
	s: string;
	b: boolean;
}

interface SimpleResp {
	method: string;
	num: number;
	str: string;
	bool_flag: boolean;
}

function convert(method: string, body: SimpleReq): SimpleResp {
	return {
		method,
		num: body.n,
		str: body.s,
		bool_flag: body.b,
	};
}

const schema = yup.object().shape<SimpleReq>({
	n: yup.number().required(),
	s: yup.string().required(),
	b: yup.boolean().required(),
});

enum StringEnumType {
	Apple = 'apple',
	Google = 'google',
	Microsoft = 'microsoft',
	Samsung = 'samsung',
}

interface EnumStringReq {
	a: StringEnumType;
	g: StringEnumType;
	m: StringEnumType;
	s: StringEnumType;
}

type EnumStringReqInit = Modify<EnumStringReq, {
	a: string;
	g: string;
	m: string;
	s: string;
}>;

interface EnumStringResp {
	method: string;
	Apple: StringEnumType;
	Google: StringEnumType;
	Microsoft: StringEnumType;
	Samsung: StringEnumType;
}

const enumStringSchema = yup.object().shape<EnumStringReqInit>({
	a: yup.string().required(),
	g: yup.string().required(),
	m: yup.string().required(),
	s: yup.string().required(),
}) as yup.ObjectSchema<yup.Shape<object, EnumStringReq>>;

function enumStringConvert(method: string, body: EnumStringReq): EnumStringResp {
	return {
		method,
		Apple: body.a,
		Google: body.g,
		Microsoft: body.m,
		Samsung: body.s,
	};
}


export class PublicNozomiController {
	private async lazy(method: string, req: MyRequest<SimpleReq>): Promise<SimpleResp> {
		const body = await schema.validate(req.body);
		return convert(method, body);
	}

	public async simple_get(req: MyRequest<SimpleReq>) { return this.lazy('GET', req); }
	public async simple_post(req: MyRequest<SimpleReq>) { return this.lazy('POST', req); }
	public async simple_delete(req: MyRequest<SimpleReq>) { return this.lazy('DELETE', req); }
	public async simple_put(req: MyRequest<SimpleReq>) { return this.lazy('PUT', req); }

	private async enumStringLazy(method: string, req: MyRequest<EnumStringReq>): Promise<EnumStringResp> {
		const body = await enumStringSchema.validate(req.body);
		return enumStringConvert(method, body);
	}

	public async enum_string_get(req: MyRequest<EnumStringReq>) { return this.enumStringLazy('GET', req); }
	public async enum_string_post(req: MyRequest<EnumStringReq>) { return this.enumStringLazy('POST', req); }
	public async enum_string_delete(req: MyRequest<EnumStringReq>) { return this.enumStringLazy('DELETE', req); }
	public async enum_string_put(req: MyRequest<EnumStringReq>) { return this.enumStringLazy('PUT', req); }

	public async error(req: MyRequest<SimpleReq>) {
		req.res.status(401);

		return {
			name: 'StandardError',
			message: 'nozomi sample error',
			code: 123,
		};
	}
}

export class PrivateNozomiController {
	private async execute(method: string, req: MyRequest<SimpleReq>) {
		const body = await schema.validate(req.body);
		return convert(method, body);
	}

	public processAuth<T extends object>(req: MyRequest<T>) {
		const auth = req.req.headers.authorization;
		if (auth !== 'Bearer 1234567890ABCDEF') { throw new Error('invalid auth'); }
	}

	public async user_get(req: MyRequest<SimpleReq>) {
		this.processAuth(req);
		return this.execute('GET', req);
	}
	public async user_post(req: MyRequest<SimpleReq>) {
		this.processAuth(req);
		return this.execute('POST', req);
	}
}


type Handler<Req extends object, Resp> = (req: MyRequest<Req>) => Promise<Resp>;

const onHandle = async <Req extends object, Resp>(req: express.Request, res: express.Response, handler: Handler<Req, Resp>, schema: RequestSchema<Req>) => {
	const r = await makeRequest<Req>(req, res, schema);
	const resp: Resp = await handler(r);
	res.json(resp);
};

type ExpressHandler = (req: express.Request, res: express.Response) => Promise<void>;

export const handle = <Req extends object, Resp>(handler: Handler<Req, Resp>, schema: RequestSchema<Req>): ExpressHandler => {
	return async (req: express.Request, res: express.Response) => {
		await onHandle(req, res, handler, schema);
	};
};
