import {
  BadRequestError,
  ForbiddenError,
  HttpError,
  NotFoundError,
} from "../../utility/http-error";
import {
  FollowedUserRelation,
  RequestedUserRelation,
  UserRelation,
} from "./model/userRelation";
import { IUserRelationRepository } from "./userRelation.repository";
import { UserId } from "../user/model/user-id";
import { IUserRepository } from "../user/user.repository";

export class UserRelationService {
  constructor(
    private userRelationRepo: IUserRelationRepository,
    private userRepo: IUserRepository
  ) {}

  getRelationStatus = async (
    userId: UserId,
    targetUserId: UserId
  ): Promise<UserRelation | BadRequestError> => {
    if (userId === targetUserId) return new ForbiddenError();

    const relationRecord = await this.userRelationRepo.getRelation(
      userId,
      targetUserId
    );

    if (relationRecord) return relationRecord;

    const targetUser = await this.userRepo.findById(targetUserId);
    const user = await this.userRepo.findById(userId);

    if (!targetUser || !user) {
      console.log("user", user?.username);
      console.log("targetUser", targetUser?.username);
      return new NotFoundError("there is no such a user");
    }

    return targetUser.isPrivate
      ? { userId, targetUserId, status: "NOTHING_PRIVATE" }
      : { userId, targetUserId, status: "NOTHING_PUBLIC" };
  };

  async follow(userId: UserId, targetUserId: UserId) {
    const relation = await this.getRelationStatus(userId, targetUserId);

    if (relation instanceof Error) return relation;

    if (relation.status !== "NOTHING_PUBLIC") {
      return new BadRequestError("");
    }
    return this.userRelationRepo.saveFollowRelation(relation);
  }

  async sendFollowRequest(
    userId: UserId,
    targetUserId: UserId
  ): Promise<RequestedUserRelation | BadRequestError> {
    const relation = await this.getRelationStatus(userId, targetUserId);

    if (relation instanceof Error) return relation;

    if (relation.status !== "NOTHING_PRIVATE") {
      return new BadRequestError("");
    }
    return this.userRelationRepo.saveRequestedRelation(relation);
  }

  async cancelFollowRequest(
    userId: UserId,
    targetUserId: UserId
  ): Promise<void | BadRequestError> {
    const relation = await this.getRelationStatus(userId, targetUserId);

    if (relation instanceof Error) return relation;

    if (relation.status !== "REQUESTED") {
      return new BadRequestError("");
    }
    await this.userRelationRepo.deleteRelation(relation);
  }

  async acceptFollowRequest(
    userId: UserId,
    targetUserId: UserId
  ): Promise<void | BadRequestError> {
    const otherWayRelation = await this.getRelationStatus(targetUserId, userId);

    if (otherWayRelation instanceof Error) return otherWayRelation;

    if (otherWayRelation.status !== "REQUESTED") {
      return new BadRequestError("");
    }
    await this.userRelationRepo.saveFollowRelation(otherWayRelation);
  }

  async rejectFollowRequest(
    userId: UserId,
    targetUserId: UserId
  ): Promise<void | BadRequestError> {
    const otherWayRelation = await this.getRelationStatus(targetUserId, userId);

    if (otherWayRelation instanceof Error) return otherWayRelation;

    if (otherWayRelation.status !== "REQUESTED") {
      return new BadRequestError("");
    }
    await this.userRelationRepo.deleteRelation(otherWayRelation);
  }

  async unfollow(userId: UserId, targetUserId: UserId) {
    const relation = await this.getRelationStatus(userId, targetUserId);

    if (
      relation.status === "NOTHING_PRIVATE" ||
      relation.status === "NOTHING_PUBLIC"
    ) {
      return;
    }

    if (
      relation.status === "BLOCKED" ||
      relation.status === "ISBLOCKED" ||
      relation.status === "REQUESTED" ||
      relation instanceof Error
    ) {
      return new BadRequestError("");
    }

    await this.userRelationRepo.deleteRelation(relation);
    return;
  }

  async addCloseFriend(
    userId: UserId,
    targetUserId: UserId
  ): Promise<void | BadRequestError | ForbiddenError> {
    const otherWayRelation = await this.getRelationStatus(targetUserId, userId);

    if (otherWayRelation instanceof HttpError) return otherWayRelation;

    if (otherWayRelation.status === "CLOSEFRIEND") return;

    if (otherWayRelation.status !== "FOLLOWED") return new ForbiddenError();

    await this.userRelationRepo.saveCloseFriendRelation(otherWayRelation);
  }

  async kickCloseFriend(
    userId: UserId,
    targetUserId: UserId
  ): Promise<void | BadRequestError | ForbiddenError> {
    const otherWayRelation = await this.getRelationStatus(targetUserId, userId);

    if (otherWayRelation instanceof HttpError) return otherWayRelation;

    if (otherWayRelation.status !== "CLOSEFRIEND") return new ForbiddenError();

    await this.userRelationRepo.saveFollowRelation(otherWayRelation);
  }

  async followersList(userId: UserId) {
    return this.userRelationRepo.getFollowersList(userId);
  }
  async followingsList(userId: UserId) {
    return this.userRelationRepo.getFollowingList(userId);
  }
  async hasFollow(userId: UserId, targetUserId: UserId) {
    const relation = await this.getRelationStatus(userId, targetUserId);
    return relation.status === "FOLLOWED" || relation.status === "CLOSEFRIEND";
  }
}
