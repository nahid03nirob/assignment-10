const image = (path) => `Image/${path}`;

const seedRecipes = [
  {
    id: "r1",
    recipeName: "Smoky Chicken Biryani",
    recipeImage: image("Recipe/1.jpg"),
    category: "Dinner",
    cuisineType: "Bangladeshi",
    difficultyLevel: "Medium",
    preparationTime: 75,
    ingredients: ["Basmati rice", "Chicken", "Yogurt", "Fried onion", "Biryani spice"],
    instructions: "Marinate chicken with yogurt and spices, cook until tender, layer with rice, and steam until fragrant.",
    authorId: "u1",
    authorName: "Ayesha Rahman",
    authorEmail: "ayesha@example.com",
    likesCount: 184,
    isFeatured: true,
    price: 4.99,
    status: "published"
  },
  {
    id: "r2",
    recipeName: "Creamy Garlic Pasta",
    recipeImage: image("Recipe/2.jpg"),
    category: "Lunch",
    cuisineType: "Italian",
    difficultyLevel: "Easy",
    preparationTime: 28,
    ingredients: ["Pasta", "Garlic", "Cream", "Parmesan", "Parsley"],
    instructions: "Boil pasta, make a garlic cream sauce, toss together, and finish with parmesan and parsley.",
    authorId: "u2",
    authorName: "Marco Silva",
    authorEmail: "marco@example.com",
    likesCount: 221,
    isFeatured: true,
    price: 2.99,
    status: "published"
  },
  {
    id: "r3",
    recipeName: "Crispy Veggie Tacos",
    recipeImage: image("Recipe/3.jpg"),
    category: "Snacks",
    cuisineType: "Mexican",
    difficultyLevel: "Easy",
    preparationTime: 35,
    ingredients: ["Tortillas", "Beans", "Corn", "Avocado", "Lime"],
    instructions: "Warm tortillas, fill with spiced beans and vegetables, then finish with avocado and lime.",
    authorId: "u3",
    authorName: "Nora Diaz",
    authorEmail: "nora@example.com",
    likesCount: 146,
    isFeatured: false,
    price: 1.99,
    status: "published"
  },
  {
    id: "r4",
    recipeName: "Mango Coconut Pudding",
    recipeImage: image("Recipe/4.jpg"),
    category: "Dessert",
    cuisineType: "Thai",
    difficultyLevel: "Easy",
    preparationTime: 20,
    ingredients: ["Mango", "Coconut milk", "Sugar", "Gelatin", "Mint"],
    instructions: "Blend mango, simmer coconut milk, set with gelatin, and chill before serving.",
    authorId: "u1",
    authorName: "Ayesha Rahman",
    authorEmail: "ayesha@example.com",
    likesCount: 199,
    isFeatured: true,
    price: 3.49,
    status: "published"
  },
  {
    id: "r5",
    recipeName: "Lemon Herb Salmon",
    recipeImage: image("Recipe/5.jpg"),
    category: "Dinner",
    cuisineType: "Mediterranean",
    difficultyLevel: "Medium",
    preparationTime: 32,
    ingredients: ["Salmon", "Lemon", "Dill", "Olive oil", "Garlic"],
    instructions: "Season salmon with herbs and lemon, bake until flaky, and serve with a bright pan sauce.",
    authorId: "u4",
    authorName: "Sam Carter",
    authorEmail: "sam@example.com",
    likesCount: 174,
    isFeatured: false,
    price: 5.49,
    status: "published"
  },
  {
    id: "r6",
    recipeName: "Spiced Lentil Soup",
    recipeImage: image("food/7.jpg"),
    category: "Lunch",
    cuisineType: "Middle Eastern",
    difficultyLevel: "Easy",
    preparationTime: 42,
    ingredients: ["Red lentils", "Carrot", "Cumin", "Tomato", "Cilantro"],
    instructions: "Simmer lentils with vegetables and spices, blend partially, and finish with herbs.",
    authorId: "u5",
    authorName: "Mina Karim",
    authorEmail: "mina@example.com",
    likesCount: 132,
    isFeatured: false,
    price: 2.49,
    status: "published"
  }
];

