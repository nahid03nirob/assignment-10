import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { env } from "../config/env.js";
import { collections } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { publicUser, timestamps } from "../models/schemas.js";
import { requireAuth, setAuthCookie, signToken } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  image: z.string().url(),
  password: z.string().min(6).regex(/[A-Z]/).regex(/[a-z]/)
});

router.post("/register", asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = {
    name: data.name,
    email: data.email,
    image: data.image,
    passwordHash,
    role: "user",
    isBlocked: false,
    isPremium: false,
    ...timestamps()
  };
  const result = await collections().users.insertOne(user);
  const saved = { ...user, _id: result.insertedId };
  setAuthCookie(res, signToken(saved));
  res.status(201).json({ user: publicUser(saved) });
}));

router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await collections().users.findOne({ email });
  const matches = user && await bcrypt.compare(password, user.passwordHash);
  if (!matches || user.isBlocked) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }
  setAuthCookie(res, signToken(user));
  res.json({ user: publicUser(user) });
}));

router.post("/logout", (_req, res) => {
  res.clearCookie(env.COOKIE_NAME);
  res.json({ message: "Logged out" });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
