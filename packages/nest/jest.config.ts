import type { Config } from "jest";

const config: Config = {
	moduleFileExtensions: ["js", "json", "ts"],
	rootDir: ".",
	testRegex: ".*\\.test\\.ts$",
	transform: {
		"^.+\\.(t|j)s$": "ts-jest",
	},
	collectCoverageFrom: ["**/*.(t|j)s"],
	coverageDirectory: "../coverage",
	testEnvironment: "node",
	moduleNameMapper: {
		"^@common/(.*)$": "<rootDir>/src/common/$1",
		"^@services/(.*)$": "<rootDir>/src/services/$1",
		"^@modules/(.*)$": "<rootDir>/src/modules/$1",
		"^@testing/(.*)$": "<rootDir>/testing/$1",
	},
	// Set for safety to ensure tests don't run in parallel (in case --runInBand doesn't work, IDE integration uses custom flags etc)
	maxConcurrency: 1,
};

export default config;