const state = {
  user: JSON.parse(localStorage.getItem("recipehub-user") || "null"),
  recipes: JSON.parse(localStorage.getItem("recipehub-recipes") || "null") || seedRecipes,
  favorites: JSON.parse(localStorage.getItem("recipehub-favorites") || "[]"),
  purchases: JSON.parse(localStorage.getItem("recipehub-purchases") || "[]"),
  reports: JSON.parse(localStorage.getItem("recipehub-reports") || "[]"),
  payments: JSON.parse(localStorage.getItem("recipehub-payments") || "[]"),
  users: JSON.parse(localStorage.getItem("recipehub-users") || "null") || [
    { id: "u-admin", name: "Admin", email: "admin@recipehub.com", image: image("chef/1.jpg"), role: "admin", isBlocked: false, isPremium: true },
    { id: "u1", name: "Ayesha Rahman", email: "ayesha@example.com", image: image("chef/2.jpg"), role: "user", isBlocked: false, isPremium: false },
    { id: "u2", name: "Marco Silva", email: "marco@example.com", image: image("chef/3.jpg"), role: "user", isBlocked: false, isPremium: true }
  ]
};

const app = document.querySelector("#app");
const navLinks = document.querySelector("#navLinks");
const toast = document.querySelector("#toast");

const save = () => {
  localStorage.setItem("recipehub-user", JSON.stringify(state.user));
  localStorage.setItem("recipehub-recipes", JSON.stringify(state.recipes));
  localStorage.setItem("recipehub-favorites", JSON.stringify(state.favorites));
  localStorage.setItem("recipehub-purchases", JSON.stringify(state.purchases));
  localStorage.setItem("recipehub-reports", JSON.stringify(state.reports));
  localStorage.setItem("recipehub-payments", JSON.stringify(state.payments));
  localStorage.setItem("recipehub-users", JSON.stringify(state.users));
};

const notify = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2400);
};

const requireAuth = () => {
  if (!state.user) {
    sessionStorage.setItem("intended-route", location.hash || "#/");
    location.hash = "#/login";
    return false;
  }
  return true;
};

const isAdmin = () => state.user?.role === "admin";
const currentUserRecipes = () => state.recipes.filter((recipe) => recipe.authorEmail === state.user?.email);

const card = (recipe) => `
  <article class="card recipe-card">
    <img src="${recipe.recipeImage}" alt="${recipe.recipeName}">
    <div class="card-body">
      <span class="pill">${recipe.category}</span>
      <h3>${recipe.recipeName}</h3>
      <div class="meta">
        <span>${recipe.cuisineType}</span>
        <span>${recipe.preparationTime} min</span>
        <span>${recipe.difficultyLevel}</span>
      </div>
      <p>${recipe.instructions.slice(0, 88)}...</p>
      <div class="action-row">
        <a class="button button-small" href="#/recipes/${recipe.id}">View Details</a>
        <button class="button-ghost button-small" data-favorite="${recipe.id}">Favorite</button>
      </div>
    </div>
  </article>
`;

