import { Router } from "express";
import Stripe from "stripe";
import { env } from "../config/env.js";
import { collections, toObjectId } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const stripe = new Stripe(env.STRIPE_SECRET_KEY);

router.post("/premium-checkout", requireAuth, asyncHandler(async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: req.user.email,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: env.PREMIUM_PRICE_CENTS,
        product_data: { name: "RecipeHub Premium Membership" }
      }
    }],
    metadata: { userId: String(req.user._id), type: "premium" },
    success_url: `${env.CLIENT_ORIGIN}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.CLIENT_ORIGIN}/premium`
  });
  res.json({ url: session.url });
}));

router.post("/recipe-checkout", requireAuth, asyncHandler(async (req, res) => {
  const recipe = await collections().recipes.findOne({ _id: toObjectId(req.body.recipeId) });
  if (!recipe) {
    const error = new Error("Recipe not found");
    error.status = 404;
    throw error;
  }
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: req.user.email,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(Number(recipe.price || 199) * 100),
        product_data: { name: recipe.recipeName }
      }
    }],
    metadata: { userId: String(req.user._id), recipeId: String(recipe._id), type: "recipe" },
    success_url: `${env.CLIENT_ORIGIN}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.CLIENT_ORIGIN}/recipes/${recipe._id}`
  });
  res.json({ url: session.url });
}));

router.post("/confirm", requireAuth, asyncHandler(async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.body.sessionId);
  const payment = {
    userEmail: req.user.email,
    userId: String(req.user._id),
    amount: session.amount_total / 100,
    recipeId: session.metadata.recipeId,
    transactionId: session.payment_intent || session.id,
    paymentStatus: session.payment_status,
    paidAt: new Date()
  };
  await collections().payments.updateOne({ transactionId: payment.transactionId }, { $setOnInsert: payment }, { upsert: true });
  if (session.metadata.type === "premium") {
    await collections().users.updateOne({ _id: req.user._id }, { $set: { isPremium: true, updatedAt: new Date() } });
  }
  res.json({ payment });
}));

router.get("/my-purchases", requireAuth, asyncHandler(async (req, res) => {
  const items = await collections().payments.find({ userEmail: req.user.email, recipeId: { $exists: true } }).sort({ paidAt: -1 }).toArray();
  res.json({ items });
}));

export default router;
