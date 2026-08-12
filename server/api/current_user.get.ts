export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store');
  const session = await getUserSession(event);
  // A bare `null` return makes h3 send 204 No Content (empty body), but the frontend's
  // $fetch expects a literal JSON `null` body to distinguish "not logged in" from "unset".
  return send(event, JSON.stringify(session.user ?? null), 'application/json');
});
