import { DataSource, Repository } from "typeorm";
import { UUID } from "../../data/UUID";
import { HttpError } from "../../utility/http-error";
import { Email } from "./model/email";
import { NameString } from "./model/name";
import { Password } from "./model/password";
import { CheckedEmail, CheckedUserName, CreateUser, User } from "./model/user";
import { UserId } from "./model/user-id";
import { Username } from "./model/username";
import { v4 } from "uuid";
import { UserEntity } from "./entity/user.entity";
import { ResetTokenEntity } from "./entity/resetToken.entity";

export interface IUserRepository {
  findById: (id: UserId) => Promise<User | null>;
  findByUsername: (username: Username) => Promise<User | null>;
  findByEmail: (email: Email) => Promise<User | null>;
  addUser: (createUser: CreateUser) => Promise<User>;
  saveResetPasswordTokenObject: (
    userId: UserId,
    token: UUID,
    expireDate: number
  ) => Promise<ResetTokenObject>;
  getResetPasswordTokenObject: (
    token: UUID
  ) => Promise<ResetTokenObject | null>;
  resetPassword: (userId: UserId, newPass: Password) => Promise<void>;
  checkAvailableUsername(username: Username): Promise<CheckedUserName>;
  checkAvailableEmail(email: Email): Promise<CheckedEmail>;
}

interface ResetTokenObject {
  token: UUID;
  userId: UserId;
  expireDate: Date;
}

export class UserRepository implements IUserRepository {
  private userRepo: Repository<UserEntity>;
  private resetTokenRepo: Repository<ResetTokenEntity>;
  constructor(private dataSource: DataSource) {
    this.userRepo = dataSource.getRepository(UserEntity);
    this.resetTokenRepo = dataSource.getRepository(ResetTokenEntity);
  }
  async resetPassword(userId: UserId, newPass: Password): Promise<void> {
    await this.userRepo.update({ id: userId }, { password: newPass });
  }
  async getResetPasswordTokenObject(
    token: UUID
  ): Promise<ResetTokenObject | null> {
    // const tokenObject = this.resetTokenRepo.find(
    //   (item) => item.token === token
    // );

    const tokenObject = await this.resetTokenRepo.findOneBy({
      token: token,
    });

    return tokenObject;
  }
  async saveResetPasswordTokenObject(
    userId: UserId,
    token: UUID,
    expireDate: number
  ): Promise<ResetTokenObject> {
    const existingToken = await this.resetTokenRepo.findOneBy({ userId });

    if (existingToken) {
      return await this.resetTokenRepo.save({
        ...existingToken,
        token,
        expireDate: new Date(expireDate),
      });
    } else {
      const tokenItem = await this.resetTokenRepo.save({
        expireDate: new Date(expireDate),
        token: token,
        userId: userId,
      });
      return tokenItem;
    }
  }
  async addUser(createUser: CreateUser): Promise<User> {
    const user: User = {
      username: createUser.checkedUsername.data,
      email: createUser.checkedEmail.data,
      id: v4() as UserId,
      isPrivate: false,
      password: createUser.password,
    };
    this.userRepo.save(user);
    return user;
  }
  async findById(id: UserId): Promise<User | null> {
    return this.userRepo.findOneBy({ id });
  }
  async findByUsername(username: Username) {
    return this.userRepo.findOneBy({ username });
  }
  async findByEmail(email: Email) {
    return this.userRepo.findOneBy({ email });
  }

  async checkAvailableUsername(username: Username): Promise<CheckedUserName> {
    const result = await this.findByUsername(username);

    return result
      ? { status: "taken_username", data: username }
      : { status: "available_username", data: username };
  }

  async checkAvailableEmail(email: Email): Promise<CheckedEmail> {
    const result = await this.findByEmail(email);
    return result
      ? { status: "taken_email", data: email }
      : { status: "available_email", data: email };
  }
}
