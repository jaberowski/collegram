import { ZodArray, ZodString, z } from "zod";
import { zodPostTitle } from "../model/postTitle";
import { zodPostDescription } from "../model/postDescription";
import { zodTagString } from "../model/tag";
import { zodPostId } from "../model/postId";
import { zodBooleanOrBooleanString } from "../../../data/booleanOrBooleanString";

export const addPostDto = z
  .object({
    title: zodPostTitle,
    description: zodPostDescription,
    isCloseFriendsOnly: zodBooleanOrBooleanString,
    tags: z.array(zodTagString).min(1).max(10),
    files: z.array(z.object({ filename: z.string().min(1) })),
  })
  .transform((obj) => {
    const { files, ...fileFilteredObj } = obj;
    return {
      ...fileFilteredObj,
      fileNames: files.map((file) => file.filename),
    };
  });

export type AddPostInput = z.infer<typeof addPostDto>;

export const editPostDto = z.object({
  id: zodPostId,
  title: zodPostTitle.optional(),
  description: zodPostDescription.optional(),
  isCloseFriendsOnly: z.boolean().optional(),
  tags: z.array(zodTagString).min(1).max(10).optional(),
});

export type EditPostInput = z.infer<typeof editPostDto>;
