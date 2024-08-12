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
    await userRepo.save([
      {
        id: "75b0c5a4-5f15-4744-9dd7-5a56eaa15fb5" as UserId,
        bio: "",
        email: "j.fathi1998@gmail.com" as Email,
        firstname: "jaber" as NameString,
        lastname: "fathi" as NameString,
        hashedPassword: bcrypt.hashSync("621377jF", 10),
        profile_Url: "",
        username: "jaber" as Username,
        isPrivate: false,
      },

      {
        id: "90194a0c-e9cf-4129-bac2-0b78f7e4f1e4" as UserId,
        bio: "",
        email: "erfan@gmail.com" as Email,
        firstname: "erfan" as NameString,
        lastname: "erfani" as NameString,
        hashedPassword: bcrypt.hashSync("621377jF", 10),
        profile_Url: "",
        username: "erfan" as Username,
        isPrivate: false,
      },

      {
        id: "e0194e47-1b1a-4911-b306-86853774fac0" as UserId,
        bio: "",
        email: "saman@gmail.com" as Email,
        firstname: "saman" as NameString,
        lastname: "samani" as NameString,
        hashedPassword: bcrypt.hashSync("621377jF", 10),
        profile_Url: "",
        username: "saman" as Username,
        isPrivate: true,
      },
    ]);
  }
};
