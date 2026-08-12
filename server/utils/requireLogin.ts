import type { H3Event } from 'h3';

export const requireLogin = async (event: H3Event) => {
  const session = await getUserSession(event);
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Please log in to access this page!' });
  }
  return session.user;
};
