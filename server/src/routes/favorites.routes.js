import { Router } from "express";
import { collections, toObjectId } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const items = await collections().favorites.aggregate([
    { $match: { userEmail: req.user.email } },
    { $addFields: { recipeObjectId: { $toObjectId: "$recipeId" } } },
    { $lookup: { from: "recipes", localField: "recipeObjectId", foreignField: "_id", as: "recipe" } },
    { $unwind: "$recipe" }
  ]).toArray();
  res.json({ items });
}));

router.post("/:recipeId", requireAuth, asyncHandler(async (req, res) => {
  await collections().favorites.updateOne(
    { userEmail: req.user.email, recipeId: req.params.recipeId },
    { $setOnInsert: { userEmail: req.user.email, userId: String(req.user._id), recipeId: req.params.recipeId, addedAt: new Date() } },
    { upsert: true }
  );
  res.status(201).json({ message: "Recipe saved" });
}));

router.delete("/:recipeId", requireAuth, asyncHandler(async (req, res) => {
  await collections().favorites.deleteOne({ userEmail: req.user.email, recipeId: String(toObjectId(req.params.recipeId)) });
  res.json({ message: "Favorite removed" });
}));

export default router;
