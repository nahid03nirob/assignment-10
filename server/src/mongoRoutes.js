import { Router } from 'express';
import crypto from 'node:crypto';
import Stripe from 'stripe';
import { z } from 'zod';
import { env } from './env.js';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from './betterAuth.js';
import { Favorite, Like, Payment, Purchase, Recipe, Report, User, WebhookEvent } from './models.js';

const router = Router();
const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;
const createId = () => crypto.randomUUID();
const asPublic = (value) => {
  if (!value) return value;
  const item = typeof value.toObject === 'function' ? value.toObject() : { ...value };
  delete item._id;
  delete item.__v;
  return item;
};
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const recipeSchema = z.object({
  recipeName: z.string().min(3).max(120),
  recipeImage: z.string().url().or(z.string().min(6)),
  category: z.string().min(2).max(50),
  cuisineType: z.string().min(2).max(50),
  difficultyLevel: z.enum(['Easy', 'Medium', 'Hard']),
  preparationTime: z.string().min(2).max(30),
  ingredients: z.array(z.string().min(2)).min(1),
  instructions: z.array(z.string().min(2)).min(1),
  isPaid: z.boolean().optional(),
  purchasePrice: z.number().finite().min(0).max(10000).optional(),
});
const sanitizeUser = (user) => {
  const item = asPublic(user);
  return item;
};
const pagination = (query, defaultLimit = 10) => ({
  page: Math.max(1, Number.parseInt(query.page, 10) || 1),
  limit: Math.min(20, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit)),
});
const pageResult = (items, page, limit, total) => ({
  items,
  pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
});

const authenticate = asyncRoute(async (req, res, next) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session?.user) return res.status(401).json({ message: 'Authentication required.' });
  const identity = session.user;
  const user = await User.findOneAndUpdate(
    { email: identity.email.toLowerCase() },
    {
      $set: { name: identity.name, email: identity.email.toLowerCase(), image: identity.image || '' },
      $setOnInsert: { id: identity.id, role: 'user', isBlocked: false, isPremium: false, recipeCount: 0 },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  if (user.isBlocked) return res.status(403).json({ message: 'Your account has been blocked.' });
  req.user = user;
  return next();
});
const requireAdmin = (req, res, next) => req.user?.role === 'admin'
  ? next()
  : res.status(403).json({ message: 'Admin privileges required.' });
const invalidPayload = (res, parsed, fallback) => res.status(400).json({
  message: parsed.error.issues[0]?.message || fallback,
});

router.get('/api/recipes', asyncRoute(async (req, res) => {
  const { page, limit } = pagination(req.query, 12);
  const query = { status: 'published' };
  const search = String(req.query.search || '').trim();
  const categories = String(req.query.category || '').split(',').map((value) => value.trim()).filter(Boolean);
  const cuisines = String(req.query.cuisine || '').split(',').map((value) => value.trim()).filter(Boolean);
  const difficulties = String(req.query.difficulty || '').split(',').map((value) => value.trim()).filter(Boolean);
  if (search) query.recipeName = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (categories.length) query.category = { $in: categories };
  if (cuisines.length) query.cuisineType = { $in: cuisines };
  if (difficulties.length) query.difficultyLevel = { $in: difficulties };
  const [items, total] = await Promise.all([
    Recipe.find(query).select('-ingredients -instructions').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Recipe.countDocuments(query),
  ]);
  return res.json(pageResult(items.map(asPublic), page, limit, total));
}));
router.get('/api/recipes/featured', asyncRoute(async (_req, res) => {
  const items = await Recipe.find({ status: 'published', isFeatured: true }).select('-ingredients -instructions').sort({ createdAt: -1 }).limit(4).lean();
  return res.json({ items: items.map(asPublic) });
}));
router.get('/api/recipes/popular', asyncRoute(async (_req, res) => {
  const items = await Recipe.find({ status: 'published' }).select('-ingredients -instructions').sort({ likesCount: -1, createdAt: -1 }).limit(4).lean();
  return res.json({ items: items.map(asPublic) });
}));
router.get('/api/recipes/:id', asyncRoute(async (req, res) => {
  const recipe = await Recipe.findOne({ id: req.params.id, status: 'published' }).lean();
  if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
  let user = null;
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (session?.user) user = await User.findOne({ email: session.user.email.toLowerCase() }).lean();
  const canAccess = !recipe.isPaid || user?.role === 'admin' || recipe.authorId === user?.id || !!user?.isPremium
    || !!(user && await Purchase.exists({ userId: user.id, recipeId: recipe.id }));
  const publicRecipe = asPublic(recipe);
  if (!canAccess) {
    delete publicRecipe.ingredients;
    delete publicRecipe.instructions;
  }
  return res.json({ recipe: publicRecipe, canAccess });
}));

