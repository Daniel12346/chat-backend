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
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
//setting up the middleware
const app = express();
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
}));
app.use(session({
    secret: "karnivool125",
    cookie: { maxAge: 60000, secure: false },
    resave: false,
    saveUninitialized: true
}));
app.use(auth_1.default);
const allSchemas = readSchema_1.default("./src/schemas/user.gql", "./src/schemas/mutation.gql", "./src/schemas/query.gql");
const typeDefs = apollo_server_express_1.gql(allSchemas.join());
const resolvers = {
    ...mutations_1.default,
    ...query_1.default
};
const createServer = () => {
    return new apollo_server_express_1.ApolloServer({
        typeDefs,
        resolvers,
        playground: true,
        introspection: true,
        context: ({ req }) => ({
            req: req,
            session: req.session
        })
    });
};
const startServer = async () => {
    const port = process.env.PORT || 4000;
    const server = createServer();
    const conn = await typeorm_1.getConnectionOptions(process.env.NODE_ENV === "development" ? "default" : "heroku");
    const connection = await typeorm_1.createConnection(conn);
    //TODO: remove this line in production (?)
    await connection.synchronize();
    //TOOD: custom store (redis)
    await server.applyMiddleware({ app, path: "/graphql" });
    app.listen(port, () => {
        console.log(`Listening to port: ${port}`);
    });
};
exports.default = startServer;
//# sourceMappingURL=startServer.js.map