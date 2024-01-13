import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from "typeorm";
import { UserId } from "../model/user-id";
import { Username } from "../model/username";
import { Password } from "../model/password";
import { Email } from "../model/email";
import { NameString } from "../model/name";
import { UserEntity } from "./user.entity";
import { UUID } from "crypto";

interface ResetTokenObject {
  token: UUID;
  userId: UserId;
  expireDate: Date;
}

@Entity("resetTokens")
export class ResetTokenEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: UserId;

  @Column()
  expireDate!: Date;

  @Column()
  token!: UUID;
}
