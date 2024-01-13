import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserEntity } from "./src/modules/user/entity/user.entity";
import { ResetTokenEntity } from "./src/modules/user/entity/resetToken.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "jaber",
  password: "26a1998jF@",
  database: "collegeram",
  synchronize: true,
  logging: false,
  entities: [UserEntity, ResetTokenEntity],
  migrations: [],
  subscribers: [],
});
