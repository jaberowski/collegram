import { UUID } from "../../data/UUID";
import { HttpError } from "../../utility/http-error";
import { Email } from "./model/email";
import { NameString } from "./model/name";
import { Password } from "./model/password";
import { CheckedEmail, CheckedUserName, CreateUser, User } from "./model/user";
import { UserId } from "./model/user-id";
import { Username } from "./model/username";
import { v4 } from "uuid";

export interface IUserRepository {
  findById: (id: UserId) => Promise<User | undefined>;
  findByUsername: (username: Username) => Promise<User | undefined>;
  findByEmail: (email: Email) => Promise<User | undefined>;
  addUser: (createUser: CreateUser) => Promise<User>;
  saveResetPasswordTokenObject: (
    userId: UserId,
    token: UUID,
    expireDate: number
  ) => Promise<ResetTokenObject>;
  getResetPasswordTokenObject: (
    token: UUID
  ) => Promise<ResetTokenObject | undefined>;
  resetPassword: (userId: UserId, newPass: Password) => Promise<void>;
}

interface ResetTokenObject {
  token: UUID;
  userId: UserId;
  expireDate: number;
}

export class UserRepository implements IUserRepository {
  private usersRepo: User[];
  private resetTokenRepo: ResetTokenObject[];
  constructor() {
    this.usersRepo = [
      {
        id: v4() as UserId,
        bio: "",
        email: "j.fathi1998@gmail.com" as Email,
        firstname: "jaber" as NameString,
        lastname: "fathi" as NameString,
        password: "621377jF" as Password,
        profile_Url: "",
        username: "jaberowski" as Username,
        isPrivate: false,
      },
    ];
    this.resetTokenRepo = [];
  }
  async resetPassword(userId: UserId, newPass: Password): Promise<void> {
    const user = this.usersRepo.find((item) => item.id === userId)!;
    const updatedUser = { ...user, password: newPass };
    this.usersRepo = this.usersRepo.map((item) =>
      item.id === userId ? updatedUser : item
    );
  }
  async getResetPasswordTokenObject(
    token: UUID
  ): Promise<ResetTokenObject | undefined> {
    const tokenObject = this.resetTokenRepo.find(
      (item) => item.token === token
    );

    return tokenObject;
  }
  async saveResetPasswordTokenObject(
    userId: UserId,
    token: UUID,
    expireDate: number
  ): Promise<ResetTokenObject> {
    // const existingToken = this.resetTokenRepo.find(
    //   (item) => item.userId === userId
    // );
    // update existing one
    const tokenItem = { expireDate, token, userId };
    this.resetTokenRepo.push(tokenItem);
    return tokenItem;
  }
  async addUser(createUser: CreateUser): Promise<User> {
    const user: User = {
      username: createUser.checkedUsername.data,
      email: createUser.checkedEmail.data,
      id: v4() as UserId,
      isPrivate: false,
      password: createUser.password,
    };
    this.usersRepo.push(user);
    return user;
  }
  findById!: (id: UserId) => Promise<User | undefined>;
  async findByUsername(username: Username) {
    return this.usersRepo.find((item) => item.username === username);
  }
  async findByEmail(email: Email) {
    return this.usersRepo.find((item) => item.email === email);
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
