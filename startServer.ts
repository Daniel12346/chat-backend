import "reflect-metadata";

import { GraphQLServer } from "graphql-yoga";
import readSchemas from "./src/utils/readSchema";
import { createConnection } from "typeorm";
import * as session from "express-session";
import { ApolloServer } from "apollo-server";
import { ITypeDefinitions } from "graphql-tools";
import mutationResolvers from "./src/resolvers/mutations";
import queryResolvers from "./src/resolvers/query";
import isAuth from "./src/middleware/auth";
import { Request } from "express";
import * as cors from "cors";

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
  //all the connection settings are in ormconfig.json
  const connection = await createConnection();
  //TODO: remove this line in production (?)
  await connection.synchronize();
  //TOOD: custom store (redis)
  server.express.use(cors({ credentials: true, origin: true }));
  server.express.use(
    session({
      secret: "karnivool125",
      cookie: { maxAge: 60000, secure: false },
      resave: false,
      saveUninitialized: true
    })
  );
  server.express.use(isAuth);
  server.express.use(cors());
  server.start({
    cors: {
      credentials: true,
      //TODO: set origin to frontend url
      origin: ["*"]
    }
  });
};

export default startServer;
