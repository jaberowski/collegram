import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserEntity } from "./src/modules/user/entity/user.entity";
import { ResetTokenEntity } from "./src/modules/user/entity/resetToken.entity";
import { EnvManager, zodEnv } from "./src/utility/EnvManager";
import { UserRelationEntity } from "./src/modules/userRelations/entity/userRelation.entity";
import { PostEntity } from "./src/modules/post/entity/post.entity";
import { TagEntity } from "./src/modules/post/entity/tag.entity";
import { LikeEntity } from "./src/modules/post/entity/like.entity";
import { BookmarkEntity } from "./src/modules/post/entity/bookmark.entity";

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
  entities: [
    UserEntity,
    ResetTokenEntity,
    PostEntity,
    TagEntity,
    UserRelationEntity,
    LikeEntity,
    BookmarkEntity,
  ],
  migrations: [],
  subscribers: [],
  poolSize: 1,
});
