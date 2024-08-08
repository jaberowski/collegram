import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  HttpError,
  NotFoundError,
  ServerError,
} from "../../utility/http-error";
import {
  isBlockRelation,
  isNonBlockRelation,
  RequestedUserRelation,
  UserRelation,
  ValidTwoWayRelaiton,
} from "./model/userRelation";
import { IUserRelationRepository } from "./userRelation.repository";
import { UserId } from "../user/model/user-id";
import { IUserRepository } from "../user/user.repository";
import { User } from "../user/model/user";
import { UserService } from "../user/user.service";

export class UserRelationService {
  constructor(
    private userRelationRepo: IUserRelationRepository,
    private userRepo: IUserRepository,
    private userService: UserService
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

  async getTwoWayRelationStatus(
    userId: UserId,
    targetUserId: UserId
  ): Promise<ValidTwoWayRelaiton | ServerError> {
    const relation = await this.getRelationStatus(userId, targetUserId);
    const otherWayRelation = await this.getRelationStatus(targetUserId, userId);

    if (relation instanceof HttpError) return relation;
    if (otherWayRelation instanceof HttpError) return otherWayRelation;

    if (isNonBlockRelation(relation) && isNonBlockRelation(otherWayRelation))
      return { relation, otherWayRelation };

    if (
      relation.status === "ISBLOCKED" &&
      otherWayRelation.status === "ISBLOCKED"
    )
      return { relation, otherWayRelation };

    if (
      relation.status === "BLOCKED" &&
      otherWayRelation.status === "ISBLOCKED"
    )
      return { relation, otherWayRelation };

    if (
      relation.status === "ISBLOCKED" &&
      otherWayRelation.status === "BLOCKED"
    )
      return { relation, otherWayRelation };

    return new ServerError("invalid relation record");
  }

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
    await this.userRelationRepo.deleteRelation(userId, targetUserId);
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
    await this.userRelationRepo.deleteRelation(
      otherWayRelation.userId,
      otherWayRelation.targetUserId
    );
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

    await this.userRelationRepo.deleteRelation(
      relation.userId,
      relation.targetUserId
    );
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

  async block(userId: UserId, targetUserId: UserId) {
    const bothWayRelation = await this.getTwoWayRelationStatus(
      userId,
      targetUserId
    );

    if (bothWayRelation instanceof HttpError) return bothWayRelation;
    const { relation, otherWayRelation } = bothWayRelation;

    if (isNonBlockRelation(relation) && isNonBlockRelation(otherWayRelation)) {
      this.userRelationRepo.handleBlock(relation, otherWayRelation);
      return;
    }

    if (
      relation.status === "ISBLOCKED" &&
      otherWayRelation.status === "BLOCKED"
    ) {
      this.userRelationRepo.handleBlockBack({ relation, otherWayRelation });

      return;
    }

    if (
      relation.status === "ISBLOCKED" &&
      otherWayRelation.status === "ISBLOCKED"
    ) {
      return new ConflictError("you already blocked this user");
    }

    return new ServerError("");
  }

  async unBlock(
    userId: UserId,
    targetUserId: UserId
  ): Promise<BadRequestError | ForbiddenError | void> {
    const relation = await this.getRelationStatus(userId, targetUserId);
    const otherWayRelation = await this.getRelationStatus(targetUserId, userId);

    if (relation instanceof HttpError) return relation;
    if (otherWayRelation instanceof HttpError) return otherWayRelation;

    if (
      relation.status === "BLOCKED" &&
      otherWayRelation.status === "ISBLOCKED"
    ) {
      await this.userRelationRepo.handleSimpleUnblock(
        relation,
        otherWayRelation
      );
      return;
    }

    if (
      relation.status === "ISBLOCKED" &&
      otherWayRelation.status === "ISBLOCKED"
    ) {
      await this.userRelationRepo.handleMutualUnblock(
        relation,
        otherWayRelation
      );
      return;
    }
    return new ServerError("invalid relation record");
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

  async blackList(userId: UserId) {
    const blackList = await this.userRelationRepo.getBlackList(userId);

    return blackList;
  }

  async closeFriendList(userId: UserId) {
    return await this.userRelationRepo.getCloseFriendsList(userId);
  }

  async getUserInfo(
    userId: UserId,
    targetUserId: UserId
  ): Promise<User | BadRequestError | NotFoundError | string> {
    const relation = await this.getRelationStatus(userId, targetUserId);

    if (relation instanceof HttpError) return relation;

    const targetUser = await this.userService.getUserInfo(targetUserId);

    if (isBlockRelation(relation)) {
      // TODO:: restrict some information for user block
      return "you BLoock";
    }

    if (targetUser instanceof HttpError) return targetUser;

    return targetUser;
  }
}
