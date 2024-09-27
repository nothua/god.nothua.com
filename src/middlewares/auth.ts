import type { NextFunction, Request, Response } from "express";

export async function authMiddleware(
      req: Request,
      res: Response,
      next: NextFunction
) {
      let user = req.cookies.userId;

      if (!user) {
            return res.redirect("/login");
      }

      // user = await userRepository.get(user);

      if (!user) {
            res.clearCookie("userId");
            return res.redirect("/login");
      }

      next();
}
