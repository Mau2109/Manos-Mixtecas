/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",

  // Integración = Node real
  testEnvironment: "node",

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  testMatch: ["**/__tests__/**/*.test.ts"],

  setupFiles: ["<rootDir>/jest.integration.setup.ts"],

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
