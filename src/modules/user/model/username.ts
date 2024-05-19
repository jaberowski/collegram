import { z } from "zod";
import { Brand } from "../../../utility/brand";
import { UUID } from "../../../data/UUID";
import { validate } from "uuid";

const usernameRegex = /^[a-zA-Z]\w{3,64}$/;

export type Username = Brand<string, "username">;

export const isUsername = (value: string): value is Username => {
  return usernameRegex.test(value);
};

export const zodUsername = z.string().refine(isUsername);
