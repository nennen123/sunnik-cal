module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'lib/**/*.{js,jsx}',
    '!lib/**/*.test.{js,jsx}',
    '!**/node_modules/**',
  ],
  testMatch: [
    '**/__tests__/**/*.(js|jsx)',
    '**/*.(test|spec).(js|jsx)'
  ],
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current'
          }
        }]
      ]
    }]
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 10000,
  verbose: true,
  moduleNameMapper: {
    '^@supabase/supabase-js$': '<rootDir>/__mocks__/@supabase/supabase-js.js'
  }
}