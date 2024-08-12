import { Router } from "express";
import {
  changeInfo,
  forgotPassDto,
  recoverPassDto,
  signinDto,
  signupDto,
} from "../modules/user/dto/authentication.dto";
import { UserService } from "../modules/user/user.service";
import { handleExpress } from "../utility/handle-express";
import { authMiddleWare } from "./middlewares/auth.middleware";
import { upload } from "./middlewares/upload.middleware";
import { UserRelationService } from "../modules/userRelations/userRelation.service";
import {
  userIdDto,
  userRelationDto,
} from "../modules/userRelations/dto/user-relation.dto";

export const makeUserRouter = (
  userService: UserService,
  UserRelationService: UserRelationService
) => {
  const userRouter = Router();
  userRouter.post("/login", async (req, res, next) => {
    try {
      const { identifier, password } = signinDto.parse(req.body);
      handleExpress(res, async () => userService.signin(identifier, password));
    } catch (error) {
      next(error);
    }
  });

  userRouter.post("/signup", async (req, res, next) => {
    try {
      const { username, email, password } = signupDto.parse(req.body);
      handleExpress(res, () =>
        userService.signup({ username, email, password })
      );
    } catch (error) {
      next(error);
    }
  });

  userRouter.post("/forgot", async (req, res, next) => {
    try {
      const { identifier } = forgotPassDto.parse(req.body);
      handleExpress(res, () => userService.forgot(identifier));
    } catch (error) {
      next(error);
    }
  });

  userRouter.post("/recover", async (req, res, next) => {
    try {
      const { token, password } = recoverPassDto.parse(req.body);
      handleExpress(res, () => userService.recoverPassword(token, password));
    } catch (error) {
      next(error);
    }
  });

  userRouter.get(
    "/info",
    authMiddleWare(userService),
    async (req, res, next) => {
      try {
        const user = req.user;
        handleExpress(res, () => userService.getUserInfo(user.id));
      } catch (error) {
        next(error);
      }
    }
  );

  userRouter.get(
    "/other-user-info",
    authMiddleWare(userService),
    async (req, res, next) => {
      const { targetUserId } = userRelationDto.parse(req.body);
      try {
        const user = req.user;
        handleExpress(res, () =>
          UserRelationService.getUserInfo(user.id, targetUserId)
        );
      } catch (error) {
        next(error);
      }
    }
  );

  userRouter.post(
    "/edit",
    authMiddleWare(userService),
    upload.uploadAvatar(),
    async (req, res, next) => {
      try {
        const user = req.user;
        console.log(req.body);
        const data = changeInfo.parse(req.body);
        handleExpress(res, () =>
          userService.changeMyInfo(user, {
            ...data,
            id: user.id,
            ...(req.file ? { avatarName: req.file.filename } : {}),
          })
        );
      } catch (error) {
        next(error);
      }
    }
  );

  userRouter.get(
    "/get-relation",
    authMiddleWare(userService),
    async (req, res, next) => {
      try {
        const { targetUserId } = userRelationDto.parse(req.body);
        handleExpress(res, () =>
          UserRelationService.getRelationStatus(req.user.id, targetUserId)
        );
      } catch (error) {
        next(error);
      }
    }
  );

  userRouter.post(
    "/follow",
    authMiddleWare(userService),
    async (req, res, next) => {
      try {
        const { targetUserId } = userRelationDto.parse(req.body);
        handleExpress(res, () =>
          UserRelationService.follow(req.user.id, targetUserId)
        );
      } catch (error) {
        next(error);
      }
    }
  );

  userRouter.post(
    "/unfollow",
    authMiddleWare(userService),
    async (req, res, next) => {
      try {
        const { targetUserId } = userRelationDto.parse(req.body);
        handleExpress(res, () =>
          UserRelationService.unfollow(req.user.id, targetUserId)
        );
      } catch (error) {
        next(error);
      }
    }
  );

  userRouter.post(
    "/follow-request",
    authMiddleWare(userService),
    async (req, res, next) => {
      try {
        const { targetUserId } = userRelationDto.parse(req.body);
        handleExpress(res, () =>
          UserRelationService.sendFollowRequest(req.user.id, targetUserId)
        );
      } catch (error) {
        next(error);
      }
    }
  );

  userRouter.post(
    "/accept-request",
    authMiddleWare(userService),
    async (req, res, next) => {
      try {
        const { targetUserId } = userRelationDto.parse(req.body);
        handleExpress(res, () =>
          UserRelationService.acceptFollowRequest(req.user.id, targetUserId)
        );
      } catch (error) {
        next(error);
      }
    }
  );

  userRouter.post(
    "/reject-request",
    authMiddleWare(userService),
    async (req, res, next) => {
      try {
        const { targetUserId } = userRelationDto.parse(req.body);
        handleExpress(res, () =>
          UserRelationService.rejectFollowRequest(req.user.id, targetUserId)
        );
      } catch (error) {
        next(error);
      }
    }
  );

  userRouter.post(
    "/cancel-request",
    authMiddleWare(userService),
    async (req, res, next) => {
      try {
        const { targetUserId } = userRelationDto.parse(req.body);
        handleExpress(res, () =>
          UserRelationService.cancelFollowRequest(req.user.id, targetUserId)
        );
      } catch (error) {
        next(error);
      }
    }
  );

  userRouter.post(
    "/add-closefriend",
    authMiddleWare(userService),
    async (req, res, next) => {
      try {
        const { targetUserId } = userRelationDto.parse(req.body);
        handleExpress(res, () =>
          UserRelationService.addCloseFriend(req.user.id, targetUserId)
        );
      } catch (error) {
        next(error);
      }
    }
  );

  userRouter.post(
    "/kick-closefriend",
    authMiddleWare(userService),
    async (req, res, next) => {
      try {
        const { targetUserId } = userRelationDto.parse(req.body);
        handleExpress(res, () =>
          UserRelationService.kickCloseFriend(req.user.id, targetUserId)
        );
      } catch (error) {
        next(error);
      }
    }
  );

  userRouter.post(
    "/block",
    authMiddleWare(userService),
    async (req, res, next) => {
      try {
        const { targetUserId } = userRelationDto.parse(req.body);
        handleExpress(res, () =>
          UserRelationService.block(req.user.id, targetUserId)
        );
      } catch (error) {
        next(error);
      }
    }
  );

  userRouter.post(
    "/unblock",
    authMiddleWare(userService),
    async (req, res, next) => {
      try {
        const { targetUserId } = userRelationDto.parse(req.body);
        handleExpress(res, () =>
          UserRelationService.unBlock(req.user.id, targetUserId)
        );
      } catch (error) {
        next(error);
      }
    }
  );

  userRouter.get(
    "/followers",
    authMiddleWare(userService),
    async (req, res, next) => {
      try {
        const { userId } = userIdDto.parse(req.body);
        handleExpress(res, () => UserRelationService.followersList(userId));
      } catch (error) {
        next(error);
      }
    }
  );

  userRouter.get(
    "/followers/me",
    authMiddleWare(userService),
    async (req, res, next) => {
      try {
        handleExpress(res, () =>
          UserRelationService.followersList(req.user.id)
        );
      } catch (error) {
        next(error);
      }
    }
  );

  userRouter.get(
    "/followings",
    authMiddleWare(userService),
    async (req, res, next) => {
      try {
        const { userId } = userIdDto.parse(req.body);
        handleExpress(res, () => UserRelationService.followingsList(userId));
      } catch (error) {
        next(error);
      }
    }
  );

  userRouter.get(
    "/followings/me",
    authMiddleWare(userService),
    async (req, res, next) => {
      try {
        handleExpress(res, () =>
          UserRelationService.followingsList(req.user.id)
        );
      } catch (error) {
        next(error);
      }
    }
  );

  return userRouter;
};
