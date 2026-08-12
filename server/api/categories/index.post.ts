import { eq } from 'drizzle-orm';
import { db } from '../../utils/db';
import { categories } from '../../db/schema';
import { toCategoryModel } from '../../utils/serializers';
import { apiError } from '../../utils/apiError';
import { parseCategoryImageUpload } from '../../utils/requestValidation';
import { uploadCategoryImage } from '../../utils/cloudinary';
import { requireLogin } from '../../utils/requireLogin';

export default defineEventHandler(async (event) => {
  await requireLogin(event);

  const body = await readBody<Record<string, unknown>>(event);
  const name = body.name;
  if (typeof name !== 'string' || !name.trim()) {
    return apiError(400, 'name is required');
  }

  const duplicate = await db.query.categories.findFirst({ where: eq(categories.name, name.trim()) });
  if (duplicate) {
    return apiError(409, 'A category with this name already exists');
  }

  const [created] = await db.insert(categories).values({ name: name.trim() }).returning();
  if (!created) return apiError(500, 'Failed to create category');

  const rawImage = body.categoryImage;
  if (rawImage !== undefined && rawImage !== null) {
    const imageParsed = parseCategoryImageUpload(rawImage);
    if (!imageParsed.ok) {
      await db.delete(categories).where(eq(categories.id, created.id));
      return apiError(400, imageParsed.error);
    }
    try {
      const uploaded = await uploadCategoryImage(created.id, imageParsed.data.dataUri);
      const [withImage] = await db
        .update(categories)
        .set({ categoryImagePublicId: uploaded.publicId, categoryImageSecureUrl: uploaded.secureUrl })
        .where(eq(categories.id, created.id))
        .returning();
      setResponseStatus(event, 201);
      return toCategoryModel(withImage!);
    } catch (err) {
      console.error(err);
      await db.delete(categories).where(eq(categories.id, created.id));
      return apiError(502, 'Image upload failed');
    }
  }

  setResponseStatus(event, 201);
  return toCategoryModel(created);
});
