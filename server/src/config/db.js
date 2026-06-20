import { MongoClient, ObjectId } from "mongodb";
import { env } from "./env.js";

const client = new MongoClient(env.MONGODB_URI);
let database;

export const connectDb = async () => {
  if (!database) {
    await client.connect();
    database = client.db();
    await database.collection("users").createIndex({ email: 1 }, { unique: true });
    await database.collection("recipes").createIndex({ category: 1, cuisineType: 1, createdAt: -1 });
    await database.collection("favorites").createIndex({ userEmail: 1, recipeId: 1 }, { unique: true });
    await database.collection("payments").createIndex({ transactionId: 1 }, { unique: true });
  }
  return database;
};

export const collections = () => ({
  users: database.collection("users"),
  recipes: database.collection("recipes"),
  favorites: database.collection("favorites"),
  reports: database.collection("reports"),
  payments: database.collection("payments")
});

export const toObjectId = (id) => {
  if (!ObjectId.isValid(id)) {
    const error = new Error("Invalid resource id");
    error.status = 400;
    throw error;
  }
  return new ObjectId(id);
};
