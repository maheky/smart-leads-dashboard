import express from "express";

import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
} from "../controllers/lead.controller";

import { protect } from "../middleware/auth.middleware";

const router = express.Router();

// CREATE
router.post("/", protect, createLead);

// GET ALL
router.get("/", protect, getLeads);

// GET SINGLE
router.get("/:id", protect, getLeadById);

// UPDATE
router.put("/:id", protect, updateLead);

// DELETE
router.delete("/:id", protect, deleteLead);

export default router;
