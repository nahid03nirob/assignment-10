import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import supertest from 'supertest';
import Stripe from 'stripe';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.BETTER_AUTH_SECRET = 'recipehub-test-auth-secret-0123456789';
process.env.JWT_SECRET = 'recipehub-test-jwt-secret-0123456789';
process.env.ADMIN_EMAIL = 'admin@recipehub.test';
process.env.ADMIN_PASSWORD = 'AdminRecipeHub123!';
process.env.STRIPE_SECRET_KEY = 'sk_test_recipehub_integration';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_recipehub_integration_secret';
process.env.DB_NAME = `recipehub-test-${crypto.randomUUID()}`;

const mongo = process.env.MONGODB_TEST_URI ? null : await MongoMemoryServer.create();
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || mongo.getUri();

const [{ default: app }, database, betterAuth, models] = await Promise.all([
  import('../src/server.js'),
  import('../src/database.js'),
  import('../src/betterAuth.js'),
  import('../src/models.js'),
]);

await database.connectDatabase();
await betterAuth.connectAuthDatabase();
await (await import('../src/mongoRoutes.js')).seedMongoData();

after(async () => {
  await betterAuth.disconnectAuthDatabase();
  await database.disconnectDatabase();
  await mongo?.stop();
});

const request = supertest(app);
const recipePayload = (name) => ({
  recipeName: name,
  recipeImage: 'https://example.com/recipe.jpg',
  category: 'Dinner',
  cuisineType: 'Italian',
  difficultyLevel: 'Easy',
  preparationTime: '20 mins',
  ingredients: ['Pasta', 'Tomato'],
  instructions: ['Cook pasta', 'Add sauce'],
  isPaid: true,
  purchasePrice: 5,
});

