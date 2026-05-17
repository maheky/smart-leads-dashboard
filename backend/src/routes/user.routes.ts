import express from "express";

import { protect } from "../middleware/auth.middleware";

const router = express.Router();

// PROFILE ROUTE
router.get(
  "/profile",
  protect,
  (req, res) => {

    res.json({
      success: true,
      message: "Profile fetched successfully",
      user: (req as any).user,
    });

  }
);

export default router;
