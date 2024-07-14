import {
  ForbiddenError,
  HttpError,
  NotFoundError,
} from "../../utility/http-error";
import { generatePostImageUrl, savePostImage } from "../../utility/imageHelper";
import { UserId } from "../user/model/user-id";
import { UserService } from "../user/user.service";
import { UserRelationService } from "../userRelations/userRelation.service";
import { AddPostInput, EditPostInput } from "./dto/post.dto";
import { Post, PostAccessLevel } from "./model/post";
import { PostId } from "./model/postId";
import { TagString } from "./model/tag";
import { IPostRepository } from "./post.repository";

export class PostService {
  constructor(
    private postRepo: IPostRepository,
    private userRelationService: UserRelationService,
    private userService: UserService
  ) {}

  async addPost(postData: AddPostInput, userId: UserId): Promise<Post> {
    await Promise.all(postData.fileNames.map(savePostImage));
    const postEntity = await this.postRepo.savePost({ ...postData, userId });

    return {
      ...postEntity,
      fileUrls: postEntity.fileNames.map(generatePostImageUrl),
      haveLiked: false,
      haveBookmarked: false,
    };
  }

  async deletePost(postId: PostId) {
    return this.postRepo.deletPost(postId);
  }

  async editPost(postData: EditPostInput, myUserId: UserId) {
    const post = await this.getPost(postData.id, myUserId);

    if (post instanceof NotFoundError) return post;
    if (post instanceof ForbiddenError || post.userId !== myUserId)
      return new ForbiddenError("you cant edit this post");
    const editedPostEntity = await this.postRepo.editPost(postData);
    return {
      ...editedPostEntity,
      haveLiked: await this.haveILikedPost(myUserId, postData.id),
    };
  }

  private getUserPostAccessLevel = async (
    myUserId: UserId,
    userId: UserId
  ): Promise<PostAccessLevel | NotFoundError> => {
    const isPrivate = await this.userService.isPrivateUser(userId);
    const hasFollow = await this.userRelationService.hasFollow(
      myUserId,
      userId
    );

    if (myUserId === userId) return "ALL_POSTS";
    if (isPrivate === false || hasFollow) return "ALL_POSTS";
    else if (isPrivate instanceof NotFoundError) return isPrivate;
    else return "NONE";
  };

  private async canIAccessThisPost(
    postId: PostId,
    myUserId: UserId
  ): Promise<boolean> {
    const post = await this.postRepo.findPost(postId);
    if (!post) return false;

    const accessLevel = await this.getUserPostAccessLevel(
      myUserId,
      post.userId
    );

    if (accessLevel === "ALL_POSTS") return true;
    else return false;
  }

  getUserPosts = async (
    myUserId: UserId,
    userId: UserId
  ): Promise<Post[] | NotFoundError> => {
    const accessLevel = await this.getUserPostAccessLevel(myUserId, userId);

    if (accessLevel instanceof NotFoundError) return accessLevel;

    if (accessLevel === "NONE")
      return new ForbiddenError("you cant see this user posts");
    else {
      const databaseResult = await this.postRepo.getUsersPosts(userId);
      const userPosts = await Promise.all(
        databaseResult.map(async (post) => {
          return {
            ...post,

            haveLiked:
              (await this.haveILikedPost(myUserId, post.id)) === "LIKED"
                ? true
                : false,
            haveBookmarked:
              (await this.haveIBookmarkedPost(myUserId, post.id)) ===
              "BOOKMARKED"
                ? true
                : false,
            fileUrls: post.fileNames.map(generatePostImageUrl),
          };
        })
      );
      return userPosts;
    }
  };

  getMyPosts = async (userId: UserId): Promise<Post[]> => {
    const result = await this.postRepo.getUsersPosts(userId);

    const posts = await Promise.all(
      result.map(async (postEntity) => {
        return {
          ...postEntity,
          fileUrls: postEntity.fileNames.map(generatePostImageUrl),
          haveLiked:
            (await this.haveILikedPost(userId, postEntity.id)) === "LIKED"
              ? true
              : false,
          haveBookmarked:
            (await this.haveIBookmarkedPost(userId, postEntity.id)) ===
            "BOOKMARKED"
              ? true
              : false,
        };
      })
    );
    return posts;
  };

  async getPost(
    postId: PostId,
    myUserId: UserId
  ): Promise<Post | ForbiddenError | NotFoundError> {
    const post = await this.postRepo.findPost(postId);

    if (!post) return new NotFoundError("post does not exist");

    const postAccessLevel = await this.getUserPostAccessLevel(
      myUserId,
      post.userId
    );

    if (postAccessLevel instanceof NotFoundError) return postAccessLevel;

    if (postAccessLevel === "ALL_POSTS")
      return {
        ...post,
        haveLiked:
          (await this.haveILikedPost(myUserId, postId)) === "LIKED"
            ? true
            : false,
        haveBookmarked:
          (await this.haveIBookmarkedPost(myUserId, post.id)) === "BOOKMARKED"
            ? true
            : false,
        fileUrls: post.fileNames.map(generatePostImageUrl),
      };
    else return new ForbiddenError("cant access post");
  }

  async getTagAllPosts(tagValue: TagString): Promise<Post[] | NotFoundError> {
    const tag = await this.postRepo.getTagWithPosts(tagValue);
    if (!tag) return new NotFoundError("no such a tag");
    else return tag.posts;
  }

  async haveILikedPost(
    myUserId: UserId,
    postId: PostId
  ): Promise<"LIKED" | "NO_LIKE"> {
    return await this.postRepo.getLikeRecord(postId, myUserId);
  }

  async changeLikeOnPost(
    postId: PostId,
    myUserId: UserId
  ): Promise<"LIKE_ADDED" | "LIKE_REMOVED" | Error> {
    const post = await this.getPost(postId, myUserId);

    if (post instanceof HttpError) return post;

    const likeRecord = await this.haveILikedPost(myUserId, postId);

    if (likeRecord === "LIKED") {
      await this.postRepo.deleteLikeFromPost(postId, myUserId, post.likesCount);
      return "LIKE_REMOVED";
    } else {
      await this.postRepo.addLikeOnPost(postId, myUserId, post.likesCount);
      return "LIKE_ADDED";
    }
  }

  async haveIBookmarkedPost(
    myUserId: UserId,
    postId: PostId
  ): Promise<"BOOKMARKED" | "NO_BOOKMARK"> {
    return await this.postRepo.getBookmarkRecord(postId, myUserId);
  }
  async changeBookmarkOnPost(
    postId: PostId,
    myUserId: UserId
  ): Promise<"BOOKMARK_ADDED" | "BOOKMARK_REMOVED" | Error> {
    const post = await this.getPost(postId, myUserId);

    if (post instanceof HttpError) return post;

    const bookmarkRecord = await this.haveIBookmarkedPost(myUserId, postId);

    if (bookmarkRecord === "BOOKMARKED") {
      await this.postRepo.deleteBookmarkFromPost(
        postId,
        myUserId,
        post.bookmarksCount
      );
      return "BOOKMARK_REMOVED";
    } else {
      await this.postRepo.addBookmarkOnPost(
        postId,
        myUserId,
        post.bookmarksCount
      );
      return "BOOKMARK_ADDED";
    }
  }
}
