import pubsub, { MESSAGE_CREATED } from "../pubsub";

const messageCreated = {
  subscribe: () => pubsub.asyncIterator(MESSAGE_CREATED)
};

const subscriptionResolvers = {
  Subscription: {
    messageCreated
  }
};
export default subscriptionResolvers;