const renderHome = () => {
  const featured = state.recipes.filter((recipe) => recipe.isFeatured).slice(0, 3);
  const popular = [...state.recipes].sort((a, b) => b.likesCount - a.likesCount).slice(0, 3);
  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Recipe sharing platform</p>
        <h1>RecipeHub</h1>
        <p class="lead">Create recipes, discover dishes from other cooks, save favorites, report issues, and unlock premium publishing when your recipe notebook outgrows the free plan.</p>
        <div class="hero-actions">
          <a class="button" href="#/recipes">Browse Recipes</a>
          <a class="button-outline" href="#/dashboard/add">Add Recipe</a>
        </div>
      </div>
      <div class="hero-media">
        <img src="${image("BG/1.jpg")}" alt="Prepared dishes on a table">
        <div class="hero-stat">
          <span class="pill">Community</span>
          <h3>${state.recipes.length}+ published recipes</h3>
          <p>Curated, liked, purchased, and reported through a single dashboard experience.</p>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="section-header">
        <div>
          <p class="eyebrow">Admin selected</p>
          <h2>Featured Recipes</h2>
        </div>
        <a class="button-outline" href="#/recipes">See all</a>
      </div>
      <div class="grid grid-3">${featured.map(card).join("")}</div>
    </section>
    <section class="section">
      <div class="section-header">
        <div>
          <p class="eyebrow">Most loved</p>
          <h2>Popular Recipes</h2>
        </div>
      </div>
      <div class="grid grid-3">
        ${popular.map((recipe) => `
          <article class="card">
            <div class="card-body">
              <span class="pill">${recipe.likesCount} likes</span>
              <h3>${recipe.recipeName}</h3>
              <p>By ${recipe.authorName}</p>
              <a class="button-outline button-small" href="#/recipes/${recipe.id}">Open Recipe</a>
            </div>
          </article>`).join("")}
      </div>
    </section>
    <section class="section split">
      <div>
        <p class="eyebrow">Cook with confidence</p>
        <h2>Organize every ingredient, instruction, and paid recipe.</h2>
        <p class="lead">RecipeHub keeps your own recipes, purchased recipes, favorites, and profile in one clean workspace with light and dark themes.</p>
      </div>
      <img src="${image("food/16.jpg")}" alt="Fresh meal preparation">
    </section>
    <section class="section split">
      <img src="${image("chef/4.jpg")}" alt="Chef preparing a recipe">
      <div>
        <p class="eyebrow">Premium publishing</p>
        <h2>Free users can publish two recipes. Premium users publish without limits.</h2>
        <p class="lead">The payment flow is wired for Stripe checkout on the server scaffold and mirrored in this client demo.</p>
        <a class="button" href="#/premium">Become Premium</a>
      </div>
    </section>
  `;
};

const renderBrowse = () => {
  const params = new URLSearchParams((location.hash.split("?")[1] || ""));
  const category = params.get("category") || "All";
  const cuisine = params.get("cuisine") || "All";
  const page = Number(params.get("page") || 1);
  const pageSize = 4;
  const categories = ["All", ...new Set(state.recipes.map((r) => r.category))];
  const cuisines = ["All", ...new Set(state.recipes.map((r) => r.cuisineType))];
  const filtered = state.recipes.filter((recipe) => (category === "All" || recipe.category === category) && (cuisine === "All" || recipe.cuisineType === cuisine));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  app.innerHTML = `
    <section>
      <p class="eyebrow">Browse all recipes</p>
      <h1>Discover Recipes</h1>
      <div class="filters card card-body">
        <div class="field">
          <label for="categoryFilter">Category</label>
          <select id="categoryFilter">${categories.map((item) => `<option ${item === category ? "selected" : ""}>${item}</option>`).join("")}</select>
        </div>
        <div class="field">
          <label for="cuisineFilter">Cuisine</label>
          <select id="cuisineFilter">${cuisines.map((item) => `<option ${item === cuisine ? "selected" : ""}>${item}</option>`).join("")}</select>
        </div>
        <div class="field">
          <label>Server Pagination</label>
          <button class="button-ghost" id="resetFilters">Reset Filters</button>
        </div>
        <div class="field">
          <label>Results</label>
          <strong>${filtered.length} recipes</strong>
        </div>
      </div>
      <div class="grid grid-3">${visible.map(card).join("") || `<p>No recipes found.</p>`}</div>
      <div class="action-row" style="margin-top:22px">
        <a class="button-outline ${page <= 1 ? "hidden" : ""}" href="#/recipes?category=${category}&cuisine=${cuisine}&page=${page - 1}">Previous</a>
        <span class="pill">Page ${page} of ${totalPages}</span>
        <a class="button-outline ${page >= totalPages ? "hidden" : ""}" href="#/recipes?category=${category}&cuisine=${cuisine}&page=${page + 1}">Next</a>
      </div>
    </section>
  `;
  document.querySelector("#categoryFilter").addEventListener("change", (event) => location.hash = `#/recipes?category=${event.target.value}&cuisine=${cuisine}&page=1`);
  document.querySelector("#cuisineFilter").addEventListener("change", (event) => location.hash = `#/recipes?category=${category}&cuisine=${event.target.value}&page=1`);
  document.querySelector("#resetFilters").addEventListener("click", () => location.hash = "#/recipes");
};

