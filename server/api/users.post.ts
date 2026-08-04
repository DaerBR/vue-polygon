import { usersTestTable } from '../db/schema';
import { db } from '../utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ name?: string; email?: string }>(event);

  if (!body?.name || !body?.email) {
    throw createError({ statusCode: 400, statusMessage: 'name and email are required' });
  }

  try {
    const [createdUser] = await db.insert(usersTestTable).values({ name: body.name, email: body.email }).returning();
    return createdUser;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create user.',
    });
  }
});
