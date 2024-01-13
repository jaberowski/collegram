import { makeApp } from "./api";
import { Identifier } from "./modules/user/model/identifier";
import { Password } from "./modules/user/model/password";
import { User } from "./modules/user/model/user";
import { UserId } from "./modules/user/model/user-id";
import { UserRepository } from "./modules/user/user.repository";
import { UserService } from "./modules/user/user.service";
import dotenv from "dotenv";
import { EnvManager } from "./utility/EnvManager";
import { AppDataSource } from "../data-source";
import { seedUser } from "./utility/seed";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export const envManager = EnvManager.initialize();

AppDataSource.initialize().then(async (dataSource) => {
  await seedUser(dataSource);
  const userRepo = new UserRepository(dataSource);
  const userService = new UserService(userRepo);
  const app = makeApp(userService);
  app.listen(envManager.get("PORT"), () => {
    console.log("listening on port " + process.env.PORT);
  });
});
