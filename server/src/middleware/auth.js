import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { collections, toObjectId } from "../config/db.js";

export const signToken = (user) => jwt.sign(
  { id: String(user._id), email: user.email, role: user.role },
  env.JWT_SECRET,
  { expiresIn: env.JWT_EXPIRES_IN }
);

export const setAuthCookie = (res, token) => {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export const requireAuth = async (req, _res, next) => {
  try {
    const token = req.cookies?.[env.COOKIE_NAME];
    if (!token) {
      const error = new Error("Authentication required");
      error.status = 401;
      throw error;
    }
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await collections().users.findOne({ _id: toObjectId(payload.id) }, { projection: { passwordHash: 0 } });
    if (!user || user.isBlocked) {
      const error = new Error("Account is not allowed");
      error.status = 403;
      throw error;
    }
    req.user = user;
    next();
  } catch (error) {
    error.status ||= 401;
    next(error);
  }
};

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== "admin") {
    const error = new Error("Admin access required");
    error.status = 403;
    return next(error);
  }
  next();
};
