import { User } from "../entity/User";
import { Message } from "../entity/Message";

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
    return Message.find();
  } catch (e) {
    throw new Error(e);
  }
};

const queryResolvers = {
  Query: {
    me,
    user,
    users,
    messages
  }
};

export default queryResolvers;
