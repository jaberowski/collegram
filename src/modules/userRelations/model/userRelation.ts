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

export type EitherTypeBlockUserRelation =
  | BlockedUserRelation
  | IsBlockedUserRelation;

export type UserRelationStatus = UserRelation["status"];
export type UserRelationStatusRecord = UserRelationRecord["status"];

export function isNonBlockRelation(
  relation: UserRelation
): relation is NonBlockUserRelaiton {
  return relation.status !== "BLOCKED" && relation.status !== "ISBLOCKED";
}

export function isBlockRelation(
  relation: UserRelation
): relation is EitherTypeBlockUserRelation {
  return relation.status === "BLOCKED" || relation.status === "ISBLOCKED";
}

export interface TwoWayRelation {
  relation: UserRelation;
  otherWayRelation: UserRelation;
}

export interface BothNonBlockRelation extends TwoWayRelation {
  relation: NonBlockUserRelaiton;
  otherWayRelation: NonBlockUserRelaiton;
}

export interface Blocked_IsBlockedTwoWayRelation extends TwoWayRelation {
  relation: BlockedUserRelation;
  otherWayRelation: IsBlockedUserRelation;
}

export interface IsBlocked_BlockedTwoWayRelation extends TwoWayRelation {
  relation: IsBlockedUserRelation;
  otherWayRelation: BlockedUserRelation;
}

export interface DoubleIsBlockedTwoWayRelation extends TwoWayRelation {
  relation: IsBlockedUserRelation;
  otherWayRelation: IsBlockedUserRelation;
}

export type ValidTwoWayRelaiton =
  | Blocked_IsBlockedTwoWayRelation
  | IsBlocked_BlockedTwoWayRelation
  | DoubleIsBlockedTwoWayRelation
  | BothNonBlockRelation;
export type InvalidTwoWayRelation = Exclude<
  TwoWayRelation,
  ValidTwoWayRelaiton
>;
