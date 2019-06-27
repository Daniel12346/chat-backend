import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  BaseEntity,
  //ManyToMany,
  ManyToOne,
  JoinTable
  //ManyToOne
} from "typeorm";
import { User } from "./User";
import { Chat } from "./Chat";
@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  content: string;

  @ManyToOne(type => User, user => user.messages)
  @JoinTable()
  from: User;

  @ManyToOne(type => Chat, chat => chat.messages)
  @JoinTable()
  chat: Chat;
  //TODO: | Group

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
