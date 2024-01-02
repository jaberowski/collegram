import { z } from "zod";
import { Brand } from "../../../utility/brand";
import { UUID } from "../../../data/UUID";
import { validate } from "uuid";

export type UserId = Brand<UUID, "UserId">;

export const isUserId = (value: string): value is UserId => {
  return validate(value);
};

export const zodProgramId = z.string().refine(isUserId);
