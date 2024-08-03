import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { UserId } from "../../user/model/user-id";
import { UUID } from "../../../data/UUID";
import {
  UserRelationStatus,
  UserRelationStatusRecord,
} from "../model/userRelation";
import { UserEntity } from "../../user/entity/user.entity";

@Entity()
export class UserRelationEntity {
  @PrimaryColumn()
  userId!: UserId;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user!: UserEntity;

  @PrimaryColumn()
  targetUserId!: UserId;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  targetUser!: UserEntity;

  @Column({ nullable: false })
  status!: UserRelationStatusRecord;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: number;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: number;
}
