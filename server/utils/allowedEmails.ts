const DEFAULT_ALLOWED = ['13daer@gmail.com', 'i.s.gaponova@gmail.com'];

export const isEmailAllowed = (email: string | undefined): boolean => {
  if (!email) return false;

  const normalized = email.trim().toLowerCase();
  const { allowedEmails } = useRuntimeConfig();
  const list = allowedEmails?.trim()
    ? allowedEmails
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    : DEFAULT_ALLOWED;

  return list.includes(normalized);
};
