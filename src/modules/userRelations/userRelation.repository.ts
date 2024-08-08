import { DataSource, EntityManager, Repository } from "typeorm";
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
import { User } from "../user/model/user";

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

  handleBlock(
    relation: NonBlockUserRelaiton,
    otherWayRelation: NonBlockUserRelaiton
  ): Promise<void>;

  handleBlockBack(twoWayRelation: {
    relation: IsBlockedUserRelation;
    otherWayRelation: BlockedUserRelation;
  }): Promise<void>;

  handleSimpleUnblock(
    relation: BlockedUserRelation,
    otherWayRelation: IsBlockedUserRelation
  ): Promise<void>;
  handleMutualUnblock(
    relation: IsBlockedUserRelation,
    otherWayRelation: IsBlockedUserRelation
  ): Promise<void>;
  // saveIsBlockedRelation(
  //   relation: Exclude<UserRelation, BlockedUserRelation | IsBlockedUserRelation>
  // ): Promise<IsBlockedUserRelation>;

  deleteRelation(userId: UserId, targetUserId: UserId): Promise<boolean>;
  getFollowersList(userId: UserId): Promise<UserId[]>;
  getFollowingList(userId: UserId): Promise<UserId[]>;
  getBlackList(userId: UserId): Promise<User[]>;
  getCloseFriendsList(userId: UserId): Promise<User[]>;
}

export class UserRelationREpository implements IUserRelationRepository {
  private userRelationRepo: Repository<UserRelationEntity>;
  constructor(private dataSource: DataSource) {
    this.userRelationRepo = dataSource.getRepository(UserRelationEntity);
  }

  async handleBlock(
    relation: NonBlockUserRelaiton,
    otherWayRelation: NonBlockUserRelaiton
  ) {
    const { userId, targetUserId } = relation;
    this.dataSource.transaction(async (entityManager) => {
      const { userId, targetUserId } = relation;
      const repo = entityManager.getRepository(UserRelationEntity);
      await repo.save({ userId, targetUserId, status: "BLOCKED" });
      await repo.save({
        userId: targetUserId,
        targetUserId: userId,
        status: "ISBLOCKED",
      });
    });
  }

  async handleBlockBack(twoWayRelation: {
    relation: IsBlockedUserRelation;
    otherWayRelation: BlockedUserRelation;
  }): Promise<void> {
    this.dataSource.transaction(async (entityManager) => {
      const { userId, targetUserId } = twoWayRelation.relation;
      const repo = entityManager.getRepository(UserRelationEntity);
      await repo.save({
        userId: targetUserId,
        targetUserId: userId,
        status: "ISBLOCKED",
      });
    });
  }

  async handleSimpleUnblock(
    relation: BlockedUserRelation,
    otherWayRelation: IsBlockedUserRelation
  ) {
    this.dataSource.transaction(async (entityManager) => {
      const repo = entityManager.getRepository(UserRelationEntity);
      const { userId, targetUserId } = relation;
      await repo.delete({ userId, targetUserId });
      await repo.delete({ userId: targetUserId, targetUserId: userId });
    });
  }

  async handleMutualUnblock(
    relation: IsBlockedUserRelation,
    otherWayRelation: IsBlockedUserRelation
  ) {
    this.dataSource.transaction(async (entityManager) => {
      const { userId, targetUserId } = relation;
      this.dataSource.transaction(async (entityManager) => {
        const { userId, targetUserId } = relation;
        const repo = entityManager.getRepository(UserRelationEntity);
        await repo.save({ userId, targetUserId, status: "ISBLOCKED" });
        await repo.save({
          userId: targetUserId,
          targetUserId: userId,
          status: "BLOCKED",
        });
      });
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

  async deleteRelation(userId: UserId, targetUserId: UserId): Promise<boolean> {
    const x = await this.userRelationRepo.delete({ userId, targetUserId });
    return x.affected === 1;
  }

  async getCloseFriendsList(userId: UserId): Promise<User[]> {
    const closeFriendsRelations = await this.userRelationRepo.find({
      where: { status: "CLOSEFRIEND", userId },
      relations: { targetUser: true },
    });

    const closeFriendsList = closeFriendsRelations.map(
      (relation) => relation.targetUser
    );
    return closeFriendsList;
  }
  async getBlackList(userId: UserId): Promise<User[]> {
    const blockedRelaitons = await this.userRelationRepo.find({
      where: { status: "BLOCKED", userId },
      relations: { targetUser: true },
    });
    const blackList = blockedRelaitons.map((relation) => relation.targetUser);
    return blackList;
  }
}
