/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",

  // Unit tests only. Integration tests run with jest.integration.config.js
  testEnvironment: "node",

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  testMatch: ["**/__tests__/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "__tests__/integration/"],

  setupFiles: ["<rootDir>/jest.integration.setup.ts"],

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
