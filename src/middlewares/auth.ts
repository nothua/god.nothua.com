import type { NextFunction, Request, Response } from "express";
import { getServiceLocator } from "../utils";
import type UserRepository from "../repositories/UserRepository";

export async function authMiddleware(
      req: Request,
      res: Response,
      next: NextFunction
) {
      let user = req.cookies.userId;

      if (!user) {
            return res.redirect("/login");
      }

      try {
            user = await getServiceLocator()
                  .resolve<UserRepository>("UserRepository")
                  .get(user);
      } catch (ex) {
            user = null;
      }

      if (!user) {
            res.clearCookie("userId");
            return res.redirect("/login");
      }

      next();
}
