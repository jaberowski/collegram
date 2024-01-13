import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserEntity } from "./src/modules/user/entity/user.entity";
import { ResetTokenEntity } from "./src/modules/user/entity/resetToken.entity";
import { EnvManager, zodEnv } from "./src/utility/EnvManager";

const envManager = EnvManager.initialize();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: envManager.get("DATABASE_HOST"),
  port: envManager.get("DATABASE_PORT"),
  username: envManager.get("DATABASE_USERNAME"),
  password: envManager.get("DATABASE_PASS"),
  database: envManager.get("DATABASE_NAME"),
  synchronize: true,
  logging: false,
  entities: [UserEntity, ResetTokenEntity],
  migrations: [],
  subscribers: [],
});
