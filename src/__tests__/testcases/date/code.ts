interface SampleReq {
	date: Date;
}

interface SampleResp {
}

class MyRequest<T extends object> { }
async function sampleAPIHandler(req: MyRequest<SampleReq>): Promise<SampleResp> {
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
