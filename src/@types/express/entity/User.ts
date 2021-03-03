import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BaseEntity,
  OneToMany,
  ManyToMany,
} from "typeorm";

import { hashPassword } from "../../../utils/passwordService";
import { Message } from "./Message";
import { Chat } from "./Chat";

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

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToMany((type) => Chat, (chat) => chat.users)
  chats: Chat[];

  @OneToMany(() => Message, (message) => message.from)
  messages: Message[];

  @BeforeInsert()
  async hash() {
    this.password = await hashPassword(this.password);
  }
}
