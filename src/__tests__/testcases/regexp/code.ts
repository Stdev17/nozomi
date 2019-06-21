interface SampleReq {
	regexp: RegExp;
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
const sampleAPI = sampleAPIHandler({});
