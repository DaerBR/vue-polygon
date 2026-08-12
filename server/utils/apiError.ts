export const apiError = (statusCode: number, message: string, data?: Record<string, unknown>): never => {
  throw createError({ statusCode, statusMessage: message, data });
};
