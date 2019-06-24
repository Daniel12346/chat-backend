import { User } from "../entity/User";
import * as yup from "yup";
import { comparePasswords } from "../utils/passwordService";
import { isDev } from "../utils";
import { UserInputError } from "apollo-server-core";
import jwt from "jsonwebtoken";
import { Request } from "express";
import { Message } from "../entity/Message";
import pubsub, { MESSAGE_CREATED } from "../pubsub";

//TODO: error handling, move input validation to frontend, generate types

//TODO: FIX INPUTS!
const userInputSchema = yup.object().shape({
  firstName: yup.string().min(1),
  lastName: yup.string().min(1),
  email: yup.string().email(),
  password: yup.string().min(8)
});

/*
interface UserInput {
  email: string;
  password: string;
}

interface MessageInput {
  receiverId: string;
  content: string;
}*/

//TODO: interface inputArg,...

//this is a placeholder return used because graphql does not allow returning void
interface MutationResult {
  success: boolean;
}

interface Context {
  req: Request;
}

//TODO: refactor errors
const createUser = async (_, input): Promise<User> => {
  try {
    await userInputSchema.validate({
      input
    });
  } catch (e) {
    //TODO: yup error formatting
    throw new UserInputError(e);
  }

  const usedEmail = await User.findOne({ where: { email: input.email } });
  if (usedEmail) {
    throw new Error("Email already in use");
  }

  const createdUser = User.create(input);

  await createdUser.save();
  return createdUser;
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

const createMessage = async (_, { receiverId, content }): Promise<Message> => {
  //TODO: front end validation

  /*if (!req.userId) {
    throw new AuthenticationError("Not logged in");
  }*/
  try {
    //the sender (the user that's logged in) TODO: req.userId
    const from = await User.findOne({ where: { id: receiverId } });
    //the receiver
    const to = await User.findOne({ where: { id: receiverId } });
    if (!from || !to) {
      throw new Error("from/to not found");
    }
    const message = new Message();
    message.from = from;
    message.to = to;
    message.content = content;

    const createdMessage = await message.save();
    console.log(createdMessage);
    //publishing the message for the messageCreated subscription
    await pubsub.publish(MESSAGE_CREATED, { messageCreated: createdMessage });

    return createdMessage;
  } catch (e) {
    console.log("createMesage error", e);
  }
};

const logIn = async (_, { email, password }, { req }: Context) => {
  //throwing an error if the user id is already set on req
  if (req.userId) {
    throw new Error("A user is already logged in");
  }
  const user = await User.findOne({ where: { email } });
  //throwing an error if a user with the given email is not found
  if (!user) {
    throw new Error(isDev ? "Incorrect email" : "Incorrect password or email");
  }
  const hashed = user.password;

  //checking if the passwords match (using bcrypt)
  const isMatching = await comparePasswords(password, hashed);
  if (!isMatching) {
    throw new Error(
      isDev ? "Incorrect password" : "Incorrect password or email"
    );
  }

  const token = jwt.sign({ userId: user.id }, process.env.SECRET, {
    expiresIn: "1d"
  });
  //TOOD: decide if it needs to return the user
  return token;
};

//TODO: logging out (jwt blacklist)
/*
const logOut = async (_, __, { req }) => {
  if (!req.userId) {
    throw new Error("No user is logged in");
  }

  try {
    //logging the user out by destroying the session
    await session.destroy();
  } catch (e) {
    throw new Error(e);
  }
  return {
    success: true
  };
};
*/

const mutationResolvers = {
  Mutation: {
    createUser,
    deleteUser,
    logIn,
    createMessage
  }
};

export default mutationResolvers;
