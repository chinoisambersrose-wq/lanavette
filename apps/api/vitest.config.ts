import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    hookTimeout: 60000,
    testTimeout: 30000,
    env: {
      NODE_ENV: 'test',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/plateforme-test',
      JWT_ACCESS_SECRET: 'test-access-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      STRIPE_SECRET_KEY: 'sk_test_fake_key_for_local_signature_checks_only',
      STRIPE_WEBHOOK_SECRET: 'whsec_test_fake_secret_for_local_signature_checks_only',
    },
  },
});
