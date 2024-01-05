import { error } from "console";
import { Email, isEmail } from "./model/email";
import { Identifier } from "./model/identifier";
import { Password } from "./model/password";
import { UserId } from "./model/user-id";
import { Username } from "./model/username";
import { IUserRepository, UserRepository } from "./user.repository";
import { HttpError } from "../../utility/http-error";
import { v4 } from "uuid";
import { makeUUID } from "../../data/UUID";
import { UUID } from "../../data/UUID";

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

  async forgot(identifier: Identifier) {
    const user = isEmail(identifier)
      ? await this.UserRepo.findByEmail(identifier)
      : await this.UserRepo.findByUsername(identifier);

    if (!user) {
      throw new HttpError(404, "no such a user");
    }

    const token = makeUUID();

    const tokenItem = await this.UserRepo.saveResetPasswordTokenObject(
      user.id,
      user.id,
      Date.now() + 360000
    );
    return tokenItem;
  }

  async recoverPassword(token: UUID, newPass: Password) {
    const tokenObject = await this.UserRepo.getResetPasswordTokenObject(token);
    if (!tokenObject) {
      throw new HttpError(404, "niste kaka");
    }

    return this.UserRepo.resetPassword(tokenObject.userId, newPass);
  }
}

const userRepo = new UserRepository();
export const userService = new UserService(userRepo);
