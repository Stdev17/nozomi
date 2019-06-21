interface NullableTypeReq {
	a?: number;
	b?: string;
	c?: boolean;
	d?: Date;
}

interface NullableTypeResp {
}

class MyRequest<T extends object> { }
async function sampleAPIHandler(req: MyRequest<NullableTypeReq>): Promise<NullableTypeResp> {
	return {};
}

/**
 * @nozomi SampleAPI
 * @swagger
 * /sample/api:
 *   get:
 *     summary: sampleapi
 *     tags: [test]
 */
var sampleAPI = sampleAPIHandler({});
