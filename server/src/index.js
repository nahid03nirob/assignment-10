import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/error.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import recipeRoutes from "./routes/recipes.routes.js";
import favoriteRoutes from "./routes/favorites.routes.js";
import reportRoutes from "./routes/reports.routes.js";
import paymentRoutes from "./routes/payments.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

app.use(cors({
  origin: env.CLIENT_ORIGIN,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.json({ message: "RecipeHub API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

await connectDb();

app.listen(env.PORT, () => {
  console.log(`RecipeHub API listening on port ${env.PORT}`);
});
