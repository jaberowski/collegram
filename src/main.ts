import { makeApp } from "./api";
import { Identifier } from "./modules/user/model/identifier";
import { Password } from "./modules/user/model/password";
import { User } from "./modules/user/model/user";
import { UserId } from "./modules/user/model/user-id";
import { UserRepository } from "./modules/user/user.repository";
import { UserService } from "./modules/user/user.service";
import dotenv from "dotenv";
import { EnvManager } from "./utility/EnvManager";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

const userRepo = new UserRepository();
const userService = new UserService(userRepo);
const app = makeApp(userService);
export const envManager = EnvManager.initialize();

app.listen(envManager.get("PORT"), () => {
  console.log("listening on port " + process.env.PORT);
});
