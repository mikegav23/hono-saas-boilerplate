import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { auth } from './auth.js';
import users from './routes/users.route.js';

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// --------------------------------------------------
// Global Middleware
// --------------------------------------------------

// Request logger (logs method, path, status, etc.)
app.use(logger());

// Normalize URLs by trimming trailing slashes
app.use(trimTrailingSlash());

// --------------------------------------------------
// Session & User Context Middleware
// --------------------------------------------------
// Attach the current session and user to the context (`c.set`)
// so they can be accessed in any route for validation/auth checks.
app.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set('user', null);
    c.set('session', null);
    return next();
  }

  c.set('user', session.user);
  c.set('session', session.session);
  return next();
});

// --------------------------------------------------
// CORS Configuration
// --------------------------------------------------
// Applies to `/api/auth/*` routes. Change the path to `*` if you
// want to enable CORS globally.
app.use(
  '/api/auth/*',
  cors({
    origin: 'http://localhost:5173', // TODO: replace with actual frontend url
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
);

// --------------------------------------------------
// Middleware TODO: ip based rate limiting
// --------------------------------------------------

// --------------------------------------------------
// Routes
// --------------------------------------------------

// Auth route
app.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw));

// Routes registered from /routes files
app.route('/users', users);

// Example route for auth context testing
app.get('/me', (c) => {
  const session = c.get('session');
  const user = c.get('user');

  if (!user) return c.body(null, 401);

  return c.json({
    session,
    user,
  });
});

// Example route for testing
app.get('/', (c) => {
  return c.text('Hello Hono!');
});

serve(
  {
    fetch: app.fetch,
    port: 8787,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
