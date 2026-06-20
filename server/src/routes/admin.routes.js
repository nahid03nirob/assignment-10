import { Router } from "express";
import { collections, toObjectId } from "../config/db.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/overview", asyncHandler(async (_req, res) => {
  const [totalUsers, totalRecipes, totalPremiumMembers, totalReports] = await Promise.all([
    collections().users.countDocuments(),
    collections().recipes.countDocuments(),
    collections().users.countDocuments({ isPremium: true }),
    collections().reports.countDocuments()
  ]);
  res.json({ totalUsers, totalRecipes, totalPremiumMembers, totalReports });
}));

router.get("/users", asyncHandler(async (_req, res) => {
  const users = await collections().users.find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).toArray();
  res.json({ users });
}));

router.patch("/users/:id/block", asyncHandler(async (req, res) => {
  await collections().users.updateOne({ _id: toObjectId(req.params.id) }, { $set: { isBlocked: true, updatedAt: new Date() } });
  res.json({ message: "User blocked" });
}));

router.patch("/users/:id/unblock", asyncHandler(async (req, res) => {
  await collections().users.updateOne({ _id: toObjectId(req.params.id) }, { $set: { isBlocked: false, updatedAt: new Date() } });
  res.json({ message: "User unblocked" });
}));

router.patch("/recipes/:id/feature", asyncHandler(async (req, res) => {
  await collections().recipes.updateOne({ _id: toObjectId(req.params.id) }, { $set: { isFeatured: Boolean(req.body.isFeatured), updatedAt: new Date() } });
  res.json({ message: "Recipe featured status updated" });
}));

router.get("/transactions", asyncHandler(async (_req, res) => {
  const items = await collections().payments.find().sort({ paidAt: -1 }).toArray();
  res.json({ items });
}));

export default router;
