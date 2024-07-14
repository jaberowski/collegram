import { UrlWithStringQuery } from "url";
import { UserId } from "../../user/model/user-id";
import { PostDescription } from "./postDescription";
import { PostId } from "./postId";
import { PostTitle } from "./postTitle";
import { Tag, TagString } from "./tag";

export interface AddPostData {
  userId: UserId;
  title: PostTitle;
  description: PostDescription;
  tags: TagString[];
  isCloseFriendsOnly: boolean;
  fileNames: string[];
}

export interface Post {
  id: PostId;
  title: PostTitle;
  description: PostDescription;
  tags: Tag[];
  userId: UserId;
  createdAt: number;
  updatedAt: number;
  fileUrls: string[];
  haveLiked: boolean;
  likesCount: number;
  haveBookmarked: boolean;
  bookmarksCount: number;
}

export type PostAccessLevel = "NONE" | "ALL_POSTS";
// TODO: "PUBLIC_POSTS" should be added after implementing close friends feature
