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
import {
  PostAccessLevel,
  PostCardBasic,
  PostCardWithInteractions,
  PostDetail,
  PostDomain,
} from "./model/post";
import { PostId } from "./model/postId";
import { TagString } from "./model/tag";
import { IPostRepository } from "./post.repository";

export class PostService {
  constructor(
    private postRepo: IPostRepository,
    private userRelationService: UserRelationService,
    private userService: UserService
  ) {}

  async addPost(postData: AddPostInput, myUserId: UserId): Promise<PostDetail> {
    await Promise.all(postData.fileNames.map(savePostImage));
    const post = await this.postRepo.savePost({
      ...postData,
      userId: myUserId,
    });
    return this.postMapper(post, myUserId).toPostDetail();
  }

  async deletePost(postId: PostId) {
    return this.postRepo.deletPost(postId);
  }

  async editPost(
    postData: EditPostInput,
    myUserId: UserId
  ): Promise<NotFoundError | ForbiddenError | PostDetail> {
    const post = await this.getPost(postData.id, myUserId);

    if (post instanceof NotFoundError) return post;
    if (post instanceof ForbiddenError || post.userId !== myUserId)
      return new ForbiddenError("you cant edit this post");
    const editedPost = await this.postRepo.editPost(postData);
    return this.postMapper(editedPost, myUserId).toPostDetail();
  }

  private getUserPostAccessLevel = async (
    myUserId: UserId,
    TargetUserId: UserId
  ): Promise<PostAccessLevel | NotFoundError> => {
    const isPrivate = await this.userService.isPrivateUser(TargetUserId);
    const hasFollow = await this.userRelationService.hasFollow(
      myUserId,
      TargetUserId
    );

    if (myUserId === TargetUserId) return "ALL_POSTS";
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
    TargetUserId: UserId
  ): Promise<PostCardWithInteractions[] | NotFoundError> => {
    const accessLevel = await this.getUserPostAccessLevel(
      myUserId,
      TargetUserId
    );

    if (accessLevel instanceof NotFoundError) return accessLevel;

    if (accessLevel === "NONE")
      return new ForbiddenError("you cant see this user posts");
    else {
      const resultPosts = await this.postRepo.getUsersPosts(TargetUserId);
      return await Promise.all(
        resultPosts.map((post) =>
          this.postMapper(post, myUserId).toPostCardWithInteractions()
        )
      );
    }
  };

  getMyPosts = async (
    myUserId: UserId
  ): Promise<PostCardWithInteractions[]> => {
    const result = await this.postRepo.getUsersPosts(myUserId);

    return await Promise.all(
      result.map(async (post) =>
        this.postMapper(post, myUserId).toPostCardWithInteractions()
      )
    );
  };

  async getPost(
    postId: PostId,
    myUserId: UserId
  ): Promise<PostDetail | ForbiddenError | NotFoundError> {
    const post = await this.postRepo.findPost(postId);

    if (!post) return new NotFoundError("post does not exist");

    const postAccessLevel = await this.getUserPostAccessLevel(
      myUserId,
      post.userId
    );

    if (postAccessLevel instanceof NotFoundError) return postAccessLevel;

    if (postAccessLevel === "ALL_POSTS")
      return this.postMapper(post, myUserId).toPostDetail();
    else return new ForbiddenError("cant access post");
  }

  async getTagAllPosts(
    myUserId: UserId,
    tagValue: TagString
  ): Promise<PostCardBasic[] | NotFoundError> {
    const tag = await this.postRepo.getTagWithPosts(tagValue);
    if (!tag) return new NotFoundError("no such a tag");

    const filteredPosts = tag.posts.filter(
      (post) =>
        post.isCloseFriendsOnly === false && post.user.isPrivate === false
    );

    return Promise.all(
      filteredPosts.map(async (post) => {
        return this.postMapper(post, myUserId).toPostCardBasic();
      })
    );
  }

  private async haveILikedPost(
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

  private async haveIBookmarkedPost(
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

  async getPostInteractions(postId: PostId, myUserId: UserId) {
    return {
      haveLiked:
        (await this.haveILikedPost(myUserId, postId)) === "LIKED"
          ? true
          : false,
      haveBookmarked:
        (await this.haveIBookmarkedPost(myUserId, postId)) === "BOOKMARKED"
          ? true
          : false,
    };
  }

  private postMapper(post: PostDomain, myUserId: UserId) {
    const { fileNames, ...postWithOutFileNames } = post;
    const postWithImages = {
      ...postWithOutFileNames,
      fileUrls: fileNames.map(generatePostImageUrl),
    };

    return {
      toPostDetail: async (): Promise<PostDetail> => {
        return {
          ...postWithImages,
          ...(await this.getPostInteractions(post.id, myUserId)),
        };
      },
      toPostCardBasic: async (): Promise<PostCardBasic> => {
        const { id, fileUrls, tags, userId } = postWithImages;
        return { id, fileUrls, tags, userId };
      },
      toPostCardWithInteractions:
        async (): Promise<PostCardWithInteractions> => {
          const { id, fileUrls, tags, userId } = postWithImages;
          return {
            id,
            fileUrls,
            tags,
            userId,
            bookmarksCount: postWithImages.bookmarksCount,
            likesCount: postWithImages.likesCount,
            ...(await this.getPostInteractions(postWithImages.id, myUserId)),
          };
        },
    };
  }
}
