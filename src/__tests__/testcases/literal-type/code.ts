interface LiteralTypeReq {
	b: true;
	n: 1;
	s: 'string';
}

interface LiteralTypeResp {
	b: true;
	n: 1;
	s: 'string';
}

class MyRequest<T extends object> { }
async function sampleAPIHandler(req: MyRequest<LiteralTypeReq>): Promise<LiteralTypeResp> {
	return {} as Promise<LiteralTypeResp>;
}

/**
 * @nozomi LiteralType
 * @swagger
 * /sample/literaltype:
 *   post:
 *     summary: literaltype
 *     tags: [test]
 */
const sampleAPI = sampleAPIHandler({});
