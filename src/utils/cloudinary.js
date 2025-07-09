import { v2 as cloudinary } from 'cloudinary';
import { getEnvVar } from './getEnvVar.js';
import { CLOUDINARY } from '../constants/envVars.js';
import { deleteFileFromTemp } from './saveFile.js';

export const initCloudinary = () => {
  cloudinary.config({
    cloud_name: getEnvVar(CLOUDINARY.CLOUD_NAME),
    api_key: getEnvVar(CLOUDINARY.API_KEY),
    api_secret: getEnvVar(CLOUDINARY.API_SECRET),
  });
};

export const uploadToCloudinary = async (file) => {
  try {
    const response = await cloudinary.uploader.upload(file.path);
    await deleteFileFromTemp(file.path);
    return response.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    await deleteFileFromTemp(file.path);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary delete response:', response);
    return response;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};
