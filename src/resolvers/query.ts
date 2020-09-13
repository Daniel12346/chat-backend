import { User } from "../@types/express/entity/User";
import { Message } from "../@types/express/entity/Message";
import { Chat } from "../@types/express/entity/Chat";

const me = (_, __, { req }) => {
  if (!req.isAuth) {
    throw new Error("Not authenticated");
  }
  return User.findOne({ where: { id: req.userId } });
};

interface Context {
  req: Request;
}

//finds a single user by id
const user = (_, { id }: { [key: string]: string }, { req }: Context) => {
  return User.findOne({ where: { id } });
};

//finds all users
const users = async () => {
  return User.find();
};

const messages = async () => {
  try {
    const m = await Message.find({ relations: ["from", "chat"] });
    console.log(m);
    return m;
  } catch (e) {
    throw new Error(e);
  }
};
const chats = async () => {
  try {
    return await Chat.find({ relations: ["users", "messages"] });
  } catch (e) {
    throw new Error(e);
  }
};

const chat = async (_, { id }) => {
  try {
    return await Chat.findOne({ where: { id } });
  } catch (e) {
    throw new Error(e);
  }
};

const queryResolvers = {
  Query: {
    me,
    user,
    users,
    messages,
    chats,
    chat,
  },
};

export default queryResolvers;
