enum EnumType {
	A,
	B,
	C,
	D,
}

enum EnumTypeWithInitializer {
	A = 1,
	B = 'string',
}

interface EnumTypeReq {
	enumObj: EnumType;
	enumObjInit: EnumTypeWithInitializer;
}

interface EnumTypeResp {
}

class MyRequest<T extends object> { }
async function sampleAPIHandler(req: MyRequest<EnumTypeReq>): Promise<EnumTypeResp> {
	return {};
}

/**
 * @nozomi EnumType
 * @swagger
 * /sample/api:
 *   get:
 *     summary: enumtype
 *     tags: [test]
 */
var sampleAPI = sampleAPIHandler({});