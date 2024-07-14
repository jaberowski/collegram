import {
  Column,
  CreateDateColumn,
  Entity,
  IntegerType,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { UUID } from "../../../data/UUID";
import { PostEntity } from "./post.entity";
import { UserEntity } from "../../user/entity/user.entity";
import { UserId } from "../../user/model/user-id";
import { PostId } from "../model/postId";

@Entity()
@Unique(["postId", "userId"])
export class LikeEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: UUID;

  @Column()
  postId!: PostId;

  @ManyToOne(() => PostEntity, (PostEntity) => PostEntity.likes)
  post!: PostEntity;

  @Column()
  userId!: UserId;

  @ManyToOne(() => UserEntity, (UserEntity) => UserEntity.likes)
  user!: UserEntity;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: number;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: number;
}
