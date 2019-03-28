import { User } from "../entity/User";
import * as yup from "yup";
import { comparePassword } from "../utils/passwordService";
import { Request } from "express";

const userInputSchema = yup.object().shape({
  firstName: yup.string().min(1),
  lastName: yup.string().min(1),
  email: yup.string().email(),
  password: yup.string().min(8)
});

interface UserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface Context {
  req: Request;
  session?;
}

//this is a placeholder return used because graphql does not allow returning void
interface MutationResult {
  success: boolean;
}

//TODO: refactor errors
//TODO: move all business logic to another directory
const createUser = async (_, userInput: UserInput): Promise<User> => {
  try {
    await userInputSchema.validate({
      userInput
    });
  } catch (e) {
    //TODO: yup error formatting
    throw new Error(e);
  }

  const usedEmail = await User.findOne({ where: { email: userInput.email } });
  if (usedEmail) {
    throw new Error("Email already in use");
  }

  const user = User.create(userInput);

  await user.save();
  return user;
};

const deleteUser = async (_, { id }): Promise<MutationResult> => {
  const user = await User.findOne({ where: { id } });
  if (!user) {
    throw new Error("User not found");
  }
  User.delete(user);
  return {
    success: true
  };
};

const logIn = async (_, { email, password }, { req, session }: Context) => {
  //throwing an error if the user id is already set on req.session
  if (session.userId) {
    throw new Error("A user is already logged in");
  }
  const user = await User.findOne({ where: { email } });

  //throwing an error if a user with the given email is not found
  if (!user) {
    throw new Error("Email not found");
  }
  const hashed = user.password;
  //checking if the passwords match (using bcrypt)
  const match = await comparePassword(password, hashed);
  if (!match) {
    throw new Error("Incorrect password");
  }

  req.session.userId = user.id;

  //TOOD: decide if it needs to return the user
  return user;
};

const logOut = async (_, __, { session }) => {
  if (!session.userId) {
    throw new Error("No user is logged in");
  }
  if (session) {
    try {
      //logging the user out by destroying the session
      await session.destroy();
    } catch (e) {
      throw new Error(e);
    }
  }
  return {
    success: true
  };
};

const mutationResolvers = {
  Mutation: {
    createUser,
    deleteUser,
    logIn,
    logOut
  }
};

export default mutationResolvers;
