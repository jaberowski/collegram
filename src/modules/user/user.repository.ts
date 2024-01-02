import { UUID } from "../../data/UUID";
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
}

export class UserRepository implements IUserRepository {
  private repo: User[];
  constructor() {
    this.repo = [
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
  }
  async addUser(createUser: CreateUser): Promise<User> {
    const user: User = {
      username: createUser.checkedUsername.data,
      email: createUser.checkedEmail.data,
      id: v4() as UserId,
      isPrivate: false,
      password: createUser.password,
    };
    this.repo.push(user);
    return user;
  }
  findById!: (id: UserId) => Promise<User | undefined>;
  async findByUsername(username: Username) {
    return this.repo.find((item) => item.username === username);
  }
  async findByEmail(email: Email) {
    return this.repo.find((item) => item.email === email);
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
