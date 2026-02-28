/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/integration/**/*.test.ts"],
  setupFiles: ["<rootDir>/jest.integration.setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
