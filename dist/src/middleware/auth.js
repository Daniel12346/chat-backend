"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (req, res, next) => {
    //TODO: error codes and other fixes
    if (!req.session) {
        req.isAuth = false;
        throw new Error("Session not found");
    }
    if (!req.session.userId) {
        req.isAuth = false;
        return next();
    }
    req.isAuth = true;
    next();
};
//# sourceMappingURL=auth.js.map