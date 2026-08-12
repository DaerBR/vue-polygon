import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

const configureCloudinary = (): void => {
  if (isConfigured) return;

  const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = useRuntimeConfig();
  cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
    secure: true,
  });
  isConfigured = true;
};

export interface UploadedImage {
  publicId: string;
  secureUrl: string;
}

export const uploadRecipeImage = async (recipeId: string, dataUri: string): Promise<UploadedImage> => {
  configureCloudinary();
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `polygon-30/recipes/${recipeId}`,
    resource_type: 'image',
    overwrite: false,
    unique_filename: true,
  });
  return { publicId: result.public_id, secureUrl: result.secure_url };
};

export const uploadCategoryImage = async (categoryId: string, dataUri: string): Promise<UploadedImage> => {
  configureCloudinary();
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `polygon-30/categories/${categoryId}`,
    resource_type: 'image',
    overwrite: false,
    unique_filename: true,
  });
  return { publicId: result.public_id, secureUrl: result.secure_url };
};

export const destroyImageByPublicId = async (publicId: string): Promise<void> => {
  configureCloudinary();
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    console.error('Cloudinary destroy failed', publicId, err);
  }
};
