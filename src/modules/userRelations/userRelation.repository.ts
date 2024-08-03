import { DataSource, Repository } from "typeorm";
import { UserId } from "../user/model/user-id";
import {
  BlockedUserRelation,
  CloseFriendUserRelation,
  FollowedUserRelation,
  IsBlockedUserRelation,
  NonBlockUserRelaiton,
  NothingPrivateUserRelation,
  NothingPublicRelation,
  NothingUserRelation,
  RequestedUserRelation,
  UserRelation,
  UserRelationRecord,
} from "./model/userRelation";
import { UserRelationEntity } from "./entity/userRelation.entity";

export interface IUserRelationRepository {
  getRelation(
    userId: UserId,
    targetUserId: UserId
  ): Promise<UserRelationRecord | null>;
  saveFollowRelation(
    relation:
      | NothingPublicRelation
      | RequestedUserRelation
      | CloseFriendUserRelation
  ): Promise<FollowedUserRelation>;
  saveRequestedRelation(
    relation: NothingPrivateUserRelation
  ): Promise<RequestedUserRelation>;
  saveCloseFriendRelation(
    relation: FollowedUserRelation
  ): Promise<CloseFriendUserRelation>;

  saveBlockedRelation(
    relation: Exclude<UserRelation, BlockedUserRelation>
  ): Promise<BlockedUserRelation>;

  saveIsBlockedRelation(
    relation: Exclude<UserRelation, BlockedUserRelation | IsBlockedUserRelation>
  ): Promise<IsBlockedUserRelation>;

  deleteRelation(relation: UserRelationRecord): Promise<boolean>;
  getFollowersList(userId: UserId): Promise<UserId[]>;
  getFollowingList(userId: UserId): Promise<UserId[]>;
}

export class UserRelationREpository implements IUserRelationRepository {
  private userRelationRepo: Repository<UserRelationEntity>;
  constructor(private dataSource: DataSource) {
    this.userRelationRepo = dataSource.getRepository(UserRelationEntity);
  }
  saveBlockedRelation(
    relation: Exclude<UserRelation, BlockedUserRelation>
  ): Promise<BlockedUserRelation> {
    const { userId, targetUserId } = relation;
    return this.userRelationRepo.save({
      userId,
      targetUserId,
      status: "BLOCKED",
    });
  }
  saveIsBlockedRelation(
    relation: Exclude<UserRelation, BlockedUserRelation | IsBlockedUserRelation>
  ): Promise<IsBlockedUserRelation> {
    const { userId, targetUserId } = relation;
    return this.userRelationRepo.save({
      userId,
      targetUserId,
      status: "ISBLOCKED",
    });
  }
  async getFollowingList(userId: UserId): Promise<UserId[]> {
    const relations = await this.userRelationRepo.find({
      where: { userId: userId },
    });
    return relations
      .filter((r) => r.status === "CLOSEFRIEND" || r.status === "FOLLOWED")
      .map((r) => r.targetUserId);
  }
  async getFollowersList(userId: UserId): Promise<UserId[]> {
    const relations = await this.userRelationRepo.find({
      where: { targetUserId: userId },
    });
    return relations
      .filter((r) => r.status === "CLOSEFRIEND" || r.status === "FOLLOWED")
      .map((r) => r.userId);
  }
  async getRelation(
    userId: UserId,
    targetUserId: UserId
  ): Promise<UserRelationRecord | null> {
    const result = await this.userRelationRepo.findOne({
      where: { userId, targetUserId },
      relations: { targetUser: true },
    });

    if (result) {
      return result;
    } else return result;
  }
  async saveFollowRelation(
    relation:
      | NothingUserRelation
      | RequestedUserRelation
      | CloseFriendUserRelation
  ): Promise<FollowedUserRelation> {
    const { userId, targetUserId } = relation;
    return this.userRelationRepo.save({
      userId,
      targetUserId,
      status: "FOLLOWED",
    });
  }

  async saveRequestedRelation(
    relation: NothingUserRelation
  ): Promise<RequestedUserRelation> {
    const { userId, targetUserId } = relation;
    return this.userRelationRepo.save({
      userId,
      targetUserId,
      status: "REQUESTED",
    });
  }

  async saveCloseFriendRelation(
    relation: FollowedUserRelation
  ): Promise<CloseFriendUserRelation> {
    const { userId, targetUserId } = relation;
    return this.userRelationRepo.save({
      userId,
      targetUserId,
      status: "CLOSEFRIEND",
    });
  }

  async deleteRelation(relation: FollowedUserRelation): Promise<boolean> {
    const { userId, targetUserId } = relation;
    const x = await this.userRelationRepo.delete({ userId, targetUserId });
    return x.affected === 1;
  }
}
