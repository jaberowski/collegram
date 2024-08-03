import { User } from "../../user/model/user";
import { UserId } from "../../user/model/user-id";

export interface UserRelationBase {
  userId: UserId;
  targetUserId: UserId;
}

export interface NothingPrivateUserRelation extends UserRelationBase {
  status: "NOTHING_PRIVATE";
}

export interface NothingPublicRelation extends UserRelationBase {
  status: "NOTHING_PUBLIC";
}

export interface RequestedUserRelation extends UserRelationBase {
  status: "REQUESTED";
}
export interface FollowedUserRelation extends UserRelationBase {
  status: "FOLLOWED";
}

export interface CloseFriendUserRelation extends UserRelationBase {
  status: "CLOSEFRIEND";
}

export interface BlockedUserRelation extends UserRelationBase {
  status: "BLOCKED";
}

export interface IsBlockedUserRelation extends UserRelationBase {
  status: "ISBLOCKED";
}

export type UserRelation =
  | NothingPrivateUserRelation
  | NothingPublicRelation
  | RequestedUserRelation
  | FollowedUserRelation
  | CloseFriendUserRelation
  | BlockedUserRelation
  | IsBlockedUserRelation;

export type UserRelationRecord =
  | RequestedUserRelation
  | FollowedUserRelation
  | CloseFriendUserRelation
  | BlockedUserRelation
  | IsBlockedUserRelation;

export type NothingUserRelation =
  | NothingPrivateUserRelation
  | NothingPublicRelation;

export type NonBlockUserRelaiton =
  | NothingPrivateUserRelation
  | NothingPublicRelation
  | RequestedUserRelation
  | FollowedUserRelation
  | CloseFriendUserRelation;

export type UserRelationStatus = UserRelation["status"];
export type UserRelationStatusRecord = UserRelationRecord["status"];
