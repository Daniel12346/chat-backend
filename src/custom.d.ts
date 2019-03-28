declare namespace Express {
  export interface Request {
    isAuth?: boolean;
    session?: Express.Session;
  }
}
