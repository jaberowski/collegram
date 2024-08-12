import { Email, isEmail } from "./model/email";
import { Identifier } from "./model/identifier";
import { Password, generateHashedPassword } from "./model/password";
import { UserId } from "./model/user-id";
import { Username } from "./model/username";
import { IUserRepository } from "./user.repository";
import {
  ConflictError,
  HttpError,
  NotFoundError,
  UnauthorizedError,
} from "../../utility/http-error";
import { makeUUID } from "../../data/UUID";
import { UUID } from "../../data/UUID";
import {
  ChangeInfoUser,
  ChangeInfoUserWithEmail,
  FEUser,
  User,
} from "./model/user";
import { makeToken } from "../token/token.helper";
import bcrypt from "bcrypt";
import { generateAvatarUrl, saveAvatarImage } from "../../utility/imageHelper";
import {
  CloseFriendUserRelation,
  FollowedUserRelation,
  NothingPrivateUserRelation,
  NothingPublicRelation,
  RequestedUserRelation,
  UserRelation,
} from "../userRelations/model/userRelation";

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
      return new ConflictError("username already exists");
    }

    const checkedEmail = await this.userRepo.checkAvailableEmail(email);

    if (checkedEmail.status === "taken_email") {
      return new ConflictError("email already exists");
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
      return new UnauthorizedError("username or password is incorrect");
    }

    return bcrypt.compare(password, user.hashedPassword).then((result) => {
      if (result === true) {
        const token = makeToken(user.id);
        return { token: `Bearer ${token}` };
      } else {
        return new UnauthorizedError("username or password is incorrect");
      }
    });
  }

  async forgot(identifier: Identifier) {
    const user = isEmail(identifier)
      ? await this.userRepo.findByEmail(identifier)
      : await this.userRepo.findByUsername(identifier);

    if (!user) {
      return new NotFoundError("no such a user");
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
      return new HttpError(404, "niste kaka");
    }

    return generateHashedPassword(newPass).then((hash) =>
      this.userRepo.resetPassword(tokenObject.userId, hash)
    );
  }

  async getUserInfo(userId: UserId): Promise<FEUser | NotFoundError> {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      return new NotFoundError();
    }
    const frontEndUser: FEUser = {
      ...user,
      avatarUrl: user.avatarName ? generateAvatarUrl(user.avatarName) : "",
    };
    return frontEndUser;
  }

  async changeMyInfo(
    user: User,
    changeInfo: ChangeInfoUser
  ): Promise<void | ConflictError> {
    if (changeInfo.email && user.email !== changeInfo.email) {
      return await this.changeMyInfoWithEmailChange({
        ...changeInfo,
        email: changeInfo.email,
      });
    } else {
      return await this.changeMyInfoWithoutEmailChange(changeInfo);
    }
  }

  private async changeMyInfoWithEmailChange(
    changeInfo: ChangeInfoUserWithEmail
  ): Promise<void | ConflictError> {
    const checkEmail = await this.userRepo.checkAvailableEmail(
      changeInfo.email!
    );
    if (checkEmail.status === "taken_email") {
      return new ConflictError("email is taken");
    } else {
      if (changeInfo.avatarName) saveAvatarImage(changeInfo.avatarName);

      return await this.userRepo.updateUserInfo({
        ...changeInfo,
        email: checkEmail,
      });
    }
  }

  private async changeMyInfoWithoutEmailChange(
    changeInfo: ChangeInfoUser
  ): Promise<void> {
    if (changeInfo.avatarName) saveAvatarImage(changeInfo.avatarName);

    const { email, ...data } = changeInfo;

    return await this.userRepo.updateUserInfo({ ...data });
  }

  async increamentFollowStats(
    relation:
      | NothingPrivateUserRelation
      | NothingPublicRelation
      | RequestedUserRelation
  ): Promise<void> {
    this.userRepo.increamentFollowStats(relation);
  }

  async decreamentFollowStats(
    relation: FollowedUserRelation | CloseFriendUserRelation
  ): Promise<void> {
    this.userRepo.decreamentFollowStats(relation);
  }
}
