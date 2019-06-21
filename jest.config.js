module.exports = {
	preset: 'ts-jest',
	testEnvironment: "node",
	globals: {
		"ts-jest": {
			"isolatedModules": false,
		},
		"__commit": {
			"id": "invalid",
			"timestamp": "blank"
		},
		"__env": "test"
	},
	rootDir: ".",
	moduleNameMapper: {
		"@src/(.*)": "<rootDir>/src/$1",
		"@transform/(.*)": "<rootDir>/src/transform/$1"
	},
	testPathIgnorePatterns: [
		"/node_modules/",
		"/dist/",
		"/__tests__/testcases/",
	],
};
