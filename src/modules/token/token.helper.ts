import { z } from "zod";
import { envManager } from "../../main";
import { UserId, isUserId } from "../user/model/user-id";
import jwt from "jsonwebtoken";
import { Token } from "./model/token.model";

const zodTokenData = z.object({ userId: z.string().refine(isUserId) });

export const makeToken = (userId: UserId) => {
  const payload = { userId };

  return jwt.sign(payload, envManager.get("JWT_SECRET"), {
    expiresIn: "1h",
  }) as Token;
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, envManager.get("JWT_SECRET"));
    const data = zodTokenData.parse(decoded);
    console.log(data);
    return data;
  } catch (err) {
    console.log(err);
    throw new Error();
  }
};
