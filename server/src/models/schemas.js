export const timestamps = () => {
  const now = new Date();
  return { createdAt: now, updatedAt: now };
};

export const publicUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
};

export const recipePayload = (body, user) => ({
  recipeName: body.recipeName,
  recipeImage: body.recipeImage,
  category: body.category,
  cuisineType: body.cuisineType,
  difficultyLevel: body.difficultyLevel,
  preparationTime: Number(body.preparationTime),
  ingredients: Array.isArray(body.ingredients) ? body.ingredients : String(body.ingredients || "").split(",").map((item) => item.trim()).filter(Boolean),
  instructions: body.instructions,
  authorId: String(user._id),
  authorName: user.name,
  authorEmail: user.email,
  likesCount: 0,
  isFeatured: false,
  status: "published",
  ...timestamps()
});
