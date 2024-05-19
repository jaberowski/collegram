import { DataSource, Repository } from "typeorm";
import { UserId } from "../user/model/user-id";
import {
  FollowedUserRelation,
  NothingUserRelation,
  UserRelation,
  UserRelationBase,
} from "./model/userRelation";
import { UserRelationEntity } from "./entity/userRelation.entity";

export interface IUserRelationRepository {
  getRelation(userId: UserId, targetUserId: UserId): Promise<UserRelation>;
  saveFollowRelation(
    relation: NothingUserRelation
  ): Promise<FollowedUserRelation>;
  deleteRelation(relation: FollowedUserRelation): Promise<NothingUserRelation>;
  getFollowersList(userId: UserId): Promise<UserId[]>;
  getFollowingList(userId: UserId): Promise<UserId[]>;
}

export class UserRelationREpository implements IUserRelationRepository {
  private userRelationRepo: Repository<UserRelationEntity>;
  constructor(private dataSource: DataSource) {
    this.userRelationRepo = dataSource.getRepository(UserRelationEntity);
  }
  async getFollowingList(userId: UserId): Promise<UserId[]> {
    const relations = await this.userRelationRepo.find({
      where: { userId: userId },
    });
    return relations
      .filter((r) => r.status !== "NOTHING")
      .map((r) => r.targetUserId);
  }
  async getFollowersList(userId: UserId): Promise<UserId[]> {
    const relations = await this.userRelationRepo.find({
      where: { targetUserId: userId },
    });
    return relations.filter((r) => r.status !== "NOTHING").map((r) => r.userId);
  }
  async getRelation(
    userId: UserId,
    targetUserId: UserId
  ): Promise<UserRelation> {
    const result = await this.userRelationRepo.findOne({
      where: { userId, targetUserId },
    });

    return result ? result : { userId, targetUserId, status: "NOTHING" };
  }
  async saveFollowRelation(
    relation: NothingUserRelation
  ): Promise<FollowedUserRelation> {
    return this.userRelationRepo.save({
      ...relation,
      status: "FOLLOWED",
    });
  }
  async deleteRelation(
    relation: FollowedUserRelation
  ): Promise<NothingUserRelation> {
    await this.userRelationRepo.delete(relation);
    return { ...relation, status: "NOTHING" };
  }
}
