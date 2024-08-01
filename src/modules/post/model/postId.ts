import { validate } from "uuid";
import { UUID } from "../../../data/UUID";
import { Brand } from "../../../utility/brand";
import { z } from "zod";

export type PostId = Brand<UUID, "PostId">;

export const isPostId = (value: string): value is PostId => {
  return validate(value);
};

export const zodPostId = z.string().refine(isPostId);
