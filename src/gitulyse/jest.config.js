const nextJest = require("next/jest");
/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
    dir: "./",
});

const config = {
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    moduleDirectories: ["node_modules", "<rootDir>/"],
    moduleNameMapper: {
        "^@/(.*)/$": "<rootDir>/src/$1",
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    testEnvironment: "jsdom",
    transformIgnorePatterns: ["/node_modules/(?!(d3)/)"],
};

module.exports = createJestConfig(config);