const renderDetails = (id) => {
  const recipe = state.recipes.find((item) => item.id === id);
  if (!recipe) return renderNotFound();
  app.innerHTML = `
    <section class="details-layout">
      <article class="details-hero">
        <img src="${recipe.recipeImage}" alt="${recipe.recipeName}">
        <div class="card-body">
          <span class="pill">${recipe.category}</span>
          <h1>${recipe.recipeName}</h1>
          <p class="lead">${recipe.instructions}</p>
          <h3>Ingredients</h3>
          <ul class="list">${recipe.ingredients.map((item) => `<li>${item}</li>`).join("")}</ul>
          <h3>Instructions</h3>
          <p class="lead">${recipe.instructions}</p>
        </div>
      </article>
      <aside class="card sticky-panel">
        <div class="card-body">
          <h3>Recipe Information</h3>
          <p><strong>Author:</strong> ${recipe.authorName}</p>
          <p><strong>Cuisine:</strong> ${recipe.cuisineType}</p>
          <p><strong>Difficulty:</strong> ${recipe.difficultyLevel}</p>
          <p><strong>Preparation:</strong> ${recipe.preparationTime} minutes</p>
          <p><strong>Likes:</strong> <span id="likeCount">${recipe.likesCount}</span></p>
          <p><strong>Price:</strong> $${recipe.price.toFixed(2)}</p>
          <div class="grid">
            <button class="button" data-purchase="${recipe.id}">Purchase Recipe</button>
            <button class="button-outline" data-like="${recipe.id}">Like Recipe</button>
            <button class="button-ghost" data-favorite="${recipe.id}">Save Favorite</button>
            <button class="button-danger" data-report-open="${recipe.id}">Report Recipe</button>
          </div>
        </div>
      </aside>
    </section>
    <div class="modal-backdrop hidden" id="reportModal">
      <form class="modal card" id="reportForm">
        <div class="card-body">
          <h2>Report Recipe</h2>
          <div class="field">
            <label for="reason">Reason</label>
            <select id="reason" required>
              <option>Spam</option>
              <option>Offensive Content</option>
              <option>Copyright Issue</option>
            </select>
          </div>
          <div class="form-actions" style="margin-top:16px">
            <button class="button" type="submit">Submit Report</button>
            <button class="button-ghost" type="button" id="closeReport">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  `;
};

const renderLogin = () => {
  app.innerHTML = `
    <section class="auth-layout card">
      <form class="card-body" id="loginForm">
        <p class="eyebrow">Welcome back</p>
        <h1>Login</h1>
        <div class="field"><label>Email</label><input name="email" type="email" value="admin@recipehub.com" required></div>
        <div class="field"><label>Password</label><input name="password" type="password" value="Admin123" required></div>
        <div class="form-actions" style="margin-top:18px">
          <button class="button" type="submit">Login</button>
          <button class="button-outline" type="button" id="googleLogin">Google Login</button>
        </div>
        <p class="lead">Demo admin: admin@recipehub.com / Admin123</p>
      </form>
    </section>
  `;
};

const renderRegister = () => {
  app.innerHTML = `
    <section class="auth-layout card">
      <form class="card-body" id="registerForm">
        <p class="eyebrow">Create account</p>
        <h1>Register</h1>
        <div class="field"><label>Name</label><input name="name" required></div>
        <div class="field"><label>Email</label><input name="email" type="email" required></div>
        <div class="field"><label>Image URL</label><input name="image" value="${image("chef/2.jpg")}" required></div>
        <div class="field"><label>Password</label><input name="password" type="password" minlength="6" required></div>
        <button class="button" style="margin-top:18px" type="submit">Create Account</button>
      </form>
    </section>
  `;
};

