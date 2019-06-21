interface AAA {
	a: number;
}

/**
 * @nozomi_handler NoticeMessage
 * @nozomi_channel notice
 */
interface NoticeMessage {
	notice: string;
	important: number;
	sticky: boolean;
	aaa: AAA;
}

/**
 * @nozomi_handler PublicChatMessage
 * @nozomi_channel chat
 */
interface PublicChatMessage {
		author: string;
		message: string;
}

/**
 * @nozomi_handler WhisperMessage
 * @nozomi_channel chat
 */
interface WhisperMessage {
		sender: string;
		receiver: string;
		message: string;
}
/**
 * @nozomi_struct OnlyStruct
 */
interface OnlyStruct {
	s: string;
	n: number;
	b: boolean;
}
