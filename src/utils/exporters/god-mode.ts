import jwt from 'jsonwebtoken';

/**
 * GOD MODE AUTHENTICATION
 * -----------------------
 * Generates valid Strapi JWTs for persistent test users ("God Users").
 * Used by E2E tests to bypass Google Auth and guarantee specific User IDs.
 *
 * USAGE (in test):
 * const token = generateGodToken({ id: 1, email: 'alice@daicer.test' });
 * page.evaluate(t => localStorage.setItem('strapi_jwt', t), token);
 */

/**
 * Pre-defined mock users for testing purposes.
 * These IDs must match the seeded database state in test environments.
 */
export const MOCK_USERS = {
  ALICE: { id: 2, username: 'Alice', email: 'alice@daicer.test', blocked: false, confirmed: true },
  BOB: { id: 3, username: 'Bob', email: 'bob@daicer.test', blocked: false, confirmed: true },
  DM: { id: 1, username: 'DM', email: 'dm@daicer.test', blocked: false, confirmed: true },
};

// Default jwtSecret from standard Strapi generated .env
// In CI/Test environment, this MUST match the backend's JWT_SECRET
const TEST_JWT_SECRET = process.env.JWT_SECRET || 'changeme';

/**
 * Generates a valid Strapi JWT for a mock user.
 * Allows bypassing OAuth flows during E2E testing.
 * 
 * @param userPayload - validation payload (defaults to Alice).
 * @returns Signed JWT string.
 */
export const generateGodToken = (userPayload: { id: number; email?: string } = MOCK_USERS.ALICE) => {
  return jwt.sign(
    {
      id: userPayload.id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 Days
    },
    TEST_JWT_SECRET
  );
};
