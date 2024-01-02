import { NameString } from "./name";
import { Password } from "./password";
import { UserId } from "./user-id";
import { Username } from "./username";

export interface User {
  id: UserId;
  username: Username;
  password: Password;
  Email: string;
  profile_Url: string;
  firstname: NameString;
  lastname: NameString;
  isPrivate: boolean;
  bio: string;
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
