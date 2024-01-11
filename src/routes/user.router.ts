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

  userRouter.post("/signup", async (req, res) => {
    const { username, email, password } = signupDto.parse(req.body);
    handleExpress(res, () => userService.signup({ username, email, password }));
  });

  userRouter.post("/forgot", async (req, res) => {
    const { identifier } = forgotPassDto.parse(req.body);
    handleExpress(res, () => userService.forgot(identifier));
  });

  userRouter.post("/recover", async (req, res) => {
    const { token, password } = recoverPassDto.parse(req.body);
    handleExpress(res, () => userService.recoverPassword(token, password));
  });

  userRouter.get("/info", authMiddleWare(userService), async (req, res) => {
    const user = req.user;
    handleExpress(res, () => userService.getMyInfo(user.id));
  });

  return userRouter;
};
