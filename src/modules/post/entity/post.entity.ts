import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

import { UserId } from "../../user/model/user-id";
import { PostId } from "../model/postId";
import { UserEntity } from "../../user/entity/user.entity";
import { PostTitle } from "../model/postTitle";
import { PostDescription } from "../model/postDescription";
import { Tag } from "../model/tag";
import { TagEntity } from "./tag.entity";
import { User } from "../../user/model/user";
import { LikeEntity } from "./like.entity";
import { BookmarkEntity } from "./bookmark.entity";

@Entity("posts")
export class PostEntity {
  @PrimaryColumn("uuid")
  @Index()
  id!: PostId;

  @ManyToOne(() => UserEntity, (UserEntity) => UserEntity.posts)
  @JoinColumn()
  user!: User;

  @Column({ nullable: false })
  userId!: UserId;

  @Column()
  title!: PostTitle;

  @Column()
  description!: PostDescription;

  @Column({ type: "boolean", default: false })
  isCloseFriendsOnly!: boolean;

  @ManyToMany(() => TagEntity, (TagEntity) => TagEntity.posts, {
    cascade: true,
    nullable: true,
    onDelete: "CASCADE",
  })
  tags!: Tag[];

  @OneToMany(() => LikeEntity, (likeEntity) => likeEntity.post)
  likes!: LikeEntity[];

  @Column({ default: 0 })
  likesCount!: number;

  @OneToMany(() => BookmarkEntity, (bookmarkEntity) => bookmarkEntity.post)
  bookmarks!: BookmarkEntity[];

  @Column({ default: 0 })
  bookmarksCount!: number;

  @Column({ type: "simple-array" })
  fileNames!: string[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: number;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: number;
}
