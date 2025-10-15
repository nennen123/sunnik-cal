// Jest setup file for additional configuration

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

global.console = {
  ...console,
  // Uncomment to ignore specific console outputs during testing
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}