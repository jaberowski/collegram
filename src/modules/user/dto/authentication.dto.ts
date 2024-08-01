import { z } from "zod";
import { zodIdentifier } from "../model/identifier";
import { zodPassword } from "../model/password";
import { zodUsername } from "../model/username";
import { isEmail } from "../model/email";
import { isUUID } from "../../../data/UUID";
import { zodNameString } from "../model/name";
import { zodBooleanOrBooleanString } from "../../../data/booleanOrBooleanString";

export const signinDto = z.object({
  identifier: zodIdentifier,
  password: zodPassword,
});

export const signupDto = z.object({
  username: zodUsername,
  email: z.string().refine(isEmail),
  password: zodPassword,
});

export const forgotPassDto = z.object({
  identifier: zodIdentifier,
});

export const recoverPassDto = z.object({
  token: z.string().refine(isUUID),
  password: zodPassword,
});

export const changeInfo = z.object({
  email: z.string().refine(isEmail).optional(),
  firstname: zodNameString.optional(),
  lastname: zodNameString.optional(),
  bio: z.string().optional(),
  isPrivate: zodBooleanOrBooleanString.optional(),
  password: zodPassword.optional(),
});
