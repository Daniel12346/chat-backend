import "reflect-metadata";
import { GraphQLServer } from "graphql-yoga";
import readSchemas from "./src/utils/readSchema";
import { createConnection } from "typeorm";
import * as session from "express-session";
//import { ApolloServer } from "apollo-server";
import { ITypeDefinitions } from "graphql-tools";
import mutationResolvers from "./src/resolvers/mutations";
import queryResolvers from "./src/resolvers/query";
import isAuth from "./src/middleware/auth";
import { Request } from "express";
//import * as cors from "cors";
import * as dotenv from "dotenv";

dotenv.config();

const allResolvers = {
  ...mutationResolvers,
  ...queryResolvers
};
const createServer = () => {
  const allSchemas = readSchemas(
    "./src/schemas/user.gql",
    "./src/schemas/mutation.gql",
    "./src/schemas/query.gql"
  );
  return new GraphQLServer({
    typeDefs: allSchemas as ITypeDefinitions,
    resolvers: allResolvers,
    context: ({ request }: { [key: string]: Request }) => ({
      req: request,
      session: request.session
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
  /* server.express.use(
    cors({ credentials: true, origin: true, methods: ["POST", "OPTIONS"] })
  );*/
  server.express.use(
    session({
      secret: "karnivool125",
      cookie: { maxAge: 60000, secure: false },
      resave: false,
      saveUninitialized: true
    })
  );
  server.express.use(isAuth);
  server.start({
    port: process.env.PORT || 4000,
    cors: {
      methods: ["POST", "GET"],
      credentials: true,
      //TODO: set origin to frontend url
      origin: ["*"]
    }
  });
};

export default startServer;
