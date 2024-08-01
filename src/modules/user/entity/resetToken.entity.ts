import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserId } from "../model/user-id";
import { UserEntity } from "./user.entity";
import { UUID } from "crypto";
import { User } from "../model/user";

interface ResetTokenObject {
  token: UUID;
  userId: UserId;
  expireDate: Date;
}

@Entity()
export class ResetTokenEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => UserEntity, (UserEntity) => UserEntity.resetToken)
  user!: User;

  @Column()
  userId!: UserId;

  @Column()
  expireDate!: Date;

  @Column()
  token!: UUID;
}
