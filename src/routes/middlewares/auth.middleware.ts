import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../../utility/http-error";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { UserService } from "../../modules/user/user.service";
import { envManager } from "../../main";
import { verifyToken } from "../../modules/token/token.helper";

export const authMiddleWare =
  (userService: UserService) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    //
    const auth = req.headers.authorization;

    if (!auth) {
      throw new ForbiddenError();
    }

    const token = auth.split(" ")[1];

    if (!auth) {
      throw new ForbiddenError();
    }

    try {
      const decoded = verifyToken(token);

      const user = await userService.getMyInfo(decoded.userId);
      if (!user) {
        res.status(401).send({ message: "unauthorized" });
        return;
      }
      req.user = user;
    } catch (e) {
      res.status(401).send({ message: "token error" });
      return;
    } finally {
      next();
    }
  };
