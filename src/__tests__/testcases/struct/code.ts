interface Inner {
	a: number;
	b: boolean;
	c: string;
}

/**
 * @nozomi_struct NozomiStruct
 */
interface NozomiStruct {
	val: string;
	inner: Inner;
}
