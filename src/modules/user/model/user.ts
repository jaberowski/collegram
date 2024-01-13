import { Email } from "./email";
import { NameString } from "./name";
import { HashedPassword, Password } from "./password";
import { UserId } from "./user-id";
import { Username, isUsername } from "./username";

export interface User {
  id: UserId;
  username: Username;
  hashedPassword: HashedPassword;
  email: Email;
  profile_Url?: string;
  firstname?: NameString;
  lastname?: NameString;
  isPrivate: boolean;
  bio?: string;
}

export interface PublicUser extends User {
  isPrivate: false;
}

const isPublicUser = (user: User): user is PublicUser => {
  return user.isPrivate === false;
};

export interface PrivateUser extends User {
  isPrivate: true;
}

const isPrivateUser = (user: User): user is PrivateUser => {
  return user.isPrivate === true;
};

export interface AvailableEmail {
  data: Email;
  status: "available_email";
}

export interface TakenEmail {
  data: Email;
  status: "taken_email";
}

export type CheckedEmail = TakenEmail | AvailableEmail;

export interface AvailableUsername {
  status: "available_username";
  data: Username;
}

export interface TakenUsername {
  status: "taken_username";
  data: Username;
}

export type CheckedUserName = AvailableUsername | TakenUsername;

export type CreateUser = {
  checkedUsername: AvailableUsername;
  checkedEmail: AvailableEmail;
  hashedPassword: HashedPassword;
};