const renderDashboard = (tab = "overview") => {
  if (!requireAuth()) return;
  const tabs = isAdmin()
    ? [["overview", "Overview"], ["users", "Manage Users"], ["recipes", "Manage Recipes"], ["reports", "Reports"], ["transactions", "Transactions"]]
    : [["overview", "Overview"], ["my-recipes", "My Recipes"], ["add", "Add Recipe"], ["favorites", "My Favorites"], ["purchased", "Purchased Recipes"], ["profile", "Profile"]];
  app.innerHTML = `
    <section class="dashboard-grid grid">
      <aside class="card dashboard-nav">
        ${tabs.map(([key, label]) => `<button class="button-ghost ${tab === key ? "active" : ""}" data-tab="${key}">${label}</button>`).join("")}
      </aside>
      <div id="dashboardPanel"></div>
    </section>
  `;
  document.querySelectorAll("[data-tab]").forEach((button) => button.addEventListener("click", () => location.hash = `#/dashboard/${button.dataset.tab}`));
  renderDashboardPanel(tab);
};

const renderDashboardPanel = (tab) => {
  const panel = document.querySelector("#dashboardPanel");
  if (isAdmin()) return renderAdminPanel(panel, tab);
  const own = currentUserRecipes();
  const favs = state.favorites.filter((item) => item.userEmail === state.user.email);
  const purchased = state.purchases.filter((item) => item.userEmail === state.user.email);
  const likes = own.reduce((sum, recipe) => sum + recipe.likesCount, 0);

  if (tab === "overview") {
    panel.innerHTML = `
      <div class="section-header"><div><p class="eyebrow">User dashboard</p><h1>Overview</h1></div>${state.user.isPremium ? `<span class="badge">Premium Member</span>` : `<a class="button" href="#/premium">Upgrade Premium</a>`}</div>
      <div class="grid stat-grid">
        <div class="card stat"><span>Total Recipes</span><strong>${own.length}</strong></div>
        <div class="card stat"><span>Total Favorites</span><strong>${favs.length}</strong></div>
        <div class="card stat"><span>Likes Received</span><strong>${likes}</strong></div>
        <div class="card stat"><span>Plan</span><strong>${state.user.isPremium ? "Premium" : "Free"}</strong></div>
      </div>`;
  } else if (tab === "add") {
    const limited = !state.user.isPremium && own.length >= 2;
    panel.innerHTML = `
      <div class="card"><form class="card-body" id="recipeForm">
        <p class="eyebrow">Add recipe</p><h1>Publish Recipe</h1>
        ${limited ? `<p class="lead">Free users can add 2 recipes. Become premium to unlock unlimited recipes.</p><a class="button" href="#/premium">Become Premium</a>` : recipeFormFields()}
      </form></div>`;
  } else if (tab === "my-recipes") {
    panel.innerHTML = `<h1>My Recipes</h1><div class="grid grid-3">${own.map(card).join("") || `<p>No recipes added yet.</p>`}</div>`;
  } else if (tab === "favorites") {
    panel.innerHTML = `<h1>My Favorites</h1><div class="grid grid-3">${favs.map((fav) => state.recipes.find((r) => r.id === fav.recipeId)).filter(Boolean).map((recipe) => card(recipe).replace("Favorite", "Remove")).join("") || `<p>No favorites yet.</p>`}</div>`;
  } else if (tab === "purchased") {
    panel.innerHTML = `<h1>My Purchased Recipes</h1><div class="grid grid-3">${purchased.map((buy) => state.recipes.find((r) => r.id === buy.recipeId)).filter(Boolean).map(card).join("") || `<p>No purchased recipes yet.</p>`}</div>`;
  } else if (tab === "profile") {
    panel.innerHTML = profileForm();
  }
};

const recipeFormFields = (recipe = {}) => `
  <div class="grid grid-3">
    <div class="field"><label>Recipe Name</label><input name="recipeName" value="${recipe.recipeName || ""}" required></div>
    <div class="field"><label>Recipe Image URL</label><input name="recipeImage" value="${recipe.recipeImage || image("food/11.jpg")}" required></div>
    <div class="field"><label>Category</label><select name="category"><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Dessert</option><option>Snacks</option></select></div>
    <div class="field"><label>Cuisine Type</label><input name="cuisineType" value="${recipe.cuisineType || ""}" required></div>
    <div class="field"><label>Difficulty Level</label><select name="difficultyLevel"><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
    <div class="field"><label>Preparation Time</label><input name="preparationTime" type="number" min="1" value="${recipe.preparationTime || 30}" required></div>
  </div>
  <div class="field"><label>Ingredients</label><textarea name="ingredients" required>${recipe.ingredients?.join(", ") || ""}</textarea></div>
  <div class="field"><label>Instructions</label><textarea name="instructions" required>${recipe.instructions || ""}</textarea></div>
  <button class="button" type="submit">Save Recipe</button>`;

