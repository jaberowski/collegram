import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserId } from "../../user/model/user-id";
import { UUID } from "../../../data/UUID";
import { UserRelationStatus } from "../model/userRelation";
import { UserEntity } from "../../user/entity/user.entity";

@Entity("userRelations")
export class UserRelationEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: UserId;

  @ManyToOne(() => UserEntity)
  @JoinTable()
  user!: UserEntity;

  @Column()
  targetUserId!: UserId;

  @ManyToOne(() => UserEntity)
  @JoinTable()
  targetUser!: UserEntity;

  @Column({ nullable: false })
  status!: UserRelationStatus;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: number;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: number;
}