test('Mongo-backed auth, recipe entitlements, collections, and restart persistence', async () => {
  const health = await request.get('/api/health').expect(200);
  assert.equal(health.body.status, 'ok');
  await request.get('/api/admin/dashboard').expect(401);

  const owner = supertest.agent(app);
  const registered = await owner.post('/api/auth/sign-up/email').send({
    name: 'Recipe Owner', email: 'owner@recipehub.test', password: 'OwnerPass123!',
  }).expect(200);
  assert.equal(registered.body.user.email, 'owner@recipehub.test');
  assert.ok(registered.headers['set-cookie'].some((cookie) => /httponly/i.test(cookie)));
  assert.ok((await owner.get('/api/auth/token').expect(200)).body.token);
  const ownerProfile = await owner.get('/api/profile').expect(200);
  assert.equal(ownerProfile.body.user.role, 'user');

  const first = await owner.post('/api/recipes').send(recipePayload('Owner Recipe One')).expect(201);
  await owner.post('/api/recipes').send(recipePayload('Owner Recipe Two')).expect(201);
  await owner.post('/api/recipes').send(recipePayload('Owner Recipe Three')).expect(403);

  const premiumPayment = await models.Payment.create({
    id: crypto.randomUUID(), userEmail: ownerProfile.body.user.email, userId: ownerProfile.body.user.id,
    amount: 29, type: 'premium', paymentStatus: 'pending', checkoutSessionId: `cs_test_${crypto.randomUUID()}`,
  });
  const premiumPayload = JSON.stringify({
    id: `evt_test_${crypto.randomUUID()}`,
    object: 'event',
    type: 'checkout.session.completed',
    data: { object: {
      id: premiumPayment.checkoutSessionId,
      object: 'checkout.session',
      payment_status: 'paid',
      currency: 'usd',
      amount_total: 2900,
      client_reference_id: ownerProfile.body.user.id,
      payment_intent: `pi_test_${crypto.randomUUID()}`,
      metadata: { paymentId: premiumPayment.id, userId: ownerProfile.body.user.id, type: 'premium', recipeId: '' },
    } },
  });
  const premiumStripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const premiumSignature = premiumStripe.webhooks.generateTestHeaderString({ payload: premiumPayload, secret: process.env.STRIPE_WEBHOOK_SECRET });
  await request.post('/api/payments/webhook')
    .set('Content-Type', 'application/json')
    .set('stripe-signature', premiumSignature)
    .send(premiumPayload)
    .expect(200);
  assert.equal((await owner.get('/api/profile').expect(200)).body.user.isPremium, true);
  await owner.post('/api/recipes').send(recipePayload('Premium Recipe Three')).expect(201);

  const ownerDetail = await owner.get(`/api/recipes/${first.body.recipe.id}`).expect(200);
  assert.equal(ownerDetail.body.canAccess, true);
  assert.deepEqual(ownerDetail.body.recipe.ingredients, ['Pasta', 'Tomato']);

  const visitor = supertest.agent(app);
  await visitor.post('/api/auth/sign-up/email').send({
    name: 'Recipe Visitor', email: 'visitor@recipehub.test', password: 'VisitorPass123!',
  }).expect(200);
  const visitorProfile = await visitor.get('/api/profile').expect(200);
  const locked = await visitor.get(`/api/recipes/${first.body.recipe.id}`).expect(200);
  assert.equal(locked.body.canAccess, false);
  assert.equal(locked.body.recipe.ingredients, undefined);

  const payment = await models.Payment.create({
    id: crypto.randomUUID(), userEmail: visitorProfile.body.user.email, userId: visitorProfile.body.user.id,
    amount: 5, recipeId: first.body.recipe.id, type: 'recipe', paymentStatus: 'pending',
    checkoutSessionId: `cs_test_${crypto.randomUUID()}`,
  });
  const eventPayload = JSON.stringify({
    id: `evt_test_${crypto.randomUUID()}`,
    object: 'event',
    type: 'checkout.session.completed',
    data: { object: {
      id: payment.checkoutSessionId,
      object: 'checkout.session',
      payment_status: 'paid',
      currency: 'usd',
      amount_total: 500,
      client_reference_id: visitorProfile.body.user.id,
      payment_intent: `pi_test_${crypto.randomUUID()}`,
      metadata: {
        paymentId: payment.id,
        userId: visitorProfile.body.user.id,
        type: 'recipe',
        recipeId: first.body.recipe.id,
      },
    } },
  });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = stripe.webhooks.generateTestHeaderString({ payload: eventPayload, secret: process.env.STRIPE_WEBHOOK_SECRET });
  assert.doesNotThrow(() => stripe.webhooks.constructEvent(Buffer.from(eventPayload), signature, process.env.STRIPE_WEBHOOK_SECRET));
  const webhook = () => request.post('/api/payments/webhook')
    .set('Content-Type', 'application/json')
    .set('stripe-signature', signature)
    .send(eventPayload);
  const webhookResponse = await webhook();
  assert.equal(webhookResponse.status, 200, webhookResponse.text);
  const duplicateWebhook = await webhook().expect(200);
  assert.equal(duplicateWebhook.body.duplicate, true);
  assert.equal((await models.Payment.findOne({ id: payment.id }).lean()).paymentStatus, 'succeeded');
  const unlocked = await visitor.get(`/api/recipes/${first.body.recipe.id}`).expect(200);
  assert.equal(unlocked.body.canAccess, true);
  assert.deepEqual(unlocked.body.recipe.instructions, ['Cook pasta', 'Add sauce']);

  const liked = await visitor.post(`/api/recipes/${first.body.recipe.id}/like`).expect(200);
  assert.equal(liked.body.liked, true);
  assert.equal(liked.body.likesCount, 1);
  assert.equal((await visitor.post(`/api/recipes/${first.body.recipe.id}/favorite`).expect(200)).body.favorited, true);
  assert.equal((await visitor.get(`/api/users/${visitorProfile.body.user.id}/favorites`).expect(200)).body.items.length, 1);
  await visitor.post(`/api/recipes/${first.body.recipe.id}/report`).send({ reason: 'Spam' }).expect(201);
  await visitor.post(`/api/recipes/${first.body.recipe.id}/report`).send({ reason: 'Spam' }).expect(409);

  const admin = supertest.agent(app);
  await admin.post('/api/auth/sign-in/email').send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }).expect(200);
  assert.equal((await admin.get('/api/admin/dashboard').expect(200)).body.stats.totalUsers, 3);
  await admin.patch(`/api/admin/users/${visitorProfile.body.user.id}/block`).send({ blocked: true }).expect(200);
  await visitor.get('/api/profile').expect(403);
  await admin.patch(`/api/admin/users/${visitorProfile.body.user.id}/block`).send({ blocked: false }).expect(200);
  await visitor.get('/api/profile').expect(200);

  const page = await request.get('/api/recipes?category=Dinner,Lunch&page=1&limit=1').expect(200);
  assert.equal(page.body.items.length, 1);
  assert.ok(page.body.pagination.total >= 5);
  assert.equal(page.body.items[0].ingredients, undefined);

  await database.disconnectDatabase();
  await database.connectDatabase();
  const afterReconnect = await request.get('/api/recipes').query({ search: 'Owner Recipe One' }).expect(200);
  assert.equal(afterReconnect.body.pagination.total, 1);
  const persistedProfile = await owner.get('/api/profile').expect(200);
  assert.equal(persistedProfile.body.user.email, 'owner@recipehub.test');
});
