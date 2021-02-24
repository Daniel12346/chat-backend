import { User } from "../@types/express/entity/User";
import * as yup from "yup";
import { comparePasswords } from "../utils/passwordService";
import { isDev } from "../utils";
import { UserInputError } from "apollo-server-core";
import jwt from "jsonwebtoken";

import { Message } from "../@types/express/entity/Message";
import pubsub, { MESSAGE_CREATED } from "../pubsub";
import { Chat } from "../@types/express/entity/Chat";

//TODO: error handling, move input validation to frontend, generate types

//TODO: FIX INPUTS
const userInputSchema = yup.object().shape({
  firstName: yup.string().min(1),
  lastName: yup.string().min(1),
  email: yup.string().email(),
  password: yup.string().min(8),
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
  req: Express.Request;
}

interface UserInput {
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

//TODO: refactor errors
const createUser = async (_, input: UserInput): Promise<User> => {
  try {
    await userInputSchema.validate({
      input,
    });
  } catch (e) {
    //TODO: yup error formatting
    throw new UserInputError(e);
  }

  const usedEmail = await User.findOne({ where: { email: input.email } });
  if (usedEmail) {
    throw new Error("Email already in use");
  }

  const user = new User();
  user.email = input.email;
  user.password = input.password;
  user.firstName = input.firstName;
  user.lastName = input.lastName;
  user.messages = [];
  user.chats = [];
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
    success: true,
  };
};

const createChat = async (_, { userId }, { req }): Promise<Chat> => {
  try {
    //the receiver
    const user = await User.findOne({ where: { id: userId } });
    //the sender (the user that's logged in) TODO: req.userId
    const me = (await User.findOne({ where: { id: req.id } }));
    if (!me || !user) {
      throw new Error();
    }
    const chat = new Chat();
    chat.name = null;
    //only group chats should have chat names
    chat.users = [user, me];
    chat.messages = [];
    const createdChat = await chat.save();
    return createdChat;
  } catch (e) {
    console.log("createMesage error", e);
  }
};

const createMessage = async (
  _,
  { chatId, content }, { req }
): Promise<Message> => {
  //TODO: front end validation
  try {
    //the sender (the user that's logged in) 
    const chat = await Chat.findOne({
      where: { id: chatId },
    });
    const from = await User.findOne({ where: { id: req.id } });
    if (!chat) {
      throw new Error("chat not found");
    }
    const message = new Message();
    message.content = content;
    message.chat = chat;
    message.from = from;
    const createdMessage = await message.save();
    //publishing the message for the messageCreated subscription
    await pubsub.publish(MESSAGE_CREATED, { messageCreated: createdMessage });

    return createdMessage;
  } catch (e) {
    console.log("createMesage error", e);
  }
};

const logIn = async (_, { email, password }, { req }: Context) => {
  //throwing an error if the user id is already set on req
  if ((req as any).userId) {
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
    expiresIn: "1d",
  });
  //TOOD: decide if it needs to return the user
  return token;
};

//TODO: logging out (jwt blacklist)

const mutationResolvers = {
  Mutation: {
    createUser,
    deleteUser,
    logIn,
    createMessage,
    createChat,
  },
};

export default mutationResolvers;
