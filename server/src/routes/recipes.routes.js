import { Router } from "express";
import { collections, toObjectId } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { recipePayload } from "../models/schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 9), 1), 24);
  const filter = { status: "published" };
  if (req.query.category) filter.category = { $in: String(req.query.category).split(",") };
  if (req.query.cuisineType) filter.cuisineType = req.query.cuisineType;
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    collections().recipes.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    collections().recipes.countDocuments(filter)
  ]);
  res.json({ items, page, totalPages: Math.ceil(total / limit), total });
}));

router.get("/featured", asyncHandler(async (_req, res) => {
  const items = await collections().recipes.find({ isFeatured: true, status: "published" }).limit(6).toArray();
  res.json({ items });
}));

router.get("/popular", asyncHandler(async (_req, res) => {
  const items = await collections().recipes.find({ status: "published" }).sort({ likesCount: -1 }).limit(6).toArray();
  res.json({ items });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const recipe = await collections().recipes.findOne({ _id: toObjectId(req.params.id) });
  if (!recipe) {
    const error = new Error("Recipe not found");
    error.status = 404;
    throw error;
  }
  res.json({ recipe });
}));

router.post("/", requireAuth, asyncHandler(async (req, res) => {
  const existing = await collections().recipes.countDocuments({ authorEmail: req.user.email });
  if (!req.user.isPremium && existing >= 2) {
    const error = new Error("Free users can add only 2 recipes. Please become premium.");
    error.status = 403;
    throw error;
  }
  const recipe = recipePayload(req.body, req.user);
  const result = await collections().recipes.insertOne(recipe);
  res.status(201).json({ recipe: { ...recipe, _id: result.insertedId } });
}));

router.patch("/:id", requireAuth, asyncHandler(async (req, res) => {
  const recipe = await collections().recipes.findOne({ _id: toObjectId(req.params.id) });
  if (!recipe || (recipe.authorEmail !== req.user.email && req.user.role !== "admin")) {
    const error = new Error("Recipe update is not allowed");
    error.status = 403;
    throw error;
  }
  await collections().recipes.updateOne({ _id: recipe._id }, { $set: { ...req.body, updatedAt: new Date() } });
  res.json({ message: "Recipe updated" });
}));

router.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  const recipe = await collections().recipes.findOne({ _id: toObjectId(req.params.id) });
  if (!recipe || (recipe.authorEmail !== req.user.email && req.user.role !== "admin")) {
    const error = new Error("Recipe delete is not allowed");
    error.status = 403;
    throw error;
  }
  await collections().recipes.deleteOne({ _id: recipe._id });
  res.json({ message: "Recipe deleted" });
}));

router.post("/:id/like", requireAuth, asyncHandler(async (req, res) => {
  const result = await collections().recipes.findOneAndUpdate(
    { _id: toObjectId(req.params.id) },
    { $inc: { likesCount: 1 }, $set: { updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  res.json({ recipe: result.value });
}));

export default router;
