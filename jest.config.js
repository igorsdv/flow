module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsConfig: 'src/tsconfig.json',
    },
  },
};
