import "reflect-metadata";
import readSchemas from "./src/utils/readSchema";
import { createConnection, getConnectionOptions } from "typeorm";
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

  const conn = await getConnectionOptions(
    process.env.NODE_ENV === "development" ? "test" : "heroku"
  );
  console.log(conn);

  const connection = await createConnection("test");
  //TODO: remove this line in production (?)
  await connection.synchronize();
  //TOOD: custom store (redis)
  await server.applyMiddleware({ app, path: "/graphql" });
  app.listen(process.env.PORT || 4000);
};

export default startServer;
