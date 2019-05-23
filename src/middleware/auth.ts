import { Request, Response, NextFunction } from "express";
import { AuthenticationError } from "apollo-server-core";
import { isDev } from "../utils";

export default (req: Request, res: Response, next: NextFunction) => {
  //TODO: error codes and other fixes
  if (!req.session) {
    req.isAuth = false;
    if (isDev) {
      throw new AuthenticationError("Session not found");
    } else {
      req.isAuth = false;
      next();
    }
  }
  if (!req.session.userId) {
    req.isAuth = false;
    return next();
  }
  req.isAuth = true;
  next();
};
