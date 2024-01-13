import { error } from "console";
import { Email, isEmail } from "./model/email";
import { Identifier } from "./model/identifier";
import { Password, generateHashedPassword } from "./model/password";
import { UserId } from "./model/user-id";
import { Username } from "./model/username";
import { IUserRepository, UserRepository } from "./user.repository";
import { ForbiddenError, HttpError } from "../../utility/http-error";
import { v4 } from "uuid";
import { makeUUID } from "../../data/UUID";
import { UUID } from "../../data/UUID";
import { User } from "./model/user";
import { makeToken } from "../token/token.helper";
import bcrypt from "bcrypt";

export class UserService {
  constructor(private userRepo: IUserRepository) {}

  async signup({
    username,
    email,
    password,
  }: {
    username: Username;
    email: Email;
    password: Password;
  }) {
    const checkedUsername = await this.userRepo.checkAvailableUsername(
      username
    );

    if (checkedUsername.status === "taken_username") {
      throw new HttpError(409, "username already exists");
    }

    const checkedEmail = await this.userRepo.checkAvailableEmail(email);

    if (checkedEmail.status === "taken_email") {
      throw new HttpError(409, "email already exists");
    }

    return generateHashedPassword(password, 10).then((hash) =>
      this.userRepo.addUser({
        checkedUsername,
        checkedEmail,
        hashedPassword: hash,
      })
    );
  }

  async signin(identifier: Identifier, password: Password) {
    const user = isEmail(identifier)
      ? await this.userRepo.findByEmail(identifier)
      : await this.userRepo.findByUsername(identifier);

    if (!user) {
      throw new HttpError(404, "username or password is incorrect");
    }

    return bcrypt.compare(password, user.hashedPassword).then((result) => {
      if (result === true) {
        try {
          const token = makeToken(user.id);
          return { token: `Bearer ${token}` };
        } catch (e) {
          console.log(e);
        }
      } else {
        throw new HttpError(404, "username or password is incorrect");
      }
    });
  }

  async forgot(identifier: Identifier) {
    const user = isEmail(identifier)
      ? await this.userRepo.findByEmail(identifier)
      : await this.userRepo.findByUsername(identifier);

    if (!user) {
      throw new HttpError(404, "no such a user");
    }

    const token = makeUUID();

    const tokenItem = await this.userRepo.saveResetPasswordTokenObject(
      user.id,
      token,
      Date.now() + 360000
    );

    //TODO: send token to email
    return tokenItem;
  }

  async recoverPassword(token: UUID, newPass: Password) {
    const tokenObject = await this.userRepo.getResetPasswordTokenObject(token);
    if (!tokenObject) {
      throw new HttpError(404, "niste kaka");
    }

    return generateHashedPassword(newPass).then((hash) =>
      this.userRepo.resetPassword(tokenObject.userId, hash)
    );
  }

  async getMyInfo(userId: UserId): Promise<User | null> {
    const user = await this.userRepo.findById(userId);

    return user;
  }
}
