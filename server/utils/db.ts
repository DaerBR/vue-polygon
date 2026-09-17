import mongoose from 'mongoose';

declare global {
  // TypeScript's global augmentation requires `var`, not `let`/`const`.
  // eslint-disable-next-line vars-on-top
  var globalMongoosePromise: Promise<typeof mongoose> | undefined;
}

/** Idempotent — safe to call at the top of every handler that touches a model; reused across dev hot-reloads. */
export const connectDB = (): Promise<typeof mongoose> => {
  if (!globalThis.globalMongoosePromise) {
    const { mongoUri } = useRuntimeConfig();
    globalThis.globalMongoosePromise = mongoose.connect(mongoUri);
  }

  return globalThis.globalMongoosePromise;
};
