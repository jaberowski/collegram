import { relative } from "path";
import { BadRequestError } from "../../utility/http-error";
import { UserRelation, UserRelationBase } from "./model/userRelation";
import { IUserRelationRepository } from "./userRelation.repository";
import { UserId } from "../user/model/user-id";

export class UserRelationService {
  constructor(private UserRelationRepo: IUserRelationRepository) {}

  async follow(userId: UserId, targetUserId: UserId) {
    const relation = await this.getRelationStatus(userId, targetUserId);
    if (relation.status !== "NOTHING") {
      return new BadRequestError("");
    }
    return this.UserRelationRepo.saveFollowRelation(relation);
  }
  async unfollow(userId: UserId, targetUserId: UserId) {
    const relation = await this.getRelationStatus(userId, targetUserId);
    if (relation.status !== "FOLLOWED") {
      return new BadRequestError("");
    }
    return this.UserRelationRepo.deleteRelation(relation);
  }
  async followersList(userId: UserId) {
    return this.UserRelationRepo.getFollowersList(userId);
  }
  async followingsList(userId: UserId) {
    return this.UserRelationRepo.getFollowingList(userId);
  }
  async hasFollow(userId: UserId, targetUserId: UserId) {
    const relation = await this.getRelationStatus(userId, targetUserId);
    return relation.status != "NOTHING";
  }
  getRelationStatus = async (
    userId: UserId,
    targetUserId: UserId
  ): Promise<UserRelation> => {
    return this.UserRelationRepo.getRelation(userId, targetUserId);
  };
}
