import { ContactsCollection } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { ENV_VARS } from '../constants/envVars.js';
import { saveFileToUploads } from '../utils/saveFile.js';
import {
  initCloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinary.js';
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

  const contactsQuery = ContactsCollection.find({ userId });

  if (filter.contactType) {
    contactsQuery.where('contactType').equals(filter.contactType);
  }

  if (filter.isFavourite !== undefined) {
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }

  const contactsCount = await ContactsCollection.find({ userId })
    .merge(contactsQuery.clone())
    .countDocuments();

  const contacts = await contactsQuery
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .exec();

  const paginationData = calculatePaginationData(contactsCount, page, perPage);

  return {
    data: contacts,
    ...paginationData,
  };
};

export const getContactById = async (contactId, userId) => {
  const contact = await ContactsCollection.findOne({
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

  const contact = await ContactsCollection.create({
    ...restPayload,
    photo: photoUrl,
  });

  return contact;
};

export const updateContact = async (
  contactId,
  payload,
  userId,
  options = {},
) => {
  const { photo, ...restPayload } = payload;

  const currentContact = await ContactsCollection.findOne({
    _id: contactId,
    userId,
  });

  if (!currentContact) return null;

  let photoUrl = currentContact.photo;

  if (photo) {
    if (currentContact.photo) {
      if (getEnvVar(ENV_VARS.ENABLE_CLOUDINARY) === 'true') {
        const publicId = currentContact.photo.split('/').pop().split('.')[0];
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

  const contact = await ContactsCollection.findOneAndUpdate(
    { _id: contactId },
    { ...restPayload, photo: photoUrl },
    {
      new: true,
      ...options,
    },
  );

  return contact;
};

export const deleteContact = async (contactId, userId) => {
  const contactToDelete = await ContactsCollection.findOne({
    _id: contactId,
    userId,
  });

  if (!contactToDelete) return null;

  if (contactToDelete.photo) {
    if (getEnvVar(ENV_VARS.ENABLE_CLOUDINARY) === 'true') {
      const publicId = contactToDelete.photo.split('/').pop().split('.')[0];
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

  const contact = await ContactsCollection.findOneAndDelete({
    _id: contactId,
    userId,
  });

  return contact;
};
