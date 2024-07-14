import { z } from "zod";
import { Brand } from "../../../utility/brand";
import { UUID } from "../../../data/UUID";
import { Post } from "./post";
import { validate } from "uuid";

export type TagString = Brand<string, "tag">;

const isTagString = (value: string): value is TagString => {
  return value.length > 3 && value.length < 16;
};

export const zodTagString = z.string().refine(isTagString);

export type TagId = Brand<UUID, "TagId">;

export const isTagId = (value: string): value is TagId => {
  return validate(value);
};

export const zodTagId = z.string().refine(isTagId);

export interface Tag {
  id: TagId;
  value: TagString;
}
