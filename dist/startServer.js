"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const readSchema_1 = require("./src/utils/readSchema");
const typeorm_1 = require("typeorm");
const session = require("express-session");
const apollo_server_express_1 = require("apollo-server-express");
const mutations_1 = require("./src/resolvers/mutations");
const query_1 = require("./src/resolvers/query");
const auth_1 = require("./src/middleware/auth");
const express_1 = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
//setting up the middleware
const app = express_1.default();
app.use(cors());
app.use(session({
    secret: "karnivool125",
    cookie: { maxAge: 60000, secure: false },
    resave: false,
    saveUninitialized: true
}));
app.use(auth_1.default);
const resolvers = {
    ...mutations_1.default,
    ...query_1.default
};
const createServer = () => {
    const allSchemas = readSchema_1.default("./src/schemas/user.gql", "./src/schemas/mutation.gql", "./src/schemas/query.gql");
    const typeDefs = apollo_server_express_1.gql(allSchemas.join());
    return new apollo_server_express_1.ApolloServer({
        typeDefs,
        resolvers,
        context: ({ request }) => ({
            req: request,
            session: request.session
        })
    });
};
const startServer = async () => {
    const server = createServer();
    //the settings are here because typeorm could not read the databases' names from the ormconfig
    const connection = await typeorm_1.createConnection(process.env.NODE_ENV === "development"
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
        });
    //TODO: remove this line in production (?)
    await connection.synchronize();
    //TOOD: custom store (redis)
    await server.applyMiddleware({ app, path: "/graphql" });
};
exports.default = startServer;
//# sourceMappingURL=startServer.js.map