import { validate } from "uuid";
import { Brand } from "../utility/brand";
import { z } from "zod";

export type UUID = Brand<string, "UUID">;

export const isUUID = (value: string): value is UUID => {
  return validate(value);
};

export const zodUUID = z.string().refine(isUUID);