router.post('/api/recipes', authenticate, asyncRoute(async (req, res) => {
  const parsed = recipeSchema.safeParse(req.body);
  if (!parsed.success) return invalidPayload(res, parsed, 'Invalid recipe payload.');
  const user = req.user;
  const filter = { id: user.id };
  if (user.role !== 'admin' && !user.isPremium) filter.recipeCount = { $lt: 2 };
  const reserved = await User.findOneAndUpdate(filter, { $inc: { recipeCount: 1 } }, { new: true });
  if (!reserved) {
    return res.status(403).json({ message: 'You have reached the normal user recipe limit. Upgrade to Premium to create more recipes.' });
  }
  try {
    const recipe = await Recipe.create({
      id: createId(), ...parsed.data, authorId: user.id, authorName: user.name, authorEmail: user.email,
      likesCount: 0, status: 'published', isPaid: parsed.data.isPaid ?? true,
      purchasePrice: parsed.data.purchasePrice ?? 19,
    });
    return res.status(201).json({ recipe: asPublic(recipe) });
  } catch (error) {
    await User.updateOne({ id: user.id }, { $inc: { recipeCount: -1 } });
    throw error;
  }
}));
router.put('/api/recipes/:id', authenticate, asyncRoute(async (req, res) => {
  const parsed = recipeSchema.partial().safeParse(req.body);
  if (!parsed.success) return invalidPayload(res, parsed, 'Invalid recipe update.');
  const recipe = await Recipe.findOne({ id: req.params.id, status: { $ne: 'deleted' } });
  if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
  if (req.user.role !== 'admin' && recipe.authorId !== req.user.id) return res.status(403).json({ message: 'You do not own this recipe.' });
  Object.assign(recipe, parsed.data);
  await recipe.save();
  return res.json({ recipe: asPublic(recipe) });
}));
router.delete('/api/recipes/:id', authenticate, asyncRoute(async (req, res) => {
  const recipe = await Recipe.findOne({ id: req.params.id, status: { $ne: 'deleted' } });
  if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
  if (req.user.role !== 'admin' && recipe.authorId !== req.user.id) return res.status(403).json({ message: 'You do not own this recipe.' });
  const decrementAuthorCount = recipe.status !== 'deleted';
  recipe.status = 'deleted';
  await recipe.save();
  if (decrementAuthorCount) await User.updateOne({ id: recipe.authorId, recipeCount: { $gt: 0 } }, { $inc: { recipeCount: -1 } });
  await Favorite.deleteMany({ recipeId: recipe.id });
  await Like.deleteMany({ recipeId: recipe.id });
  return res.json({ success: true, message: 'Recipe deleted.' });
}));

