import { makeApp } from "./api";
import { Identifier } from "./modules/user/model/identifier";
import { Password } from "./modules/user/model/password";
import { User } from "./modules/user/model/user";
import { UserId } from "./modules/user/model/user-id";
import { UserRepository } from "./modules/user/user.repository";
import { UserService } from "./modules/user/user.service";
import { EnvManager, zodEnv } from "./utility/EnvManager";
import { AppDataSource } from "../data-source";
import { seedUser } from "./utility/seed";

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export const envManager = EnvManager.initialize();

AppDataSource.initialize().then(async (dataSource) => {
  //TODO: delete after database froms stable
  const entitiesMetadata = dataSource.entityMetadatas;
  for (const meta of entitiesMetadata) {
    await dataSource.query(`TRUNCATE TABLE ${meta.tableName} CASCADE`);
  }
  await seedUser(dataSource);
  const app = makeApp(dataSource);
  app.listen(envManager.get("PORT"), () => {
    console.log("listening on port " + envManager.get("PORT"));
  });
});
