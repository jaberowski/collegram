import { z } from "zod";
import { Brand } from "../../../utility/brand";
import bcrypt from "bcrypt";

export type Password = Brand<string, "Password">;

const passwordRegex = /[\w]{8,32}/;

export const isPassword = (str: string): str is Password => {
  return passwordRegex.test(str);
};

export const zodPassword = z.string().refine(isPassword);

export type HashedPassword = Brand<string, "HashedPassword">;

export const isHashedPassword = (value: string): value is HashedPassword => {
  return /^\$2[ayb]\$.{56}$/.test(value);
};

const zodHashedPassword = z.string().refine(isHashedPassword);

export const generateHashedPassword = async (
  password: Password,
  rounds: number = 10
): Promise<HashedPassword> =>
  bcrypt.hash(password, rounds) as Promise<HashedPassword>;
