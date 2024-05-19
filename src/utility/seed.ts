import { DataSource } from "typeorm";
import { UserEntity } from "../modules/user/entity/user.entity";
import { v4 } from "uuid";
import { UserId } from "../modules/user/model/user-id";
import { Email } from "../modules/user/model/email";
import { NameString } from "../modules/user/model/name";
import { Password } from "../modules/user/model/password";
import { Username } from "../modules/user/model/username";
import bcrypt from "bcrypt";
import { UserRelationREpository } from "../modules/userRelations/userRelation.repository";
import { UserRelationEntity } from "../modules/userRelations/entity/userRelation.entity";

export const seedUser = async (AppDataSource: DataSource) => {
  const userRepo = AppDataSource.getRepository(UserEntity);
  const userRelationRepo = AppDataSource.getRepository(UserRelationEntity);

  userRelationRepo.delete({});
  userRepo.delete({});
  const count = await userRepo.count();

  if (count === 0) {
    userRepo.save({
      id: v4() as UserId,
      bio: "",
      email: "j.fathi1998@gmail.com" as Email,
      firstname: "jaber" as NameString,
      lastname: "fathi" as NameString,
      hashedPassword: bcrypt.hashSync("621377jF", 10),
      profile_Url: "",
      username: "jaberowski" as Username,
      isPrivate: false,
    });
  }
};
