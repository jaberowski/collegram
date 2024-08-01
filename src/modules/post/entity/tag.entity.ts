import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from "typeorm";
import { UUID } from "crypto";
import { UserId } from "../../user/model/user-id";
import { PostId } from "../model/postId";
import { UserEntity } from "../../user/entity/user.entity";
import { PostTitle } from "../model/postTitle";
import { PostDescription } from "../model/postDescription";
import { Tag, TagId, TagString } from "../model/tag";
import { PostEntity } from "./post.entity";

@Entity("tags")
export class TagEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: TagId;

  @Column({ unique: true })
  value!: TagString;

  @ManyToMany(() => PostEntity, (PostEntity) => PostEntity.tags)
  @JoinTable()
  posts!: PostEntity[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: number;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: number;
}
