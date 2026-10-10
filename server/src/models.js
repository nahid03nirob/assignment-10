import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const options = { timestamps: true, versionKey: false };

const userSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  image: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  isBlocked: { type: Boolean, default: false, index: true },
  isPremium: { type: Boolean, default: false, index: true },
  recipeCount: { type: Number, default: 0, min: 0 },
}, options);

const recipeSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  recipeName: { type: String, required: true, trim: true, maxlength: 120 },
  recipeImage: { type: String, required: true },
  category: { type: String, required: true, index: true },
  cuisineType: { type: String, required: true, index: true },
  difficultyLevel: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  preparationTime: { type: String, required: true },
  ingredients: { type: [String], required: true },
  instructions: { type: [String], required: true },
  authorId: { type: String, required: true, index: true },
  authorName: { type: String, required: true },
  authorEmail: { type: String, required: true, lowercase: true },
  likesCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false, index: true },
  isPaid: { type: Boolean, default: true, index: true },
  status: { type: String, enum: ['published', 'hidden', 'deleted'], default: 'published', index: true },
  purchasePrice: { type: Number, min: 0, default: 19 },
}, options);
recipeSchema.index({ status: 1, createdAt: -1 });
recipeSchema.index({ status: 1, likesCount: -1 });

const favoriteSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userEmail: { type: String, required: true, lowercase: true },
  recipeId: { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
}, options);
favoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

const likeSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  recipeId: { type: String, required: true },
}, options);
likeSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

const reportSchema = new Schema({
  id: { type: String, required: true, unique: true },
  recipeId: { type: String, required: true, index: true },
  reporterEmail: { type: String, required: true, lowercase: true },
  reporterId: { type: String, required: true },
  reason: { type: String, enum: ['Spam', 'Offensive Content', 'Copyright Issue'], required: true },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending', index: true },
}, options);
reportSchema.index({ recipeId: 1, reporterId: 1, reason: 1 }, { unique: true });

const paymentSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true, lowercase: true },
  userId: { type: String, required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  recipeId: { type: String, default: null, index: true },
  transactionId: { type: String, default: null },
  checkoutSessionId: { type: String, default: undefined },
  paymentIntentId: { type: String, default: undefined },
  paymentStatus: { type: String, enum: ['pending', 'succeeded', 'failed', 'refunded'], default: 'pending', index: true },
  paidAt: { type: Date, default: null },
  type: { type: String, enum: ['premium', 'recipe'], required: true },
}, options);
paymentSchema.index({ checkoutSessionId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ paymentIntentId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ userId: 1, paymentStatus: 1, createdAt: -1 });

const purchaseSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  recipeId: { type: String, required: true },
  paymentId: { type: String, required: true, unique: true },
}, options);
purchaseSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

const webhookEventSchema = new Schema({
  eventId: { type: String, required: true, unique: true },
  eventType: { type: String, required: true },
  status: { type: String, enum: ['processing', 'processed', 'failed'], default: 'processing', index: true },
  lastError: { type: String, default: null },
  processedAt: { type: Date, default: Date.now },
}, { versionKey: false });

export const User = models.RecipeHubUser || model('RecipeHubUser', userSchema);
export const Recipe = models.RecipeHubRecipe || model('RecipeHubRecipe', recipeSchema);
export const Favorite = models.RecipeHubFavorite || model('RecipeHubFavorite', favoriteSchema);
export const Like = models.RecipeHubLike || model('RecipeHubLike', likeSchema);
export const Report = models.RecipeHubReport || model('RecipeHubReport', reportSchema);
export const Payment = models.RecipeHubPayment || model('RecipeHubPayment', paymentSchema);
export const Purchase = models.RecipeHubPurchase || model('RecipeHubPurchase', purchaseSchema);
export const WebhookEvent = models.RecipeHubWebhookEvent || model('RecipeHubWebhookEvent', webhookEventSchema);