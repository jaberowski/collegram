import { z } from "zod";
import { Brand } from "../../../utility/brand";

export type NameString = Brand<string, "name">;

const nameRegex = /^[پچجحخهعغفقثصضشسیبلاتنمکگوئدذرزطظژؤإأءًٌٍَُِّ\sa-zA-z]+$/;

const isNameString = (value: string): value is NameString => {
  return nameRegex.test(value);
};

const zodNameString = z.string().refine(isNameString);
