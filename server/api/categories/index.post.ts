import { connectDB } from '../../utils/db';
import { Category } from '../../models/Category';
import { apiError } from '../../utils/apiError';
import { isDuplicateKeyError, parseCategoryImageUpload } from '../../utils/requestValidation';
import { uploadCategoryImage } from '../../utils/cloudinary';
import { requireLogin } from '../../utils/requireLogin';

export default defineEventHandler(async (event) => {
  await requireLogin(event);
  await connectDB();

  const body = await readBody<Record<string, unknown>>(event);
  const name = body.name;
  if (typeof name !== 'string' || !name.trim()) {
    return apiError(400, 'name is required');
  }

  let doc;
  try {
    doc = await Category.create({ name: name.trim() });
  } catch (err: unknown) {
    if (isDuplicateKeyError(err)) {
      return apiError(409, 'A category with this name already exists');
    }
    throw err;
  }

  const rawImage = body.categoryImage;
  if (rawImage !== undefined && rawImage !== null) {
    const imageParsed = parseCategoryImageUpload(rawImage);
    if (!imageParsed.ok) {
      await Category.findByIdAndDelete(doc._id);
      return apiError(400, imageParsed.error);
    }
    try {
      const uploaded = await uploadCategoryImage(String(doc._id), imageParsed.data.dataUri);
      doc.categoryImage = { publicId: uploaded.publicId, secureUrl: uploaded.secureUrl };
      await doc.save();
    } catch (err) {
      console.error(err);
      await Category.findByIdAndDelete(doc._id);
      return apiError(502, 'Image upload failed');
    }
  }

  setResponseStatus(event, 201);
  return doc;
});
