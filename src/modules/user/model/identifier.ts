import { z } from "zod";
import { Email, isEmail } from "./email";
import { Username, isUsername } from "./username";

export type Identifier = Username | Email;

export const isIdentifier = (value: string): value is Identifier => {
  return isUsername(value) || isEmail(value);
};

export const zodIdentifier = z.string().refine(isIdentifier);
