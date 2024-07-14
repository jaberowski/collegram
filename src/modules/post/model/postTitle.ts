import { z } from "zod";
import { Brand } from "../../../utility/brand";

export type PostTitle = Brand<string, "postTitle">;

const isPostTitle = (value: string): value is PostTitle => {
  return value.length > 3 && value.length < 16;
};

export const zodPostTitle = z.string().refine(isPostTitle);
