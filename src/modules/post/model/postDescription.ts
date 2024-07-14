import { z } from "zod";
import { Brand } from "../../../utility/brand";

export type PostDescription = Brand<string, "postDescription">;

const isPostDescription = (value: string): value is PostDescription => {
  return value.length > 3 && value.length < 16;
};

export const zodPostDescription = z.string().refine(isPostDescription);
