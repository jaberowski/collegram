import { Router } from "express";
import { signinDto, signupDto } from "../modules/user/dto/authentication.dto";
import { isIdentifier } from "../modules/user/model/identifier";
import { UserService } from "../modules/user/user.service";
import { handleExpress } from "../utility/handle-express";

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
  return userRouter;
};
