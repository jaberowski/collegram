import { z } from "zod";
import { Brand } from "../../../utility/brand";

export type Password = Brand<string, "Password">;

const passwordRegex = /[\w]{8,32}/;

export const isPassword = (str: string): str is Password => {
  return passwordRegex.test(str);
};

export const zodPassword = z.string().refine(isPassword);
