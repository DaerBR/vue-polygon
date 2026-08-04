import { eq } from 'drizzle-orm';
import { usersTestTable } from '../../db/schema';
import { db } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));

  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'id must be a valid integer' });
  }

  const [deletedUser] = await db.delete(usersTestTable).where(eq(usersTestTable.id, id)).returning();

  if (!deletedUser) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' });
  }

  return deletedUser;
});
