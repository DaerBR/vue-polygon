import type { H3Event } from 'h3';

// `nuxt typecheck`'s combined multi-project check doesn't reliably pick up the
// `#auth-utils` User augmentation (server/types/auth.d.ts) across project boundaries,
// so we re-assert the known shape here rather than relying on that merge downstream.
export interface AuthenticatedUser {
  id: string;
  displayName: string;
  email: string;
}

export const requireLogin = async (event: H3Event): Promise<AuthenticatedUser> => {
  const session = await getUserSession(event);
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Please log in to access this page!' });
  }
  return session.user as AuthenticatedUser;
};