const profileForm = () => `
  <div class="card"><form class="card-body" id="profileForm">
    <p class="eyebrow">Profile</p><h1>Update Profile</h1>
    <div class="field"><label>Name</label><input name="name" value="${state.user.name}" required></div>
    <div class="field"><label>Image</label><input name="image" value="${state.user.image}" required></div>
    <button class="button" style="margin-top:18px" type="submit">Update Profile</button>
  </form></div>`;

const renderAdminPanel = (panel, tab) => {
  if (tab === "overview") {
    panel.innerHTML = `
      <h1>Admin Overview</h1>
      <div class="grid stat-grid">
        <div class="card stat"><span>Total Users</span><strong>${state.users.length}</strong></div>
        <div class="card stat"><span>Total Recipes</span><strong>${state.recipes.length}</strong></div>
        <div class="card stat"><span>Premium Members</span><strong>${state.users.filter((u) => u.isPremium).length}</strong></div>
        <div class="card stat"><span>Total Reports</span><strong>${state.reports.length}</strong></div>
      </div>`;
  } else if (tab === "users") {
    panel.innerHTML = table(["User", "Role", "Premium", "Status", "Action"], state.users.map((u) => [u.email, u.role, u.isPremium ? "Yes" : "No", u.isBlocked ? "Blocked" : "Active", `<button class="button-small button-ghost" data-block="${u.id}">${u.isBlocked ? "Unblock" : "Block"}</button>`]));
  } else if (tab === "recipes") {
    panel.innerHTML = table(["Recipe", "Author", "Featured", "Actions"], state.recipes.map((r) => [r.recipeName, r.authorEmail, r.isFeatured ? "Yes" : "No", `<button class="button-small button-ghost" data-feature="${r.id}">Feature</button> <button class="button-small button-danger" data-delete="${r.id}">Delete</button>`]));
  } else if (tab === "reports") {
    panel.innerHTML = table(["Recipe", "Reporter", "Reason", "Status", "Actions"], state.reports.map((r) => [r.recipeId, r.reporterEmail, r.reason, r.status, `<button class="button-small button-danger" data-delete="${r.recipeId}">Remove Recipe</button> <button class="button-small button-ghost" data-dismiss="${r.id}">Dismiss</button>`]));
  } else if (tab === "transactions") {
    panel.innerHTML = table(["User", "Amount", "Date", "Status", "Transaction ID"], state.payments.map((p) => [p.userEmail, `$${p.amount}`, new Date(p.paidAt).toLocaleString(), p.paymentStatus, p.transactionId]));
  }
};

