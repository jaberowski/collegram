import { DataSource, EntityManager, Repository, Transaction } from "typeorm";
import { PostEntity } from "./entity/post.entity";
import { AddPostData, PostDomain } from "./model/post";
import { PostId } from "./model/postId";
import { UserId } from "../user/model/user-id";
import { v4 } from "uuid";
import { TagString } from "./model/tag";
import { TagEntity } from "./entity/tag.entity";
import { EditPostInput } from "./dto/post.dto";
import { generatePostImageUrl } from "../../utility/imageHelper";
import { LikeEntity } from "./entity/like.entity";
import { BookmarkEntity } from "./entity/bookmark.entity";

export interface IPostRepository {
  savePost(data: AddPostData): Promise<PostDomain>;
  editPost(data: EditPostInput): Promise<PostDomain>;
  deletPost(postId: PostId): Promise<void>;
  getUsersPosts(userId: UserId): Promise<PostDomain[]>;
  findPost(postId: PostId): Promise<PostDomain | null>;
  getTagWithPosts(tagValue: TagString): Promise<TagEntity | null>;
  addLikeOnPost(
    postId: PostId,
    userId: UserId,
    currentLikeCount: number
  ): Promise<void>;
  deleteLikeFromPost(
    postId: PostId,
    userId: UserId,
    currentLikeCount: number
  ): Promise<void>;
  getLikeRecord(postId: PostId, userId: UserId): Promise<"LIKED" | "NO_LIKE">;
  addBookmarkOnPost(
    postId: PostId,
    userId: UserId,
    currentBookmarkCount: number
  ): Promise<void>;
  deleteBookmarkFromPost(
    postId: PostId,
    userId: UserId,
    currentBookmarkCount: number
  ): Promise<void>;
  getBookmarkRecord(
    postId: PostId,
    userId: UserId
  ): Promise<"BOOKMARKED" | "NO_BOOKMARK">;
}

export class PostRepository implements IPostRepository {
  private postsRepo: Repository<PostEntity>;
  private tagsRepo: Repository<TagEntity>;
  private likesRepo: Repository<LikeEntity>;
  private bookmarksRepo: Repository<BookmarkEntity>;
  constructor(private dataSource: DataSource) {
    this.postsRepo = dataSource.getRepository(PostEntity);
    this.tagsRepo = dataSource.getRepository(TagEntity);
    this.likesRepo = dataSource.getRepository(LikeEntity);
    this.bookmarksRepo = dataSource.getRepository(BookmarkEntity);
  }

  async getTagWithPosts(tagValue: TagString): Promise<TagEntity | null> {
    const tag = await this.tagsRepo.findOne({
      where: { value: tagValue },
      relations: { posts: { tags: true } },
    });

    return tag;
  }

  async findPost(postId: PostId): Promise<PostDomain | null> {
    return await this.postsRepo.findOne({
      where: { id: postId },
      relations: { tags: true },
    });
  }

  getUsersPosts(userId: UserId): Promise<PostDomain[]> {
    return this.postsRepo.find({
      where: { userId },
      relations: { tags: true },
    });
  }

  async editPost(data: EditPostInput): Promise<PostDomain> {
    const tags = data.tags ? await this.getTagsToAdd(data.tags) : undefined;
    const postToEdit = { ...data, tags };
    return this.postsRepo.save(postToEdit);
  }

  async deletPost(postId: PostId): Promise<void> {
    const x = await this.postsRepo.delete(postId);
    return;
  }

  async savePost(data: AddPostData): Promise<PostDomain> {
    const tagsToAdd = await this.getTagsToAdd(data.tags);
    return await this.postsRepo.save({
      id: v4(),
      title: data.title,
      description: data.description,
      userId: data.userId,
      tags: tagsToAdd,
      isCloseFriendsOnly: data.isCloseFriendsOnly,
      fileNames: data.fileNames,
    });
  }

  private async getTagsToAdd(tags: TagString[]) {
    const dbTags = await this.tagsRepo.findBy(
      tags.map((tag) => {
        return { value: tag };
      })
    );
    const dbTagsValues = dbTags.map((tag) => tag.value);
    const newTags = tags
      .filter((tagString) => !dbTagsValues.includes(tagString))
      .map((tagString) => {
        return { value: tagString };
      });

    return [...dbTags, ...newTags];
  }

  async addLikeOnPost(
    postId: PostId,
    userId: UserId,
    currentLikeCount: number
  ) {
    return this.dataSource.transaction(async (manager) => {
      await manager.getRepository(LikeEntity).save({ postId, userId });
      await manager
        .getRepository(PostEntity)
        .update({ id: postId }, { likesCount: currentLikeCount + 1 });
    });
  }

  async deleteLikeFromPost(
    postId: PostId,
    userId: UserId,
    currentLikeCount: number
  ) {
    return this.dataSource.transaction(async (manager) => {
      await manager.getRepository(LikeEntity).delete({ userId, postId });
      await manager
        .getRepository(PostEntity)
        .update(
          { id: postId },
          { likesCount: currentLikeCount - 1 >= 0 ? currentLikeCount - 1 : 0 }
        );
    });
  }
  async getLikeRecord(
    postId: PostId,
    userId: UserId
  ): Promise<"LIKED" | "NO_LIKE"> {
    const like = await this.likesRepo.findOne({ where: { postId, userId } });
    return like ? "LIKED" : "NO_LIKE";
  }

  addBookmarkOnPost(
    postId: PostId,
    userId: UserId,
    currentBookmarkCount: number
  ): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      await manager.getRepository(BookmarkEntity).save({ userId, postId });
      await manager.getRepository(PostEntity).update(
        { id: postId },
        {
          bookmarksCount: currentBookmarkCount + 1,
        }
      );
    });
  }
  deleteBookmarkFromPost(
    postId: PostId,
    userId: UserId,
    currentBookmarkCount: number
  ): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      await manager.getRepository(BookmarkEntity).delete({ userId, postId });
      await manager.getRepository(PostEntity).update(
        { id: postId },
        {
          bookmarksCount:
            currentBookmarkCount - 1 >= 0 ? currentBookmarkCount - 1 : 0,
        }
      );
    });
  }
  async getBookmarkRecord(
    postId: PostId,
    userId: UserId
  ): Promise<"BOOKMARKED" | "NO_BOOKMARK"> {
    const bookmarkRecord = await this.bookmarksRepo.findOne({
      where: { postId, userId },
    });
    return bookmarkRecord ? "BOOKMARKED" : "NO_BOOKMARK";
  }
}
