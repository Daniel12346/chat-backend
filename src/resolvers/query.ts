import { User } from "../entity/User";

const me = (_, __, { req, session }) => {
  if (!req.isAuth) {
    throw new Error("Not authenticated");
  }
  return User.findOne({ where: { id: session.userId } });
};

const user = (_, { id }: { [key: string]: string }, { req, session }) => {
  return User.findOne({ where: { id } });
};

const queryResolvers = {
  Query: {
    me,
    user
  }
};

export default queryResolvers;
