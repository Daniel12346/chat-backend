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
//import * as PostgresConnectionStringParser from "pg-connection-string";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

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

//the config is here because typeorm couldn't find the names of the databases in ormconfig.js
const ormConfig: PostgresConnectionOptions[] = [
  {
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
  },
  {
    url: process.env.DATABASE_URL,
    ssl: true,
    type: "postgres"
  }
];
/*
if (process.env.DATABASE_URL) {
  const {
    host,
    password,
    user: username,
    port,
    database
  } = PostgresConnectionStringParser.parse(
    "postgres://mtxrbrvwlouigd:64c2e8e865ff26261f63be03142a8a7d5b98858811f810bd25dec86b8a289d5b@ec2-54-228-252-67.eu-west-1.compute.amazonaws.com:5432/dk0m3gfqksqdh"
  );
  ormConfig[1] = { ...ormConfig[1], host, password, username, port, database };
  console.log(ormConfig[1]);
}*/

const startServer = async () => {
  const port = process.env.PORT || 4000;

  const server = createServer();
  const conn = await createConnection(
    process.env.NODE_ENV === "development"
      ? //local database
        (ormConfig[1] as PostgresConnectionOptions)
      : //heroku database
        (ormConfig[1] as PostgresConnectionOptions)
  );

  ormConfig && console.log(conn);

  //TOOD: custom store (redis)
  await server.applyMiddleware({ app });
  app.listen(port, () => {
    console.log(`Listening to port: ${port}`);
  });
};

export default startServer;
