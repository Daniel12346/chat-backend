import "reflect-metadata";
import readSchemas from "./src/utils/readSchema";
import { createConnection } from "typeorm";
import * as session from "express-session";
import { ApolloServer, gql } from "apollo-server-express";
import mutationResolvers from "./src/resolvers/mutations";
import queryResolvers from "./src/resolvers/query";
import isAuth from "./src/middleware/auth";
import * as express from "express";
import { Request } from "express";
import * as cors from "cors";
import * as dotenv from "dotenv";

dotenv.config();

//setting up the middleware
const app = express();
app.use(cors({ origin: "*" }));
app.use(
  session({
    secret: "karnivool125",
    cookie: { maxAge: 60000, secure: false },
    resave: false,
    saveUninitialized: true
  })
);
app.use(isAuth);

const resolvers = {
  ...mutationResolvers,
  ...queryResolvers
};
const createServer = () => {
  const allSchemas = readSchemas(
    "./src/schemas/user.gql",
    "./src/schemas/mutation.gql",
    "./src/schemas/query.gql"
  );
  const typeDefs = gql(allSchemas.join());
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }: { [key: string]: Request }) => ({
      req: req,
      session: req.session
    })
  });
};

const startServer = async () => {
  const server = createServer();
  //the settings are here because typeorm could not read the databases' names from the ormconfig
  const connection = await createConnection(
    process.env.NODE_ENV === "development"
      ? {
          name: "local",
          host: "localhost",
          type: "postgres",
          port: 5432,
          username: "test",
          password: "test",
          database: "test",
          logging: false,
          entities: ["src/entity/**/*.ts"],
          migrations: ["src/migration/**/*.ts"],
          subscribers: ["src/subscriber/**/*.ts"],
          cli: {
            entitiesDir: "src/entity",
            migrationsDir: "src/migration",
            subscribersDir: "src/subscriber"
          }
        }
      : {
          name: "heroku",
          url: process.env.DATABASE_URL,
          type: "postgres",

          logging: false,
          entities: ["src/entity/**/*.ts"],
          migrations: ["src/migration/**/*.ts"],
          subscribers: ["src/subscriber/**/*.ts"],
          cli: {
            entitiesDir: "src/entity",
            migrationsDir: "src/migration",
            subscribersDir: "src/subscriber"
          }
        }
  );
  //TODO: remove this line in production (?)
  await connection.synchronize();
  //TOOD: custom store (redis)
  await server.applyMiddleware({ app, path: "/graphql" });
  app.listen(4000);
};

export default startServer;
