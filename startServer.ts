import "reflect-metadata";
import { GraphQLUpload, graphqlUploadExpress } from "graphql-upload"
import readSchemas from "./src/utils/readSchema";
import { createConnection } from "typeorm";
import { ApolloServer, gql } from "apollo-server-express";
import mutationResolvers from "./src/resolvers/mutation";
import queryResolvers from "./src/resolvers/query";
import subscriptionResolvers from "./src/resolvers/subscription";
import isAuth from "./src/middleware/auth";
import express, { Request } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import http from "http";
import { User } from "./src/@types/express/entity/User";
import { Message } from "./src/@types/express/entity/Message";
import { Chat } from "./src/@types/express/entity/Chat";
dotenv.config();

//setting up the middleware
const app = express();
app.use(cors({ credentials: true, origin: "http://localhost:3000" }) as any);
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 20 }) as any);
app.use(isAuth);

const allSchemas = readSchemas(
  "./src/schemas/user.gql",
  "./src/schemas/chat.gql",
  "./src/schemas/mutation.gql",
  "./src/schemas/query.gql",
  "./src/schemas/message.gql",
  "./src/schemas/subscription.gql"
);
const typeDefs = gql(allSchemas.join());
const resolvers = {
  Upload: GraphQLUpload,
  ...mutationResolvers,
  ...queryResolvers,
  ...subscriptionResolvers
};
const createServer = () => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    playground: true,
    introspection: true,
    uploads: false,
    context: ({ req }: { [key: string]: Request }) => ({
      req,
    }),
  });
};

//the config is here because typeorm couldn't find the names of the databases in ormconfig.js
const ormConfig: PostgresConnectionOptions[] = [
  {
    host: "localhost",
    type: "postgres",
    port: 5400,
    username: "test",
    password: "test",
    database: "test",
    logging: false,
    entities: [User, Message, Chat],
    migrations: ["src/migration/**/*.ts"],
    subscribers: ["src/subscriber/**/*.ts"],
    synchronize: true,
    //dropSchema: true,
    cli: {
      entitiesDir: "src/entity",
      migrationsDir: "src/migration",
      subscribersDir: "src/subscriber",
    },
  },
  {
    url: process.env.DATABASE_URL,
    ssl: true,
    type: "postgres",
    synchronize: true,
    //TODO: test
    entities: [User, Message, Chat],
    migrations: ["src/migration/**/*.ts"],
    subscribers: ["src/subscriber/**/*.ts"],
    cli: {
      entitiesDir: "src/entity",
      migrationsDir: "src/migration",
      subscribersDir: "src/subscriber",
    },
  },
];

const startServer = async () => {
  const port = process.env.PORT || 8080;

  const server = createServer();
  await createConnection(
    ormConfig[1]
    /*process.env.NODE_ENV === "development"
      ? //local database
        (ormConfig[0] as PostgresConnectionOptions)
      : //heroku database
        (ormConfig[1] as PostgresConnectionOptions)*/
  );


  const httpServer = http.createServer(app);

  //TOOD: custom store (redis)

  //setting cors to false so apollo server does not override the cors settings
  server.applyMiddleware({ app, cors: false });
  console.log(`PORT: ${process.env.PORT}`);
  server.installSubscriptionHandlers(httpServer);
  httpServer.listen(
    port /*() => {
    console.log(`Listening to port: ${port}${server.graphqlPath}`);
    console.log(
      `Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`
    );
  }*/
  );
};

export default startServer;
