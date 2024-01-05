import { v4, validate } from "uuid";
import { Brand } from "../utility/brand";
import { z } from "zod";

export type UUID = Brand<string, "UUID">;

export const isUUID = (value: string): value is UUID => {
  return validate(value);
};

export const makeUUID = () => {
  return v4() as UUID;
};

export const zodUUID = z.string().refine(isUUID);
