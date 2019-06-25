interface CharacterSpec {
	love: boolean;
	exp: number;
}

interface Landsol {
	kyouka: {
		love: boolean,
		exp: number,
	};
	nozomi: CharacterSpec;
}

interface SymbolNameReq {
	landsol: Landsol;
}

interface SymbolNameResp {
}

class MyRequest<T extends object> { }
async function sampleAPIHandler(req: MyRequest<SymbolNameReq>): Promise<SymbolNameResp> {
	return {} as Promise<SymbolNameResp>;
}

/**
 * @nozomi SymbolName
 * @swagger
 * /sample/symbolname:
 *   post:
 *     summary: symbolname
 *     tags: [test]
 */
const sampleAPI = sampleAPIHandler({});
