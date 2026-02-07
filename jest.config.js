/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",

  testMatch: [
    "**/__tests__/**/*.test.ts"
  ],

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