router.post('/api/recipes/:id/like', authenticate, asyncRoute(async (req, res) => {
  const recipe = await Recipe.findOne({ id: req.params.id, status: 'published' });
  if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
  const removed = await Like.findOneAndDelete({ recipeId: recipe.id, userId: req.user.id });
  if (removed) {
    const updated = await Recipe.findOneAndUpdate({ id: recipe.id }, { $inc: { likesCount: -1 } }, { new: true });
    if (updated.likesCount < 0) updated.likesCount = 0, await updated.save();
    return res.json({ liked: false, likesCount: Math.max(0, updated.likesCount) });
  }
  try {
    await Like.create({ id: createId(), recipeId: recipe.id, userId: req.user.id });
    const updated = await Recipe.findOneAndUpdate({ id: recipe.id }, { $inc: { likesCount: 1 } }, { new: true });
    return res.json({ liked: true, likesCount: updated.likesCount });
  } catch (error) {
    if (error.code !== 11000) throw error;
    return res.json({ liked: true, likesCount: recipe.likesCount });
  }
}));
router.post('/api/recipes/:id/favorite', authenticate, asyncRoute(async (req, res) => {
  const recipe = await Recipe.findOne({ id: req.params.id, status: 'published' });
  if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
  const removed = await Favorite.findOneAndDelete({ recipeId: recipe.id, userId: req.user.id });
  if (removed) return res.json({ favorited: false, message: 'Removed from favorites.' });
  try {
    await Favorite.create({ id: createId(), userId: req.user.id, userEmail: req.user.email, recipeId: recipe.id });
    return res.json({ favorited: true, message: 'Added to favorites.' });
  } catch (error) {
    if (error.code !== 11000) throw error;
    return res.json({ favorited: true, message: 'Already in favorites.' });
  }
}));
router.get('/api/users/:id/favorites', authenticate, asyncRoute(async (req, res) => {
  if (req.params.id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'You cannot view these favorites.' });
  const favorites = await Favorite.find({ userId: req.params.id }).sort({ addedAt: -1 }).lean();
  const recipes = await Recipe.find({ id: { $in: favorites.map((favorite) => favorite.recipeId) }, status: 'published' }).lean();
  const byId = new Map(recipes.map((recipe) => [recipe.id, asPublic(recipe)]));
  return res.json({ items: favorites.map((favorite) => ({ ...asPublic(favorite), recipe: byId.get(favorite.recipeId) || null })) });
}));
router.get('/api/users/:id/recipes', authenticate, asyncRoute(async (req, res) => {
  if (req.params.id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'You cannot view these recipes.' });
  const { page, limit } = pagination(req.query, 12);
  const query = { authorId: req.params.id, status: { $ne: 'deleted' } };
  const [items, total] = await Promise.all([
    Recipe.find(query).select('-ingredients -instructions').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Recipe.countDocuments(query),
  ]);
  return res.json(pageResult(items.map(asPublic), page, limit, total));
}));
router.post('/api/recipes/:id/report', authenticate, asyncRoute(async (req, res) => {
  const recipe = await Recipe.findOne({ id: req.params.id, status: 'published' });
  if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
  const reason = req.body?.reason;
  if (!['Spam', 'Offensive Content', 'Copyright Issue'].includes(reason)) return res.status(400).json({ message: 'Provide a valid report reason.' });
  try {
    const report = await Report.create({ id: createId(), recipeId: recipe.id, reporterEmail: req.user.email, reporterId: req.user.id, reason });
    return res.status(201).json({ report: asPublic(report) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'A similar report has already been submitted.' });
    throw error;
  }
}));

router.get('/api/users/:id/purchases', authenticate, asyncRoute(async (req, res) => {
  if (req.params.id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'You cannot view these purchases.' });
  const items = await Payment.find({ userId: req.params.id, paymentStatus: 'succeeded' }).sort({ createdAt: -1 }).lean();
  return res.json({ items: items.map(asPublic) });
}));
router.get('/api/dashboard', authenticate, asyncRoute(async (req, res) => {
  const [totalRecipes, totalFavorites, recipes] = await Promise.all([
    Recipe.countDocuments({ authorId: req.user.id, status: { $ne: 'deleted' } }),
    Favorite.countDocuments({ userId: req.user.id }),
    Recipe.find({ authorId: req.user.id, status: { $ne: 'deleted' } }).select('likesCount').lean(),
  ]);
  return res.json({ stats: {
    totalRecipes, totalFavorites, totalLikesReceived: recipes.reduce((sum, recipe) => sum + recipe.likesCount, 0),
    isPremium: !!req.user.isPremium, role: req.user.role,
  } });
}));

