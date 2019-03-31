"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../entity/User");
const me = (_, __, { req, session }) => {
    if (!req.isAuth) {
        throw new Error("Not authenticated");
    }
    return User_1.User.findOne({ where: { id: session.userId } });
};
const user = (_, { id }, { req, session }) => {
    return User_1.User.findOne({ where: { id } });
};
const queryResolvers = {
    Query: {
        me,
        user
    }
};
exports.default = queryResolvers;
//# sourceMappingURL=query.js.map