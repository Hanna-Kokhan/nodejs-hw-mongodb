import pkg from 'lodash';
const { isBoolean } = pkg;

const parseType = (type) => {
  const isString = typeof type === 'string';
  if (!isString) return;

  const isContactType = ['work', 'home', 'personal'].includes(type);
  if (isContactType) return type;
};

const parseIsFavourite = (isFavourite) => {
  if (isBoolean(isFavourite)) return isFavourite;
  if (isFavourite === 'true') return true;
  if (isFavourite === 'false') return false;
};

export const parseFilterParams = (query) => {
  const { type, isFavourite } = query;

  const parsedType = parseType(type);
  const parsedIsFavourite = parseIsFavourite(isFavourite);

  return {
    contactType: parsedType,
    isFavourite: parsedIsFavourite,
  };
};
