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

router.get("/recipes", asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    collections().recipes.find().sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    collections().recipes.countDocuments()
  ]);
  res.json({ items, page, totalPages: Math.ceil(total / limit), total });
}));

router.patch("/recipes/:id", asyncHandler(async (req, res) => {
  const update = {
    recipeName: req.body.recipeName,
    recipeImage: req.body.recipeImage,
    category: req.body.category,
    cuisineType: req.body.cuisineType,
    difficultyLevel: req.body.difficultyLevel,
    preparationTime: Number(req.body.preparationTime),
    ingredients: Array.isArray(req.body.ingredients) ? req.body.ingredients : String(req.body.ingredients || "").split(",").map((item) => item.trim()).filter(Boolean),
    instructions: req.body.instructions,
    status: req.body.status || "published",
    updatedAt: new Date()
  };
  Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);
  await collections().recipes.updateOne({ _id: toObjectId(req.params.id) }, { $set: update });
  res.json({ message: "Recipe updated" });
}));

router.patch("/recipes/:id/feature", asyncHandler(async (req, res) => {
  await collections().recipes.updateOne({ _id: toObjectId(req.params.id) }, { $set: { isFeatured: Boolean(req.body.isFeatured), updatedAt: new Date() } });
  res.json({ message: "Recipe featured status updated" });
}));

router.delete("/recipes/:id", asyncHandler(async (req, res) => {
  const recipeId = req.params.id;
  await Promise.all([
    collections().recipes.deleteOne({ _id: toObjectId(recipeId) }),
    collections().favorites.deleteMany({ recipeId }),
    collections().reports.updateMany({ recipeId }, { $set: { status: "removed" } })
  ]);
  res.json({ message: "Recipe deleted" });
}));

router.get("/transactions", asyncHandler(async (_req, res) => {
  const items = await collections().payments.find().sort({ paidAt: -1 }).toArray();
  res.json({ items });
}));

export default router;
