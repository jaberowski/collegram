import { z } from "zod";
import { zodUUID } from "../../../data/UUID";
import { zodUserId } from "../../user/model/user-id";

export const userRelationDto = z.object({
  targetUserId: zodUserId,
});

export const userIdDto = z.object({
  userId: zodUserId,
});
