import fs from 'node:fs/promises';
import path from 'node:path';
import { UPLOAD_DIR, TEMP_UPLOAD_DIR } from '../constants/paths.js';

export const saveFileToUploads = async (file) => {
  const oldPath = file.path;
  const newPath = path.join(UPLOAD_DIR, file.filename);

  try {
    await fs.rename(oldPath, newPath);
    return `/uploads/${file.filename}`;
  } catch (error) {
    console.error('Error saving file to uploads:', error);
    await fs.unlink(oldPath);
    throw error;
  }
};

export const deleteFileFromTemp = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file from temp:', error);
  }
};
