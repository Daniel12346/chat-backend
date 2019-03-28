import { Request, Response, NextFunction } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
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
