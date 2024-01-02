import { error } from "console";
import { Email, isEmail } from "./model/email";
import { Identifier } from "./model/identifier";
import { Password } from "./model/password";
import { UserId } from "./model/user-id";
import { Username } from "./model/username";
import { IUserRepository, UserRepository } from "./user.repository";
import { HttpError } from "../../utility/http-error";

export class UserService {
  constructor(private UserRepo: IUserRepository) {}

  async signup({
    username,
    email,
    password,
  }: {
    username: Username;
    email: Email;
    password: Password;
  }) {
    const checkedUsername = await userRepo.checkAvailableUsername(username);

    if (checkedUsername.status === "taken_username") {
      throw new HttpError(409, "username already exists");
    }

    const checkedEmail = await userRepo.checkAvailableEmail(email);

    if (checkedEmail.status === "taken_email") {
      throw new HttpError(409, "email already exists");
    }

    return userRepo.addUser({ checkedUsername, checkedEmail, password });
  }

  async signin(identifier: Identifier, password: Password) {
    const user = isEmail(identifier)
      ? await this.UserRepo.findByEmail(identifier)
      : await this.UserRepo.findByUsername(identifier);

    if (!user) {
      throw new HttpError(404, "username or password is incorrect");
    }

    if (password !== user.password) {
      throw new HttpError(404, "username or password is incorrect");
    }

    return user;
  }

  async forgot(identifier: Identifier) {}

  async recoverPassword(token: string, newPass: Password) {}
}

const userRepo = new UserRepository();
export const userService = new UserService(userRepo);
