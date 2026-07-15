import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && process.env.JWT_SECRET) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(401);
      (req as any).user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

export const authenticateOptionalJWT = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && process.env.JWT_SECRET) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err && user) (req as any).user = user;
      next();
    });
  } else {
    (req as any).user = null;
    next();
  }
};
