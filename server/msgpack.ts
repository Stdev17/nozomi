// https://github.com/MobiltronInc/msgpack-response
// 내부에서 관리하고 싶어서 코드 때려박음

/*!
 * msgpack-response
 * Copyright(c) 2017-present Mobiltron Inc
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import _ from 'lodash';
import msgpack from 'msgpack-lite';
import express from 'express';


/**
 * Transform response data using msgpack.
 *
 * @return {Function} middleware
 * @public
 */
export function mgsPackResponse(options: {
	auto_detect?: boolean,
}) {
	let autoDetect = false;

	if (!_.isUndefined(options)) {
		autoDetect = options.auto_detect || false;
	}

	return function _mgsPackResponse(req: express.Request, res: express.Response & { msgPack?: (body?: object) => express.Response }, next: express.NextFunction) {
		if (shouldMsgPack(req) && autoDetect) {
			res.json = (jsObject?: object) => {
				const obj = jsObject;
				const encodedResponse = msgpack.encode(obj);
				res.setHeader('Content-Type', 'application/x-msgpack');
				res.removeHeader('Content-Length');
				res.setHeader('Content-Length', _.size(encodedResponse));
				res.send(encodedResponse);
				return res;
			};
		}

		res.msgPack = (jsObject?: object) => {
			const obj = jsObject;
			const encodedResponse = msgpack.encode(obj);
			res.setHeader('Content-Type', 'application/x-msgpack');
			res.setHeader('Content-Length', _.size(encodedResponse));
			res.send(encodedResponse);
			return res;
		};

		next();
	};
}

/**
 * Default filter function.
 * @private
 */
function shouldMsgPack(req: express.Request) {
	const acceptType = req.get('accept');
	return !_.isNil(acceptType) && acceptType === 'application/x-msgpack';
}
