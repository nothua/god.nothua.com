import type { Request, Response } from "express";

const router = require("express").Router();

router.get("/", (req: Request, res: Response) => {
      res.render("front/index");
});

export default router;
