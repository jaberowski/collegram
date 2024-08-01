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

export interface PostDomain {
  id: PostId;
  title: PostTitle;
  description: PostDescription;
  tags: Tag[];
  userId: UserId;
  createdAt: number;
  isCloseFriendsOnly: boolean;
  updatedAt: number;
  fileNames: string[];
  likesCount: number;
  bookmarksCount: number;
}

export interface PostDetail extends Omit<PostDomain, "fileNames"> {
  fileUrls: string[];
  haveLiked: boolean;
  haveBookmarked: boolean;
}

export interface PostCardBasic {
  id: PostDetail["id"];
  userId: PostDetail["userId"];
  fileUrls: PostDetail["fileUrls"];
  tags: Tag[];
}

export interface PostCardWithInteractions extends PostCardBasic {
  haveLiked: PostDetail["haveLiked"];
  likesCount: PostDetail["likesCount"];
  haveBookmarked: PostDetail["haveBookmarked"];
  bookmarksCount: PostDetail["bookmarksCount"];
}

export type PostAccessLevel = "NONE" | "ALL_POSTS";
// TODO: "PUBLIC_POSTS" should be added after implementing close friends feature
