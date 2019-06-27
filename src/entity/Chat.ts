import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  BaseEntity,
  OneToMany,
  CreateDateColumn,
  ManyToMany,
  JoinTable
} from "typeorm";
import { User } from "./User";
import { Message } from "./Message";

@Entity()
export class Chat extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  //TODO
  @ManyToMany(type => User, user => user.chats)
  @JoinTable()
  users: User[];

  @OneToMany(type => Message, message => message.chat, { cascade: true })
  messages: Message[];

  //TODO: learn sql
  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;
}
