import { ContactCollection } from '../db/models/contacts.js';
import { calcPaginationData } from '../utils/calcPaginationData.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { ENV_VARS } from '../constants/envVars.js';
import { saveFileToUploads, deleteFileFromTemp } from '../utils/saveFile.js';
import {
  initCloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinary.js';
import { CLOUDINARY } from '../constants/envVars.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import { UPLOAD_DIR } from '../constants/paths.js';

initCloudinary();

export const getAllContacts = async ({
  page,
  perPage,
  sortBy,
  sortOrder,
  filter,
  userId,
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactsQuery = ContactCollection.find({ userId });

  if (filter.contactType) {
    contactsQuery.where('contactType').equals(filter.contactType);
  }

  if (filter.isFavorite) {
    contactsQuery.where('isFavorite').equals(filter.isFavorite);
  }

  const contactsCount = await ContactCollection.countDocuments({ userId });

  const contacts = await contactsQuery
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .exec();

  const paginationData = calcPaginationData(contactsCount, perPage, page);

  return {
    data: contacts,
    ...paginationData,
  };
};

export const getContactById = async (contactId, userId) => {
  const contact = await ContactCollection.findOne({
    _id: contactId,
    userId,
  });

  return contact;
};

export const createContact = async (payload) => {
  const { photo, ...restPayload } = payload;
  let photoUrl;

  if (photo) {
    if (getEnvVar(ENV_VARS.ENABLE_CLOUDINARY) === 'true') {
      photoUrl = await uploadToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploads(photo);
    }
  }

  const contact = await ContactCollection.create({
    ...restPayload,
    photo: photoUrl,
  });

  return contact;
};

export const updateContact = async (contactId, payload, userId) => {
  const { photo, ...restPayload } = payload;

  const currentContact = await ContactCollection.findOne({
    _id: contactId,
    userId,
  });

  if (!currentContact) return null;

  let photoUrl = currentContact.photo;

  if (photo) {
    if (currentContact.photo) {
      if (getEnvVar(ENV_VARS.ENABLE_CLOUDINARY) === 'true') {
        const publicId = path.basename(
          currentContact.photo,
          path.extname(currentContact.photo),
        );
        await deleteFromCloudinary(publicId);
      } else {
        const oldFilePath = path.join(
          UPLOAD_DIR,
          path.basename(currentContact.photo),
        );
        try {
          await fs.unlink(oldFilePath);
        } catch (error) {
          console.error('Error deleting old local file:', error);
        }
      }
    }

    if (getEnvVar(ENV_VARS.ENABLE_CLOUDINARY) === 'true') {
      photoUrl = await uploadToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploads(photo);
    }
  }

  const contact = await ContactCollection.findOneAndUpdate(
    { _id: contactId },
    { ...restPayload, photo: photoUrl },
    {
      new: true,
    },
  );

  return contact;
};

export const deleteContact = async (contactId, userId) => {
  const contactToDelete = await ContactCollection.findOne({
    _id: contactId,
    userId,
  });

  if (!contactToDelete) return null;

  // Видаляємо фото з Cloudinary або локального сховища, якщо воно існує
  if (contactToDelete.photo) {
    if (getEnvVar(ENV_VARS.ENABLE_CLOUDINARY) === 'true') {
      const publicId = path.basename(
        contactToDelete.photo,
        path.extname(contactToDelete.photo),
      );
      await deleteFromCloudinary(publicId);
    } else {
      const filePath = path.join(
        UPLOAD_DIR,
        path.basename(contactToDelete.photo),
      );
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting local file:', error);
      }
    }
  }

  const contact = await ContactCollection.findOneAndDelete({
    _id: contactId,
    userId,
  });

  return contact;
};
