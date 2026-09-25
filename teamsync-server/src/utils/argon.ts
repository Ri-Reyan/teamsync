import argon2 from "argon2";

const options = {
  type: argon2.argon2id as any,
  memoryCost: 2 ** 8,
  timeCost: 3,
};

export const convertToHash = async (password: string) => {
  return await argon2.hash(password, options);
};

export const verifyHash = async (
  hashPassword: string,
  plainPassword: string,
) => {
  return await argon2.verify(hashPassword, plainPassword);
};
