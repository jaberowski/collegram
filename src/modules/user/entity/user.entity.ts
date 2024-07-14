import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  ResumeToken,
  UpdateDateColumn,
} from "typeorm";
import { UserId } from "../model/user-id";
import { Username } from "../model/username";
import { HashedPassword, Password } from "../model/password";
import { Email } from "../model/email";
import { NameString } from "../model/name";
import { ResetTokenEntity } from "./resetToken.entity";
import { PostEntity } from "../../post/entity/post.entity";
import { Post } from "../../post/model/post";
import { LikeEntity } from "../../post/entity/like.entity";
import { BookmarkEntity } from "../../post/entity/bookmark.entity";

@Entity("users")
export class UserEntity {
  @PrimaryColumn("uuid")
  @Index()
  id!: UserId;

  @Column({ nullable: true })
  firstname!: NameString;

  @Column({ nullable: true })
  lastname!: NameString;

  @Column({ unique: true, length: 64 })
  username!: Username;

  @Column()
  hashedPassword!: HashedPassword;

  @Column({ unique: true })
  email!: Email;

  @Column({ default: false })
  isPrivate!: boolean;

  @Column({ nullable: true, length: 255 })
  bio!: string;

  @Column({
    nullable: true,
  })
  avatarName!: string;

  @OneToMany(() => PostEntity, (PostEntity) => PostEntity.user, {
    onDelete: "CASCADE",
  })
  posts!: Post[];

  @OneToMany(() => LikeEntity, (LikeEntity) => LikeEntity.user, {
    eager: false,
  })
  likes!: LikeEntity[];

  @OneToMany(() => BookmarkEntity, (bookmarkEntity) => bookmarkEntity.user, {
    eager: false,
  })
  bookmarks!: BookmarkEntity[];

  @OneToOne(() => ResetTokenEntity, { nullable: true })
  @JoinColumn()
  resetToken!: ResetTokenEntity;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: number;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: number;
}
