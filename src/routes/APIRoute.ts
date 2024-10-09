import type { Request, Response } from "express";
import { updateDailyWinrate } from "../../scripts/fetchDailyWinrate";
import { updateHeroes } from "../../scripts/fetchHeroes";

const router = require("express").Router();

router.get("/uptime", (req: Request, res: Response) => {
      res.json({
            message: "Uptime",
            time: process.uptime(),
      });
});

router.post("/fetchDailyWinrate", async (req: Request, res: Response) => {
      if (req.body.auth != "nothua")
            return res.json({ message: "Unauthorized" });

      res.json({
            message: "Updating",
            time: Date.now(),
      });

      updateDailyWinrate();
});

router.post("/fetchHeroes", async (req: Request, res: Response) => {
      if (req.body.auth != "nothua")
            return res.json({ message: "Unauthorized" });

      res.json({
            message: "Updating",
            time: Date.now(),
      });

      updateHeroes();
});

export default router;
