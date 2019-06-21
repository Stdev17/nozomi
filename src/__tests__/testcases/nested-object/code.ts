interface NestedObjectReq {
	a: number;
	b: string[];
	c: {
		d: any;
		e: boolean;
		f: {
			g: number;
			h: string;
		}
	}
}

interface NestedObjectResp {
	r: Array<string[]>;
}

class MyRequest<T extends object> { }
async function sampleAPIHandler(req: MyRequest<NestedObjectReq>): Promise<NestedObjectResp> {
	return {} as Promise<NestedObjectResp>;
}

/**
 * @nozomi NestedObject
 * @swagger
 * /sample/nestedobj:
 *   post:
 *     summary: nestedobj
 *     tags: [test]
 */
const sampleAPI = sampleAPIHandler({});