const table = (heads, rows) => `
  <div class="card table-wrap"><table>
    <thead><tr>${heads.map((head) => `<th>${head}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("") || `<tr><td colspan="${heads.length}">No data found.</td></tr>`}</tbody>
  </table></div>`;

const renderPremium = () => {
  if (!requireAuth()) return;
  app.innerHTML = `
    <section class="split">
      <div>
        <p class="eyebrow">Stripe Checkout</p>
        <h1>Become Premium</h1>
        <p class="lead">Unlock unlimited recipe publishing and show a premium badge on your profile.</p>
        <button class="button" id="premiumPay">Pay $19.99</button>
      </div>
      <img src="${image("BG/2.jpg")}" alt="Premium cooking table">
    </section>`;
};

const renderPaymentSuccess = () => {
  app.innerHTML = `
    <section class="auth-layout card">
      <div class="card-body">
        <p class="eyebrow">Payment success</p>
        <h1>Premium Activated</h1>
        <p class="lead">Your transaction is saved and your account can now publish unlimited recipes.</p>
        <a class="button" href="#/dashboard">Go to Dashboard</a>
      </div>
    </section>`;
};

const renderNotFound = () => {
  app.innerHTML = `
    <section class="auth-layout">
      <div class="error-art">404</div>
      <h1>Page not found</h1>
      <p class="lead">The route you opened does not exist in RecipeHub.</p>
      <a class="button" href="#/">Back Home</a>
    </section>`;
};

const route = () => {
  app.innerHTML = `<div class="loader"></div>`;
  window.setTimeout(() => {
    const [path] = (location.hash || "#/").split("?");
    const segments = path.replace("#/", "").split("/").filter(Boolean);
    if (!segments.length) renderHome();
    else if (segments[0] === "recipes" && segments[1]) renderDetails(segments[1]);
    else if (segments[0] === "recipes") renderBrowse();
    else if (segments[0] === "login") renderLogin();
    else if (segments[0] === "register") renderRegister();
    else if (segments[0] === "dashboard") renderDashboard(segments[1] || "overview");
    else if (segments[0] === "profile") renderDashboard("profile");
    else if (segments[0] === "premium") renderPremium();
    else if (segments[0] === "payment-success") renderPaymentSuccess();
    else renderNotFound();
    bindPageEvents();
    syncNav();
    app.focus();
  }, 180);
};

const bindPageEvents = () => {
  document.querySelectorAll("[data-like]").forEach((button) => button.addEventListener("click", () => {
    const recipe = state.recipes.find((item) => item.id === button.dataset.like);
    recipe.likesCount += 1;
    save();
    document.querySelector("#likeCount").textContent = recipe.likesCount;
    notify("Recipe liked.");
  }));

  document.querySelectorAll("[data-favorite]").forEach((button) => button.addEventListener("click", () => {
    if (!requireAuth()) return;
    const recipeId = button.dataset.favorite;
    const exists = state.favorites.some((item) => item.recipeId === recipeId && item.userEmail === state.user.email);
    state.favorites = exists ? state.favorites.filter((item) => !(item.recipeId === recipeId && item.userEmail === state.user.email)) : [...state.favorites, { id: crypto.randomUUID(), recipeId, userEmail: state.user.email, userId: state.user.id, addedAt: new Date().toISOString() }];
    save();
    notify(exists ? "Favorite removed." : "Recipe saved to favorites.");
    if (location.hash.includes("favorites")) route();
  }));

  document.querySelectorAll("[data-purchase]").forEach((button) => button.addEventListener("click", () => {
    if (!requireAuth()) return;
    const recipe = state.recipes.find((item) => item.id === button.dataset.purchase);
    state.purchases.push({ id: crypto.randomUUID(), recipeId: recipe.id, userEmail: state.user.email, paidAt: new Date().toISOString() });
    state.payments.push({ id: crypto.randomUUID(), userEmail: state.user.email, userId: state.user.id, amount: recipe.price, recipeId: recipe.id, transactionId: `txn_${Date.now()}`, paymentStatus: "paid", paidAt: new Date().toISOString() });
    save();
    notify("Recipe purchased successfully.");
  }));

  document.querySelector("[data-report-open]")?.addEventListener("click", () => {
    if (!requireAuth()) return;
    document.querySelector("#reportModal").classList.remove("hidden");
  });
  document.querySelector("#closeReport")?.addEventListener("click", () => document.querySelector("#reportModal").classList.add("hidden"));
  document.querySelector("#reportForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    state.reports.push({ id: crypto.randomUUID(), recipeId: document.querySelector("[data-report-open]").dataset.reportOpen, reporterEmail: state.user.email, reason: event.target.reason.value, status: "pending", createdAt: new Date().toISOString() });
    save();
    document.querySelector("#reportModal").classList.add("hidden");
    notify("Report submitted.");
  });

  document.querySelector("#loginForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    let user = state.users.find((item) => item.email === email);
    if (!user) user = { id: crypto.randomUUID(), name: email.split("@")[0], email, image: image("chef/1.jpg"), role: "user", isBlocked: false, isPremium: false };
    if (user.isBlocked) return notify("This account is blocked.");
    state.user = user;
    save();
    location.hash = sessionStorage.getItem("intended-route") || "#/";
  });
  document.querySelector("#googleLogin")?.addEventListener("click", () => {
    state.user = state.users[1];
    save();
    location.hash = sessionStorage.getItem("intended-route") || "#/";
  });
  document.querySelector("#registerForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const password = event.target.password.value;
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) return notify("Password needs uppercase and lowercase letters.");
    const user = { id: crypto.randomUUID(), name: event.target.name.value, email: event.target.email.value, image: event.target.image.value, role: "user", isBlocked: false, isPremium: false };
    state.users.push(user);
    state.user = user;
    save();
    location.hash = "#/dashboard";
  });
  document.querySelector("#recipeForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    state.recipes.unshift({
      id: crypto.randomUUID(),
      recipeName: data.get("recipeName"),
      recipeImage: data.get("recipeImage"),
      category: data.get("category"),
      cuisineType: data.get("cuisineType"),
      difficultyLevel: data.get("difficultyLevel"),
      preparationTime: Number(data.get("preparationTime")),
      ingredients: data.get("ingredients").split(",").map((item) => item.trim()).filter(Boolean),
      instructions: data.get("instructions"),
      authorId: state.user.id,
      authorName: state.user.name,
      authorEmail: state.user.email,
      likesCount: 0,
      isFeatured: false,
      price: 1.99,
      status: "published"
    });
    save();
    notify("Recipe published.");
    location.hash = "#/dashboard/my-recipes";
  });
  document.querySelector("#profileForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    state.user.name = event.target.name.value;
    state.user.image = event.target.image.value;
    const user = state.users.find((item) => item.id === state.user.id);
    if (user) Object.assign(user, state.user);
    save();
    notify("Profile updated.");
  });
  document.querySelector("#premiumPay")?.addEventListener("click", () => {
    state.user.isPremium = true;
    const user = state.users.find((item) => item.id === state.user.id);
    if (user) user.isPremium = true;
    state.payments.push({ id: crypto.randomUUID(), userEmail: state.user.email, userId: state.user.id, amount: 19.99, transactionId: `txn_${Date.now()}`, paymentStatus: "paid", paidAt: new Date().toISOString() });
    save();
    location.hash = "#/payment-success";
  });
  document.querySelectorAll("[data-feature]").forEach((button) => button.addEventListener("click", () => {
    const recipe = state.recipes.find((item) => item.id === button.dataset.feature);
    recipe.isFeatured = !recipe.isFeatured;
    save();
    route();
  }));
  document.querySelectorAll("[data-delete]").forEach((button) => button.addEventListener("click", () => {
    state.recipes = state.recipes.filter((item) => item.id !== button.dataset.delete);
    save();
    route();
  }));
  document.querySelectorAll("[data-block]").forEach((button) => button.addEventListener("click", () => {
    const user = state.users.find((item) => item.id === button.dataset.block);
    user.isBlocked = !user.isBlocked;
    save();
    route();
  }));
  document.querySelectorAll("[data-dismiss]").forEach((button) => button.addEventListener("click", () => {
    state.reports = state.reports.map((item) => item.id === button.dataset.dismiss ? { ...item, status: "dismissed" } : item);
    save();
    route();
  }));
};

const syncNav = () => {
  document.querySelectorAll(".nav-links a").forEach((link) => link.classList.toggle("active", link.getAttribute("href") === (location.hash || "#/")));
  document.querySelectorAll("[data-auth-link]").forEach((item) => item.classList.toggle("hidden", !state.user));
  document.querySelectorAll("[data-guest-link]").forEach((item) => item.classList.toggle("hidden", !!state.user));
};

document.querySelector("#navToggle").addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  document.querySelector("#navToggle").setAttribute("aria-expanded", String(isOpen));
});

document.querySelector("#themeToggle").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("recipehub-theme", next);
  document.querySelector("#themeToggle").textContent = next === "dark" ? "Dark" : "Light";
});

document.documentElement.dataset.theme = localStorage.getItem("recipehub-theme") || "light";
document.querySelector("#themeToggle").textContent = document.documentElement.dataset.theme === "dark" ? "Dark" : "Light";
window.addEventListener("hashchange", route);
route();
