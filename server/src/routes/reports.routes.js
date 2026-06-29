import { Router } from "express";
import { z } from "zod";
import { collections, toObjectId } from "../config/db.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const reportSchema = z.object({
  recipeId: z.string().min(1),
  reason: z.enum(["Spam", "Offensive Content", "Copyright Issue"])
});

router.post("/", requireAuth, asyncHandler(async (req, res) => {
  const data = reportSchema.parse(req.body);
  const report = {
    ...data,
    reporterEmail: req.user.email,
    status: "pending",
    createdAt: new Date()
  };
  const result = await collections().reports.insertOne(report);
  res.status(201).json({ report: { ...report, _id: result.insertedId } });
}));

router.get("/", requireAuth, requireAdmin, asyncHandler(async (_req, res) => {
  const items = await collections().reports.find().sort({ createdAt: -1 }).toArray();
  res.json({ items });
}));

router.patch("/:id/dismiss", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  await collections().reports.updateOne({ _id: toObjectId(req.params.id) }, { $set: { status: "dismissed" } });
  res.json({ message: "Report dismissed" });
}));

router.delete("/:id/recipe", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const report = await collections().reports.findOne({ _id: toObjectId(req.params.id) });
  if (!report) {
    const error = new Error("Report not found");
    error.status = 404;
    throw error;
  }
  await Promise.all([
    collections().recipes.deleteOne({ _id: toObjectId(report.recipeId) }),
    collections().favorites.deleteMany({ recipeId: report.recipeId }),
    collections().reports.updateMany({ recipeId: report.recipeId }, { $set: { status: "removed" } })
  ]);
  res.json({ message: "Reported recipe removed" });
}));

export default router;
