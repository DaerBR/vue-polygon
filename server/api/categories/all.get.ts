import { connectDB } from '../../utils/db';
import { Category } from '../../models/Category';
import { renameMongoIdsForClient } from '../../utils/renameMongoIdsForClient';

export default defineEventHandler(async () => {
  await connectDB();
  const data = await Category.find().sort({ name: 1 }).lean();
  return renameMongoIdsForClient(data);
});
