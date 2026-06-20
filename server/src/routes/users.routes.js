import { Router } from "express";
import { collections } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { publicUser } from "../models/schemas.js";

const router = Router();

router.patch("/profile", requireAuth, asyncHandler(async (req, res) => {
  const update = {
    name: req.body.name,
    image: req.body.image,
    updatedAt: new Date()
  };
  await collections().users.updateOne({ _id: req.user._id }, { $set: update });
  res.json({ user: publicUser({ ...req.user, ...update }) });
}));

router.get("/dashboard", requireAuth, asyncHandler(async (req, res) => {
  const [totalRecipes, totalFavorites, ownRecipes] = await Promise.all([
    collections().recipes.countDocuments({ authorEmail: req.user.email }),
    collections().favorites.countDocuments({ userEmail: req.user.email }),
    collections().recipes.find({ authorEmail: req.user.email }).toArray()
  ]);
  const totalLikesReceived = ownRecipes.reduce((sum, recipe) => sum + Number(recipe.likesCount || 0), 0);
  res.json({ totalRecipes, totalFavorites, totalLikesReceived, isPremium: req.user.isPremium });
}));

export default router;
