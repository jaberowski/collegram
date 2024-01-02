import { z } from "zod";
import { zodIdentifier } from "../model/identifier";
import { zodPassword } from "../model/password";
import { zodUsername } from "../model/username";
import { isEmail } from "../model/email";

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
  token: z.string(),
  password: zodPassword,
});
