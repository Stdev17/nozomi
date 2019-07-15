interface UnionTypeReq {
	ts: number | {
		date: string;
		timezone_type: number;
		timezone: string;
	};
}

interface UnionTypeResp {
	r: string | number;
}

class MyRequest<T extends object> { }
async function sampleAPIHandler(req: MyRequest<UnionTypeReq>): Promise<UnionTypeResp> {
	return {} as Promise<UnionTypeResp>;
}

/**
 * @nozomi UnionType
 * @swagger
 * /sample/uniontype:
 *   post:
 *     summary: uniontype
 *     tags: [test]
 */
const sampleAPI = sampleAPIHandler({});
