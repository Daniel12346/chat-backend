import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BaseEntity,
  ManyToMany,
  JoinTable
} from "typeorm";

import { hashPassword } from "../utils/passwordService";
import { Message } from "./Message";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @ManyToMany(() => Message, { cascade: true })
  @JoinTable()
  messages: Message[];

  @BeforeInsert()
  async hash() {
    this.password = await hashPassword(this.password);
  }
}
