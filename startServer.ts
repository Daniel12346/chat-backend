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

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
  })
);
app.use(
  session({
    secret: "karnivool125",
    cookie: { maxAge: 60000, secure: false },
    resave: false,
    saveUninitialized: true
  })
);
app.use(isAuth);

const allSchemas = readSchemas(
  "./src/schemas/user.gql",
  "./src/schemas/mutation.gql",
  "./src/schemas/query.gql"
);
const typeDefs = gql(allSchemas.join());
const resolvers = {
  ...mutationResolvers,
  ...queryResolvers
};
const createServer = () => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    playground: true,
    introspection: true,

    context: ({ req }: { [key: string]: Request }) => ({
      req: req,
      session: req.session
    })
  });
};

const startServer = async () => {
  const port = process.env.PORT || 4000;

  const server = createServer();

  const conn = await getConnectionOptions(
    process.env.NODE_ENV === "development" ? "default" : "heroku"
  );

  const connection = await createConnection(conn);
  console.log(connection);
  //TODO: remove this line in production (?)
  await connection.synchronize();
  //TOOD: custom store (redis)
  await server.applyMiddleware({ app });
  app.listen(port, () => {
    console.log(`Listening to port: ${port}`);
  });
};

export default startServer;
