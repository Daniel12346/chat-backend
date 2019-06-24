import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  BaseEntity,
  JoinColumn,
  ManyToMany
  //ManyToOne
} from "typeorm";
import { User } from "./User";
//import { Channel } from "./Channel";
@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToMany(() => User, { cascade: true })
  @JoinColumn()
  from: User;

  @ManyToMany(() => User, { cascade: true })
  @JoinColumn()
  to: User;
  //TODO: | Group

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column()
  content: string;

  /*
  @ManyToOne(() => Channel)
  channel: Channel;*/
}
