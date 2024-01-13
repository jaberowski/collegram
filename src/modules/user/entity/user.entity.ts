import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserId } from "../model/user-id";
import { Username } from "../model/username";
import { Password } from "../model/password";
import { Email } from "../model/email";
import { NameString } from "../model/name";
import { ResetTokenEntity } from "./resetToken.entity";

@Entity("users")
export class UserEntity {
  @PrimaryColumn("uuid")
  id!: UserId;

  @Column({ nullable: true })
  firstname!: NameString;

  @Column({ nullable: true })
  lastname!: NameString;

  @Column({ unique: true, length: 64 })
  username!: Username;

  @Column()
  password!: Password;

  @Column({ unique: true })
  email!: Email;

  @Column({ default: false })
  isPrivate!: boolean;

  @Column({ nullable: true, length: 255 })
  bio!: string;

  @Column({ nullable: true })
  profileUrl!: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: number;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: number;
}