router.post('/api/payments/checkout', authenticate, asyncRoute(async (req, res) => {
  if (!stripe) return res.status(503).json({ message: 'Stripe payments are not configured.' });
  const type = req.body?.type || 'recipe';
  if (!['premium', 'recipe'].includes(type)) return res.status(400).json({ message: 'Invalid checkout type.' });
  if (type === 'premium' && req.user.isPremium) return res.status(409).json({ message: 'This account already has Premium.' });
  const recipe = type === 'recipe' ? await Recipe.findOne({ id: req.body?.recipeId, status: 'published' }).lean() : null;
  if (type === 'recipe' && !recipe) return res.status(404).json({ message: 'Recipe not found for purchase.' });
  if (recipe?.authorId === req.user.id) return res.status(400).json({ message: 'You cannot purchase your own recipe.' });
  if (recipe && await Purchase.exists({ userId: req.user.id, recipeId: recipe.id })) return res.status(409).json({ message: 'You already own this recipe.' });
  const amount = type === 'premium' ? 29 : Number(recipe.purchasePrice || 19);
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ message: 'Purchase price must be greater than zero.' });
  const payment = await Payment.create({
    id: createId(), userEmail: req.user.email, userId: req.user.id, amount,
    recipeId: recipe?.id || null, type, paymentStatus: 'pending',
  });
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', customer_email: req.user.email, client_reference_id: req.user.id,
      line_items: [{ quantity: 1, price_data: {
        currency: 'usd', unit_amount: Math.round(amount * 100),
        product_data: { name: type === 'premium' ? 'RecipeHub Premium membership' : recipe.recipeName },
      } }],
      metadata: { paymentId: payment.id, userId: req.user.id, type, recipeId: recipe?.id || '' },
      success_url: `${env.CLIENT_URL}/dashboard/purchased?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: type === 'recipe' ? `${env.CLIENT_URL}/recipes/${recipe.id}?checkout=cancelled` : `${env.CLIENT_URL}/dashboard?checkout=cancelled`,
    });
    payment.checkoutSessionId = session.id;
    await payment.save();
    return res.json({ success: true, checkoutUrl: session.url, sessionId: session.id });
  } catch (error) {
    await Payment.deleteOne({ id: payment.id });
    throw error;
  }
}));

const grantPayment = async (payment, session) => {
  if (session.payment_status !== 'paid' || session.currency !== 'usd' || session.amount_total !== Math.round(payment.amount * 100)) {
    throw new Error('Stripe checkout session does not match the pending payment.');
  }
  payment.paymentStatus = 'succeeded';
  payment.transactionId = session.payment_intent?.toString() || session.id;
  payment.paymentIntentId = session.payment_intent?.toString() || null;
  payment.paidAt = new Date();
  await payment.save();
  if (payment.type === 'premium') {
    await User.updateOne({ id: payment.userId }, { $set: { isPremium: true } });
  } else {
    await Purchase.updateOne(
      { userId: payment.userId, recipeId: payment.recipeId },
      { $setOnInsert: { id: createId(), userId: payment.userId, recipeId: payment.recipeId, paymentId: payment.id } },
      { upsert: true },
    );
  }
};
router.post('/api/payments/verify', authenticate, asyncRoute(async (req, res) => {
  if (!stripe) return res.status(503).json({ message: 'Stripe payments are not configured.' });
  const sessionId = String(req.body?.sessionId || '');
  if (!sessionId) return res.status(400).json({ message: 'Checkout session ID is required.' });
  const payment = await Payment.findOne({ checkoutSessionId: sessionId, userId: req.user.id });
  if (!payment) return res.status(404).json({ message: 'Payment record not found.' });
  if (payment.paymentStatus !== 'succeeded') {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.client_reference_id !== req.user.id) return res.status(403).json({ message: 'Checkout session does not belong to this account.' });
    await grantPayment(payment, session);
  }
  return res.json({ payment: asPublic(payment) });
}));

router.get('/api/admin/dashboard', authenticate, requireAdmin, asyncRoute(async (_req, res) => {
  const [totalUsers, totalRecipes, totalPremiumMembers, totalReports] = await Promise.all([
    User.countDocuments(), Recipe.countDocuments({ status: { $ne: 'deleted' } }),
    User.countDocuments({ isPremium: true }), Report.countDocuments(),
  ]);
  return res.json({ stats: { totalUsers, totalRecipes, totalPremiumMembers, totalReports } });
}));
router.get('/api/admin/users', authenticate, requireAdmin, asyncRoute(async (req, res) => {
  const { page, limit } = pagination(req.query);
  const [items, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), User.countDocuments(),
  ]);
  return res.json(pageResult(items.map(sanitizeUser), page, limit, total));
}));
router.patch('/api/admin/users/:id/block', authenticate, requireAdmin, asyncRoute(async (req, res) => {
  const blocked = z.boolean().safeParse(req.body?.blocked);
  if (!blocked.success) return res.status(400).json({ message: 'blocked must be a boolean.' });
  const user = await User.findOne({ id: req.params.id });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (user.role === 'admin') return res.status(400).json({ message: 'Administrators cannot be blocked.' });
  user.isBlocked = blocked.data;
  await user.save();
  return res.json({ user: sanitizeUser(user) });
}));
router.get('/api/admin/recipes', authenticate, requireAdmin, asyncRoute(async (req, res) => {
  const { page, limit } = pagination(req.query);
  const query = { status: { $ne: 'deleted' } };
  const [items, total] = await Promise.all([
    Recipe.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Recipe.countDocuments(query),
  ]);
  return res.json(pageResult(items.map(asPublic), page, limit, total));
}));
router.patch('/api/admin/recipes/:id/feature', authenticate, requireAdmin, asyncRoute(async (req, res) => {
  const featured = z.boolean().safeParse(req.body?.featured);
  if (!featured.success) return res.status(400).json({ message: 'featured must be a boolean.' });
  const recipe = await Recipe.findOneAndUpdate({ id: req.params.id }, { $set: { isFeatured: featured.data } }, { new: true });
  if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
  return res.json({ recipe: asPublic(recipe) });
}));
router.patch('/api/admin/recipes/:id/status', authenticate, requireAdmin, asyncRoute(async (req, res) => {
  const status = z.enum(['published', 'hidden', 'deleted']).safeParse(req.body?.status);
  if (!status.success) return res.status(400).json({ message: 'Invalid recipe status.' });
  const recipe = await Recipe.findOne({ id: req.params.id });
  if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
  const wasDeleted = recipe.status === 'deleted';
  recipe.status = status.data;
  await recipe.save();
  if (wasDeleted !== (status.data === 'deleted')) {
    const delta = status.data === 'deleted' ? -1 : 1;
    await User.updateOne({ id: recipe.authorId, ...(delta < 0 ? { recipeCount: { $gt: 0 } } : {}) }, { $inc: { recipeCount: delta } });
  }
  return res.json({ recipe: asPublic(recipe) });
}));
router.get('/api/admin/reports', authenticate, requireAdmin, asyncRoute(async (req, res) => {
  const { page, limit } = pagination(req.query);
  const [items, total] = await Promise.all([
    Report.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Report.countDocuments(),
  ]);
  return res.json(pageResult(items.map(asPublic), page, limit, total));
}));
router.patch('/api/admin/reports/:id', authenticate, requireAdmin, asyncRoute(async (req, res) => {
  const status = z.enum(['resolved', 'dismissed']).safeParse(req.body?.status || 'resolved');
  if (!status.success) return res.status(400).json({ message: 'Invalid report status.' });
  const report = await Report.findOneAndUpdate({ id: req.params.id }, { $set: { status: status.data } }, { new: true });
  if (!report) return res.status(404).json({ message: 'Report not found.' });
  return res.json({ report: asPublic(report) });
}));
router.get('/api/admin/transactions', authenticate, requireAdmin, asyncRoute(async (req, res) => {
  const { page, limit } = pagination(req.query);
  const [items, total] = await Promise.all([
    Payment.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Payment.countDocuments(),
  ]);
  return res.json(pageResult(items.map(asPublic), page, limit, total));
}));
router.get('/api/profile', authenticate, (req, res) => res.json({ user: sanitizeUser(req.user) }));
router.put('/api/profile', authenticate, asyncRoute(async (req, res) => {
  const parsed = z.object({
    name: z.string().trim().min(2).max(60).optional(),
    image: z.string().url().or(z.literal('')).optional(),
  }).refine((value) => value.name !== undefined || value.image !== undefined).safeParse(req.body);
  if (!parsed.success) return invalidPayload(res, parsed, 'Provide a valid name or profile image to update.');
  const user = await User.findOneAndUpdate({ id: req.user.id }, { $set: parsed.data }, { new: true, runValidators: true });
  return res.json({ user: sanitizeUser(user) });
}));

router.use((error, _req, res, _next) => {
  console.error('Mongo API request failed:', error);
  return res.status(500).json({ message: 'The request could not be completed.' });
});

export async function seedMongoData() {
  let identity;
  try {
    identity = (await auth.api.signUpEmail({ body: {
      name: 'RecipeHub Admin', email: env.ADMIN_EMAIL.toLowerCase(), password: env.ADMIN_PASSWORD,
    } })).user;
  } catch {
    identity = (await auth.api.signInEmail({ body: {
      email: env.ADMIN_EMAIL.toLowerCase(), password: env.ADMIN_PASSWORD,
    } })).user;
  }
  const admin = await User.findOneAndUpdate(
    { email: env.ADMIN_EMAIL.toLowerCase() },
    {
      $set: { name: identity.name, role: 'admin', isPremium: true, isBlocked: false },
      $setOnInsert: { id: identity.id, email: env.ADMIN_EMAIL.toLowerCase(), image: identity.image || '', recipeCount: 0 },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  if (await Recipe.exists({})) return admin;
  const samples = [
    ['Citrus Herb Salmon Bowl', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80', 'Dinner', 'Mediterranean', 'Medium', '30 mins', ['Salmon fillet', 'Brown rice', 'Lemon', 'Parsley', 'Cucumber'], ['Season salmon', 'Roast salmon', 'Assemble bowl'], 18, true],
    ['Creamy Mushroom Pasta', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80', 'Dinner', 'Italian', 'Easy', '25 mins', ['Pasta', 'Mushrooms', 'Garlic', 'Cream', 'Parmesan'], ['Cook pasta', 'Saute mushrooms', 'Finish with sauce'], 21, true],
    ['Garden Chickpea Salad', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1200&q=80', 'Lunch', 'Middle Eastern', 'Easy', '15 mins', ['Chickpeas', 'Tomato', 'Cucumber', 'Mint', 'Tahini'], ['Mix vegetables', 'Add chickpeas', 'Dress and serve'], 16, false],
  ];
  await Recipe.insertMany(samples.map(([recipeName, recipeImage, category, cuisineType, difficultyLevel, preparationTime, ingredients, instructions, purchasePrice, isFeatured], index) => ({
    id: createId(), recipeName, recipeImage, category, cuisineType, difficultyLevel, preparationTime, ingredients, instructions,
    authorId: admin.id, authorName: admin.name, authorEmail: admin.email, likesCount: [14, 22, 11][index],
    isFeatured, status: 'published', purchasePrice,
  })));
  return admin;
}

export async function handleStripeWebhook(req, res, stripeInstance = stripe) {
  if (!stripeInstance || !env.STRIPE_WEBHOOK_SECRET) return res.status(503).json({ message: 'Stripe webhook is not configured.' });
  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(req.body, req.headers['stripe-signature'], env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.warn('Stripe webhook signature rejected:', error.message);
    return res.status(400).json({ message: 'Invalid Stripe webhook signature.' });
  }
  const previous = await WebhookEvent.findOne({ eventId: event.id }).lean();
  if (previous?.status === 'processed') return res.json({ received: true, duplicate: true });
  try {
    await WebhookEvent.updateOne(
      { eventId: event.id },
      { $set: { eventType: event.type, status: 'processing', lastError: null } },
      { upsert: true, setDefaultsOnInsert: true },
    );
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object;
      const payment = await Payment.findOne({ id: session.metadata?.paymentId, checkoutSessionId: session.id });
      if (!payment) throw new Error('No pending payment matches this checkout session.');
      if (session.client_reference_id !== payment.userId
        || session.metadata?.userId !== payment.userId
        || session.metadata?.type !== payment.type
        || (payment.type === 'recipe' && session.metadata?.recipeId !== payment.recipeId)) {
        throw new Error('Checkout session metadata does not match the pending payment.');
      }
      if (session.payment_status === 'paid') await grantPayment(payment, session);
    }
    await WebhookEvent.updateOne({ eventId: event.id }, { $set: { status: 'processed', processedAt: new Date() } });
    return res.json({ received: true });
  } catch (error) {
    await WebhookEvent.updateOne({ eventId: event.id }, { $set: { status: 'failed', lastError: error.message } });
    return res.status(500).json({ message: 'Webhook processing failed and should be retried.' });
  }
}

export default router;