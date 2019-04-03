import { User } from "../entity/User";

const me = (_, __, { req, session }) => {
  if (!req.isAuth) {
    throw new Error("Not authenticated");
  }
  return User.findOne({ where: { id: session.userId } });
};

//finds a single user by id
const user = (_, { id }: { [key: string]: string }, { req, session }) => {
  return User.findOne({ where: { id } });
};

//finds all users
const users = async () => {
  return User.find();
};
const queryResolvers = {
  Query: {
    me,
    user,
    users
  }
};

export default queryResolvers;
