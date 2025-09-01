import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db/db.js';
import { user, account, session, verification } from './db/schema.js';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: user,
      account: account,
      session: session,
      verification: verification,
    },
  }),
  telemetry: { enabled: false },
  emailAndPassword: {
    enabled: true,
  },
});
