interface NonPrimitiveTypeReq {
	a: object;
}

interface NonPrimitiveTypeResp {
	r: string | number;
}

class MyRequest<T extends object> { }
async function sampleAPIHandler(req: MyRequest<NonPrimitiveTypeReq>): Promise<NonPrimitiveTypeResp> {
	return {} as Promise<NestedObjectResp>;
}

/**
 * @nozomi NonPrimitiveType
 * @swagger
 * /sample/nonprimitivetype:
 *   get:
 *     summary: nonprimitivetype
 *     tags: [test]
 */
const sampleAPI = sampleAPIHandler({});
