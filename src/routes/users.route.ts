import { Hono } from 'hono';

const users = new Hono();

users.get('/', (c) => {
  const { q } = c.req.query();
  return c.json({ q: q, route: 'users' });
});
users.get('/:id', (c) => c.json(`User ${c.req.param('id')}`));

export default users;
