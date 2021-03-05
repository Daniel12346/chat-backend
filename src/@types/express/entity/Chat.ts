import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  BaseEntity,
  OneToMany,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
  BeforeInsert,
} from "typeorm";
import { User } from "./User";
import { Message } from "./Message";

@Entity()
export class Chat extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToMany(type => User, user => user.chats)
  @JoinTable()
  users: User[];

  @OneToMany(type => Message, message => message.chat, { cascade: true })
  messages: Message[];

  //TODO: learn sql
  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @BeforeInsert()
  async setUp() {
    this.messages = [];
  }
}
