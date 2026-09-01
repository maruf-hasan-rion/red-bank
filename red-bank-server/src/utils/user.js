export const toPublicUser = (user) => {
  const source = user?.toObject ? user.toObject() : { ...user };

  delete source.refreshTokenHash;
  delete source.refreshToken;
  delete source.__v;

  return source;
};
