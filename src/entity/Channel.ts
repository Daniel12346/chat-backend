import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  BaseEntity,
  OneToOne,
  JoinColumn,
  OneToMany
} from "typeorm";
import { User } from "./User";
import { Message } from "./Message";

@Entity()
export class Channel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  from: User;

  @OneToOne(() => User)
  @JoinColumn()
  to: User;
  //TODO: | Group

  @Column()
  sentAt: Date;

  //TODO: learn sql
  @OneToMany(() => Message, message => message.from)
  messages: Message[];
}
