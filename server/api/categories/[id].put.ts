import { eq } from 'drizzle-orm';
import { db } from '../../utils/db';
import { categories } from '../../db/schema';
import { toCategoryModel } from '../../utils/serializers';
import { apiError } from '../../utils/apiError';
import { parseCategoryImageUpload } from '../../utils/requestValidation';
import { destroyImageByPublicId, uploadCategoryImage } from '../../utils/cloudinary';
import { requireLogin } from '../../utils/requireLogin';

export default defineEventHandler(async (event) => {
  await requireLogin(event);

  const id = getRouterParam(event, 'id');
  if (!id) return apiError(400, 'Invalid category id');

  const existing = await db.query.categories.findFirst({ where: eq(categories.id, id) });
  if (!existing) return apiError(404, 'Category not found');

  const body = await readBody<Record<string, unknown>>(event);
  const updates: Partial<typeof categories.$inferInsert> = {};
  let previousImagePublicId: string | undefined;
  let orphanNewImagePublicId: string | undefined;

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return apiError(400, 'name must be a non-empty string');
    }
    const trimmed = body.name.trim();
    const duplicate = await db.query.categories.findFirst({ where: eq(categories.name, trimmed) });
    if (duplicate && duplicate.id !== id) {
      return apiError(409, 'A category with this name already exists');
    }
    updates.name = trimmed;
  }

  if (body.categoryImage !== undefined && body.categoryImage !== null) {
    if (body.categoryImage === false) {
      if (existing.categoryImagePublicId) previousImagePublicId = existing.categoryImagePublicId;
      updates.categoryImagePublicId = null;
      updates.categoryImageSecureUrl = null;
    } else {
      previousImagePublicId = existing.categoryImagePublicId ?? undefined;
      const imageParsed = parseCategoryImageUpload(body.categoryImage);
      if (!imageParsed.ok) return apiError(400, imageParsed.error);
      try {
        const uploaded = await uploadCategoryImage(id, imageParsed.data.dataUri);
        orphanNewImagePublicId = uploaded.publicId;
        updates.categoryImagePublicId = uploaded.publicId;
        updates.categoryImageSecureUrl = uploaded.secureUrl;
      } catch (err) {
        console.error(err);
        return apiError(502, 'Image upload failed');
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    return apiError(400, 'No valid fields to update');
  }

  const [updated] = await db.update(categories).set(updates).where(eq(categories.id, id)).returning();
  if (!updated) {
    if (orphanNewImagePublicId) void destroyImageByPublicId(orphanNewImagePublicId);
    return apiError(404, 'Category not found');
  }
  if (previousImagePublicId) void destroyImageByPublicId(previousImagePublicId);

  return toCategoryModel(updated);
});
