const swcOptions = {
  jsc: {
    parser: {
      syntax: 'typescript',
      tsx: false,
      decorators: true,
      dynamicImport: true,
    },
  },
  module: {
    type: 'cjs',
  },
};

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/types/**/*.ts',
  ],
  transform: {
    '^.+\\.(t|j)s?$': ['@swc/jest', swcOptions],
  },
  transformIgnorePatterns: [],
};
