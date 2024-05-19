import { User } from "../../user/model/user";
import { UserId } from "../../user/model/user-id";

export type UserRelationStatus = "FOLLOWED" | "NOTHING";

export interface UserRelationBase {
  userId: UserId;
  targetUserId: UserId;
  status: UserRelationStatus;
}

export interface NothingUserRelation extends UserRelationBase {
  status: "NOTHING";
}

export interface FollowedUserRelation extends UserRelationBase {
  status: "FOLLOWED";
}

export type UserRelation = NothingUserRelation | FollowedUserRelation;
