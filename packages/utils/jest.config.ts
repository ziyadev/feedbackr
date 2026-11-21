export default {
  displayName: 'utils',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { tsconfig: { module: 'commonjs', esModuleInterop: true, types: ['node', 'jest'] } },
    ],
  },
  moduleFileExtensions: ['ts', 'js'],
};
