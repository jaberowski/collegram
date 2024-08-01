import { z } from "zod";

const transformValidStringToBoolean = (
  value: boolean | "false" | "true"
): boolean => {
  return typeof value === "boolean" ? value : value === "true" ? true : false;
};

export const zodBooleanOrBooleanString = z
  .union([z.boolean(), z.literal("false"), z.literal("true")])
  .transform((value) => transformValidStringToBoolean(value));
