import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserId } from "../../user/model/user-id";
import { UUID } from "../../../data/UUID";
import { UserRelationStatus } from "../model/userRelation";
import { UserEntity } from "../../user/entity/user.entity";

@Entity()
export class UserRelationEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: UserId;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user!: UserEntity;

  @Column()
  targetUserId!: UserId;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  targetUser!: UserEntity;

  @Column({ nullable: false })
  status!: UserRelationStatus;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: number;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: number;
}
