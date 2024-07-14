import { Router } from "express";
import { PostService } from "../modules/post/post.service";
import { authMiddleWare } from "./middlewares/auth.middleware";
import { UserService } from "../modules/user/user.service";
import { addPostDto, editPostDto } from "../modules/post/dto/post.dto";
import { handleExpress } from "../utility/handle-express";
import { zodPostId } from "../modules/post/model/postId";
import { zodUserId } from "../modules/user/model/user-id";
import { zodTagString } from "../modules/post/model/tag";
import { upload } from "./middlewares/upload.middleware";

export const makePostRouter = (
  postService: PostService,
  userService: UserService
) => {
  const postRouter = Router();

  postRouter.post("/add", upload.uploadPostImages(), (req, res, next) => {
    try {
      const addPostData = addPostDto.parse({ ...req.body, files: req.files });

      handleExpress(res, async () =>
        postService.addPost({ ...addPostData }, req.user.id)
      );
    } catch (error) {
      next(error);
    }
  });

  postRouter.delete("/delete/:postId", (req, res, next) => {
    try {
      const postId = zodPostId.parse(req.params.postId);
      handleExpress(res, async () => postService.deletePost(postId));
    } catch (error) {
      next(error);
    }
  });

  postRouter.patch("/edit", (req, res, next) => {
    try {
      const editPostData = editPostDto.parse(req.body);
      handleExpress(res, async () =>
        postService.editPost(editPostData, req.user.id)
      );
    } catch (error) {
      next(error);
    }
  });

  postRouter.get(
    "/post/:postId",

    (req, res, next) => {
      try {
        const postId = zodPostId.parse(req.params.postId);
        handleExpress(res, async () =>
          postService.getPost(postId, req.user.id)
        );
      } catch (error) {
        next(error);
      }
    }
  );

  postRouter.put("/post/:postId/toggle-like", (req, res, next) => {
    try {
      const postId = zodPostId.parse(req.params.postId);
      handleExpress(res, async () =>
        postService.changeLikeOnPost(postId, req.user.id)
      );
    } catch (error) {
      next(error);
    }
  });

  postRouter.put("/post/:postId/toggle-bookmark", (req, res, next) => {
    try {
      const postId = zodPostId.parse(req.params.postId);
      handleExpress(res, async () =>
        postService.changeBookmarkOnPost(postId, req.user.id)
      );
    } catch (error) {
      next(error);
    }
  });

  postRouter.get("/user/:userId", (req, res, next) => {
    try {
      const targetUserId = zodUserId.parse(req.params.userId);
      handleExpress(res, async () =>
        postService.getUserPosts(req.user.id, targetUserId)
      );
    } catch (error) {
      next(error);
    }
  });

  postRouter.get("/user/me", (req, res, next) => {
    try {
      handleExpress(res, async () => postService.getMyPosts(req.user.id));
    } catch (error) {
      next(error);
    }
  });

  postRouter.get("/tags/:tagValue", (req, res, next) => {
    try {
      const tagValue = zodTagString.parse(req.params.tagValue);
      handleExpress(res, async () => postService.getTagAllPosts(tagValue));
    } catch (error) {
      next(error);
    }
  });

  return postRouter;
};
