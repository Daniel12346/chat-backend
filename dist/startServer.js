"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const graphql_yoga_1 = require("graphql-yoga");
const readSchema_1 = require("./src/utils/readSchema");
const typeorm_1 = require("typeorm");
const session = require("express-session");
const mutations_1 = require("./src/resolvers/mutations");
const query_1 = require("./src/resolvers/query");
const auth_1 = require("./src/middleware/auth");
const cors = require("cors");
const allResolvers = {
    ...mutations_1.default,
    ...query_1.default
};
const createServer = () => {
    const allSchemas = readSchema_1.default("./src/schemas/user.gql", "./src/schemas/mutation.gql", "./src/schemas/query.gql");
    return new graphql_yoga_1.GraphQLServer({
        typeDefs: allSchemas,
        resolvers: allResolvers,
        context: ({ request }) => ({
            req: request,
            session: request.session
        })
    });
};
const startServer = async () => {
    const server = createServer();
    //all the connection settings are in ormconfig.json
    const connection = await typeorm_1.createConnection();
    //TODO: remove this line in production (?)
    await connection.synchronize();
    //TOOD: custom store (redis)
    server.express.use(cors({ credentials: true, origin: true }));
    server.express.use(session({
        secret: "karnivool125",
        cookie: { maxAge: 60000, secure: false },
        resave: false,
        saveUninitialized: true
    }));
    server.express.use(auth_1.default);
    server.express.use(cors());
    server.start({
        cors: {
            credentials: true,
            //TODO: set origin to frontend url
            origin: ["*"]
        }
    });
};
exports.default = startServer;
//# sourceMappingURL=startServer.js.map