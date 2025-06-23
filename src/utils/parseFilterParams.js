const parseType = (type) => {
  const isString = typeof type === 'string';
  if (!isString) return undefined;
  const isAllowedType = ['work', 'home', 'personal'].includes(type);
  if (isAllowedType) return type;
  return undefined;
};

const parseIsFavourite = (isFavourite) => {
  if (typeof isFavourite !== 'string') return undefined;
  const lowered = isFavourite.toLowerCase();
  if (lowered === 'true') return true;
  if (lowered === 'false') return false;
  return undefined;
};

export const parseFilterParams = (query) => {
  const { type, isFavourite } = query;

  const parsedType = parseType(type);
  const parsedIsFavourite = parseIsFavourite(isFavourite);

  return {
    type: parsedType,
    isFavourite: parsedIsFavourite,
  };
};
