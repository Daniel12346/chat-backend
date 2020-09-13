import "reflect-metadata";
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

dotenv.config();

//setting up the middleware
const app = express();
app.use(cors() as any);

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
  ...mutationResolvers,
  ...queryResolvers,
  ...subscriptionResolvers,
};
const createServer = () => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    playground: true,
    introspection: true,
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
    entities: ["src/entity/**/*.ts"],
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
    entities: ["src/entity/**/*.ts"],
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
  const port = process.env.PORT || 4000;

  const server = createServer();
  await createConnection(
    process.env.NODE_ENV === "development"
      ? //local database
        (ormConfig[0] as PostgresConnectionOptions)
      : //heroku database
        (ormConfig[1] as PostgresConnectionOptions)
  );

  const httpServer = http.createServer(app);

  //TOOD: custom store (redis)

  //setting cors to false so apollo server does not override the cors settings
  server.applyMiddleware({ app, cors: false });

  server.installSubscriptionHandlers(httpServer);
  httpServer.listen(port, () => {
    console.log(`Listening to port: ${port}${server.graphqlPath}`);
    console.log(
      `Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`
    );
  });
};

export default startServer;
