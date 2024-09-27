import type { NextFunction, Request, Response } from "express";

export async function checkBodyMiddleware(
      err: Error & { status?: number; body?: any },
      req: Request,
      res: Response,
      next: NextFunction
) {
      if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
            return res.status(400).json({
                  message: "Invalid JSON format.",
            });
      }
      next(err);
}
