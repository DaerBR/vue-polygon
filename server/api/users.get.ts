import { usersTestTable } from '../db/schema';
import { db } from '../utils/db';

export default defineEventHandler(async (event) => {
  try {
    // Write queries that look just like SQL
    const allUsers = await db.select().from(usersTestTable);
    return allUsers;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch users from database.',
    });
  }
});
