import { Router } from "express";
import {
  forgotPassDto,
  recoverPassDto,
  signinDto,
  signupDto,
} from "../modules/user/dto/authentication.dto";
import { isIdentifier } from "../modules/user/model/identifier";
import { UserService } from "../modules/user/user.service";
import { handleExpress } from "../utility/handle-express";
import { authMiddleWare } from "./middlewares/auth.middleware";

export const makeUserRouter = (userService: UserService) => {
  const userRouter = Router();
  userRouter.post("/login", async (req, res) => {
    const { identifier, password } = signinDto.parse(req.body);
    handleExpress(res, async () => userService.signin(identifier, password));
  });

  userRouter.post("/signup", async (req, res, next) => {
    console.log(req.body);
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
        handleExpress(res, () => userService.getMyInfo(user.id));
      } catch (error) {
        next(error);
      }
    }
  );

  return userRouter;
};
