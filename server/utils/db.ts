import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var __mongoosePromise: Promise<typeof mongoose> | undefined;
}

/** Idempotent — safe to call at the top of every handler that touches a model; reused across dev hot-reloads. */
export const connectDB = (): Promise<typeof mongoose> => {
  if (!globalThis.__mongoosePromise) {
    const { mongoUri } = useRuntimeConfig();
    globalThis.__mongoosePromise = mongoose.connect(mongoUri);
  }
  return globalThis.__mongoosePromise;
};
