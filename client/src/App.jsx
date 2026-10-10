import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ChefHat, Flame, Heart, Moon, Search, ShieldCheck, ShoppingCart, Sparkles, Sun, User, Menu, LogOut } from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const api = axios.create({ baseURL: API_URL, withCredentials: true });

const AuthContext = createContext();

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('recipehub-theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('recipehub-theme', theme);
  }, [theme]);

  return (
    <AuthProvider>
      <div className="app-shell">
        <SiteNav theme={theme} setTheme={setTheme} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} />
            <Route path="/dashboard/recipes" element={<ProtectedRoute><MyRecipesPage /></ProtectedRoute>} />
            <Route path="/dashboard/add-recipe" element={<ProtectedRoute><AddRecipePage /></ProtectedRoute>} />
            <Route path="/dashboard/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
            <Route path="/dashboard/purchased" element={<ProtectedRoute><PurchasedPage /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminOverviewPage /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
            <Route path="/admin/recipes" element={<AdminRoute><AdminRecipesPage /></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
            <Route path="/admin/transactions" element={<AdminRoute><AdminTransactionsPage /></AdminRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const { data } = await api.get('/api/profile');
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const value = useMemo(() => ({ user, setUser, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div className="page-shell loading-box">Loading your kitchen...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="page-shell loading-box">Loading admin access...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function SiteNav({ theme, setTheme }) {
  const { user, setUser } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.post('/api/auth/sign-out');
    setUser(null);
    navigate('/');
  };

  return (
    <header className="topbar">
      <div className="container nav-wrap">
        <Link to="/" className="brand">
          <ChefHat size={20} />
          RecipeHub
        </Link>
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/">Home</Link>
          <Link to="/recipes">Browse Recipes</Link>
          <Link to="/dashboard">Dashboard</Link>
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
          {user ? (
            <>
              <Link to="/dashboard/add-recipe">Share Recipe</Link>
              <button type="button" className="nav-button" onClick={handleLogout}><LogOut size={16} /> Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="pill-button">Join Free</Link>
            </>
          )}
          <button type="button" className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </nav>
        <button className="menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}

function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    api.get('/api/recipes/featured').then(({ data }) => setFeatured(data.items || [])).catch(() => {});
    api.get('/api/recipes/popular').then(({ data }) => setPopular(data.items || [])).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero-section container">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="hero-copy">
          <span className="eyebrow">Fresh ideas for every table</span>
          <h1>Discover recipes worth repeating.</h1>
          <p>RecipeHub brings together cooks, food lovers, and home chefs to share vibrant meals, helpful tips, and kitchen inspiration.</p>
          <div className="hero-actions">
            <Link to="/recipes" className="primary-button">Browse recipes</Link>
            <Link to="/dashboard/add-recipe" className="secondary-button">Share a recipe</Link>
          </div>
          <div className="hero-metrics">
            <div><strong>12k+</strong><span>community recipes</span></div>
            <div><strong>4.9/5</strong><span>average rating</span></div>
            <div><strong>2min</strong><span>to start cooking</span></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="hero-visual">
          <img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80" alt="A gourmet recipe spread" />
        </motion.div>
      </section>

      <section className="container section-block">
        <div className="section-heading">
          <span className="eyebrow">Featured recipes</span>
          <h2>Trending this week</h2>
        </div>
        <div className="recipe-grid">
          {featured.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>

      <section className="container section-block alt-panel">
        <div className="section-heading">
          <span className="eyebrow">Most liked</span>
          <h2>Popular in the community</h2>
        </div>
        <div className="recipe-grid compact-grid">
          {popular.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} compact />
          ))}
        </div>
      </section>

      <section className="container section-block">
        <div className="three-column">
          <div className="info-card">
            <Sparkles size={26} />
            <h3>Explore by cuisine</h3>
            <p>From comforting classics to vibrant street food, there is always a new flavor to try.</p>
          </div>
          <div className="info-card">
            <Flame size={26} />
            <h3>Cook with confidence</h3>
            <p>Clear instructions, smart ingredients, and trusted community feedback create a better kitchen experience.</p>
          </div>
          <div className="info-card">
            <Heart size={26} />
            <h3>Share your favorites</h3>
            <p>Save recipes, recommend your go-tos, and keep your dinner inspiration fresh.</p>
          </div>
        </div>
      </section>
    </>
  );
}

function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const fetchRecipes = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/recipes', {
        params: { page, limit: 8, search, category, cuisine, difficulty },
      });
      setRecipes(data.items || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (error) {
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [search, category, cuisine, difficulty]);

  return (
    <div className="container page-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">Recipe explorer</span>
          <h2>Find your next favorite meal</h2>
        </div>
      </div>
      <div className="filter-row">
        <div className="search-box"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search recipes" /></div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option><option value="Dinner">Dinner</option><option value="Lunch">Lunch</option><option value="Breakfast">Breakfast</option></select>
        <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}><option value="">All cuisines</option><option value="Mediterranean">Mediterranean</option><option value="Italian">Italian</option><option value="Middle Eastern">Middle Eastern</option></select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option value="">All difficulties</option><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option></select>
      </div>
      {loading ? <div className="loading-box">Loading recipes...</div> : (
        <>
          <div className="recipe-grid">
            {recipes.length === 0 ? <div className="empty-state">No recipes match your search yet.</div> : recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
          </div>
          <div className="pagination-row">
            <button type="button" disabled={pagination.page <= 1} onClick={() => fetchRecipes(pagination.page - 1)}>Previous</button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchRecipes(pagination.page + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

function RecipeDetailPage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [canAccess, setCanAccess] = useState(false);
  const [reportReason, setReportReason] = useState('Spam');
  const [reportMessage, setReportMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const loadRecipe = async () => {
    try {
      const { data } = await api.get(`/api/recipes/${id}`);
      setRecipe(data.recipe);
      setCanAccess(!!data.canAccess);
    } catch (error) {
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const handleLike = async () => {
    if (!user) return navigate('/login');
    const { data } = await api.post(`/api/recipes/${id}/like`);
    setRecipe((current) => ({ ...current, likesCount: data.likesCount }));
  };

  const handleFavorite = async () => {
    if (!user) return navigate('/login');
    const { data } = await api.post(`/api/recipes/${id}/favorite`);
    alert(data.message);
  };

  const handlePurchase = async () => {
    if (!user) return navigate('/login');
    const { data } = await api.post('/api/payments/checkout', { type: 'recipe', recipeId: id });
    if (data.checkoutUrl) window.location.assign(data.checkoutUrl);
  };

  const handleReport = async () => {
    if (!user) return navigate('/login');
    try {
      await api.post(`/api/recipes/${id}/report`, { reason: reportReason });
      setReportMessage('Report submitted.');
    } catch (error) {
      setReportMessage(error.response?.data?.message || 'Unable to submit report.');
    }
  };

  if (loading) return <div className="page-shell container loading-box">Loading recipe...</div>;
  if (!recipe) return <div className="page-shell container empty-state">Recipe not found.</div>;

  return (
    <div className="container page-shell recipe-detail">
      <div className="detail-media">
        <img src={recipe.recipeImage} alt={recipe.recipeName} />
      </div>
      <div className="detail-info">
        <span className="eyebrow">{recipe.category} • {recipe.cuisineType}</span>
        <h2>{recipe.recipeName}</h2>
        <p className="meta-line">By {recipe.authorName} • {recipe.difficultyLevel} • {recipe.preparationTime}</p>
        <div className="detail-actions">
          <button type="button" className="primary-button" onClick={handleLike}>❤ {recipe.likesCount || 0}</button>
          <button type="button" className="secondary-button" onClick={handleFavorite}>Save favorite</button>
          {recipe.isPaid && !canAccess && <button type="button" className="primary-button" onClick={handlePurchase}>Purchase ${recipe.purchasePrice || 19}</button>}
          {recipe.isPaid && canAccess && <span className="meta-line">Recipe unlocked</span>}
          <select aria-label="Report reason" value={reportReason} onChange={(event) => setReportReason(event.target.value)}>
            <option>Spam</option><option>Offensive Content</option><option>Copyright Issue</option>
          </select>
          <button type="button" className="secondary-button" onClick={handleReport}>Report</button>
        </div>
        {reportMessage && <p role="status">{reportMessage}</p>}
        {canAccess ? <div className="detail-card">
          <h3>Ingredients</h3>
          <ul>
            {recipe.ingredients?.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
          </ul>
        </div> : <div className="detail-card"><h3>Recipe locked</h3><p>Purchase this recipe to view its ingredients and instructions.</p></div>}
        {canAccess && <div className="detail-card">
          <h3>Instructions</h3>
          <ol>
            {recipe.instructions?.map((instruction) => <li key={instruction}>{instruction}</li>)}
          </ol>
        </div>}
      </div>
    </div>
  );
}

function AuthPage({ mode }) {
  const [values, setValues] = useState({ name: '', email: '', password: '', image: '' });
  const [message, setMessage] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const endpoint = mode === 'login' ? '/api/auth/sign-in/email' : '/api/auth/sign-up/email';
      const payload = mode === 'login'
        ? { email: values.email, password: values.password }
        : { name: values.name, email: values.email, password: values.password, image: values.image || undefined };
      await api.post(endpoint, { ...payload, callbackURL: window.location.origin });
      const { data } = await api.get('/api/profile');
      setUser(data.user);
      const nextPath = location.state?.from || '/';
      navigate(nextPath, { replace: true });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Authentication failed.');
    }
  };

  const onGoogleSignIn = async () => {
    setMessage('');
    try {
      const { data } = await api.post('/api/auth/sign-in/social', {
        provider: 'google',
        callbackURL: `${window.location.origin}${location.state?.from || '/'}`,
      });
      if (data.url) window.location.assign(data.url);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Google sign-in is not configured.');
    }
  };

  return (
    <div className="container page-shell auth-shell">
      <div className="auth-card">
        <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <form onSubmit={onSubmit} className="stack-form">
          {mode === 'register' && (
            <>
              <input placeholder="Name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
              <input placeholder="Image URL" value={values.image} onChange={(e) => setValues({ ...values, image: e.target.value })} />
            </>
          )}
          <input type="email" placeholder="Email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
          <input type="password" placeholder="Password" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} />
          {message && <p className="error-text">{message}</p>}
          <button type="submit" className="primary-button full-width">{mode === 'login' ? 'Log in' : 'Register'}</button>
        </form>
        <p className="subtle-link">{mode === 'login' ? 'Need an account?' : 'Already a member?'} <Link to={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Create one' : 'Log in'}</Link></p>
        <button type="button" className="secondary-button full-width" onClick={onGoogleSignIn}>Continue with Google</button>
      </div>
    </div>
  );
}

function DashboardLayout() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalRecipes: 0, totalFavorites: 0, totalLikesReceived: 0, isPremium: false });

  useEffect(() => {
    api.get('/api/dashboard').then(({ data }) => setStats(data.stats || {})).catch(() => {});
  }, []);

  return (
    <div className="container page-shell dashboard-shell">
      <div className="dashboard-sidebar">
        <Link to="/dashboard">Overview</Link>
        <Link to="/dashboard/recipes">My Recipes</Link>
        <Link to="/dashboard/add-recipe">Add Recipe</Link>
        <Link to="/dashboard/favorites">Favorites</Link>
        <Link to="/dashboard/purchased">Purchased</Link>
        <Link to="/dashboard/profile">Profile</Link>
      </div>
      <div className="dashboard-content">
        <h2>Welcome, {user?.name}</h2>
        <div className="stats-grid">
          <StatCard label="Recipes" value={stats.totalRecipes} />
          <StatCard label="Favorites" value={stats.totalFavorites} />
          <StatCard label="Likes received" value={stats.totalLikesReceived} />
          <StatCard label="Membership" value={stats.isPremium ? 'Premium' : 'Standard'} />
        </div>
      </div>
    </div>
  );
}

function MyRecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const { user } = useContext(AuthContext);

  const loadRecipes = async () => {
    if (!user) return;
    const { data } = await api.get(`/api/users/${user.id}/recipes`);
    setRecipes(data.items || []);
  };

  useEffect(() => { loadRecipes().catch(() => setMessage('Unable to load your recipes.')); }, [user]);

  const deleteRecipe = async (id) => {
    try {
      await api.delete(`/api/recipes/${id}`);
      await loadRecipes();
      setMessage('Recipe deleted.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to delete recipe.');
    }
  };

  const saveRecipe = async () => {
    try {
      await api.put(`/api/recipes/${editing.id}`, { recipeName: editing.recipeName, recipeImage: editing.recipeImage });
      setEditing(null);
      await loadRecipes();
      setMessage('Recipe updated.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update recipe.');
    }
  };

  return (
    <div className="container page-shell"><h2>My Recipes</h2>{message && <p role="status">{message}</p>}<div className="recipe-grid">{recipes.length ? recipes.map((recipe) => <div className="owned-recipe" key={recipe.id}><RecipeCard recipe={recipe} />{editing?.id === recipe.id ? <div className="stack-form"><input aria-label="Recipe name" value={editing.recipeName} onChange={(event) => setEditing({ ...editing, recipeName: event.target.value })} /><input aria-label="Recipe image URL" value={editing.recipeImage} onChange={(event) => setEditing({ ...editing, recipeImage: event.target.value })} /><button type="button" className="primary-button" onClick={saveRecipe}>Save</button><button type="button" className="secondary-button" onClick={() => setEditing(null)}>Cancel</button></div> : <div className="detail-actions"><button type="button" className="secondary-button" onClick={() => setEditing({ id: recipe.id, recipeName: recipe.recipeName, recipeImage: recipe.recipeImage })}>Edit</button><button type="button" className="secondary-button" onClick={() => deleteRecipe(recipe.id)}>Delete</button></div>}</div>) : <div className="empty-state">No recipes yet.</div>}</div></div>
  );
}

function AddRecipePage() {
  const [form, setForm] = useState({ recipeName: '', recipeImage: '', category: 'Dinner', cuisineType: 'Mediterranean', difficultyLevel: 'Easy', preparationTime: '30 mins', ingredients: '', instructions: '', isPaid: true, purchasePrice: 19 });
  const [message, setMessage] = useState('');

  const submitRecipe = async (event) => {
    event.preventDefault();
    try {
      await api.post('/api/recipes', {
        ...form,
        purchasePrice: Number(form.purchasePrice),
        ingredients: form.ingredients.split('\n').filter(Boolean),
        instructions: form.instructions.split('\n').filter(Boolean),
      });
      setMessage('Recipe created successfully.');
      setForm({ ...form, recipeName: '', recipeImage: '', ingredients: '', instructions: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to create recipe.');
    }
  };

  return (
    <div className="container page-shell auth-card">
      <h2>Add a new recipe</h2>
      <form onSubmit={submitRecipe} className="stack-form">
        <input value={form.recipeName} onChange={(e) => setForm({ ...form, recipeName: e.target.value })} placeholder="Recipe name" />
        <input value={form.recipeImage} onChange={(e) => setForm({ ...form, recipeImage: e.target.value })} placeholder="Recipe image URL" />
        <div className="two-col">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="Dinner">Dinner</option><option value="Lunch">Lunch</option><option value="Breakfast">Breakfast</option></select>
          <select value={form.cuisineType} onChange={(e) => setForm({ ...form, cuisineType: e.target.value })}><option value="Mediterranean">Mediterranean</option><option value="Italian">Italian</option><option value="Middle Eastern">Middle Eastern</option></select>
        </div>
        <div className="two-col">
          <select value={form.difficultyLevel} onChange={(e) => setForm({ ...form, difficultyLevel: e.target.value })}><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option></select>
          <input value={form.preparationTime} onChange={(e) => setForm({ ...form, preparationTime: e.target.value })} placeholder="Preparation time" />
        </div>
        <div className="two-col">
          <label><input type="checkbox" checked={form.isPaid} onChange={(e) => setForm({ ...form, isPaid: e.target.checked })} /> Paid recipe</label>
          {form.isPaid && <input type="number" min="0" max="10000" step="0.01" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} aria-label="Recipe price in US dollars" />}
        </div>
        <textarea rows="5" value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} placeholder="One ingredient per line" />
        <textarea rows="5" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="One instruction per line" />
        {message && <p className="error-text">{message}</p>}
        <button type="submit" className="primary-button full-width">Create recipe</button>
      </form>
    </div>
  );
}

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return;
    api.get(`/api/users/${user.id}/favorites`).then(({ data }) => setFavorites(data.items || [])).catch(() => {});
  }, [user]);

  return <div className="container page-shell"><h2>Favorites</h2>{favorites.length ? <div className="recipe-grid">{favorites.map((item) => <RecipeCard key={item.recipeId} recipe={item.recipe} />)}</div> : <div className="empty-state">No favorites saved yet.</div>}</div>;
}

function PurchasedPage() {
  const { user, setUser } = useContext(AuthContext);
  const [purchases, setPurchases] = useState([]);
  const [message, setMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    const sessionId = new URLSearchParams(location.search).get('session_id');
    const loadPurchases = () => api.get(`/api/users/${user.id}/purchases`).then(({ data }) => setPurchases(data.items || []));
    if (!sessionId) {
      loadPurchases().catch(() => setMessage('Unable to load your purchases.'));
      return;
    }
    api.post('/api/payments/verify', { sessionId })
      .then(async () => {
        await loadPurchases();
        const { data } = await api.get('/api/profile');
        setUser(data.user);
        setMessage('Payment verified successfully.');
      })
      .catch((error) => setMessage(error.response?.data?.message || 'Payment verification is still pending.'));
  }, [user, location.search, setUser]);

  return <div className="container page-shell"><h2>Purchased recipes</h2>{message && <p role="status">{message}</p>}{purchases.length ? <div className="recipe-grid">{purchases.map((item) => <div key={item.id} className="mini-card"><h4>{item.type === 'premium' ? 'Premium membership' : 'Recipe purchase'}</h4><p>{item.paymentStatus}</p><p>${item.amount}</p></div>)}</div> : <div className="empty-state">No purchases yet.</div>}</div>;
}

function ProfilePage() {
  const { user, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ name: user?.name || '', image: user?.image || '' });
  const [message, setMessage] = useState('');

  const saveProfile = async () => {
    const { data } = await api.put('/api/profile', form);
    setUser(data.user);
  };

  const upgradeToPremium = async () => {
    try {
      const { data } = await api.post('/api/payments/checkout', { type: 'premium' });
      if (data.checkoutUrl) window.location.assign(data.checkoutUrl);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to start Premium checkout.');
    }
  };

  return (
    <div className="container page-shell auth-card">
      <h2>Your profile</h2>
      <div className="stack-form">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <p>Email: {user?.email}</p>
        <p>Premium: {user?.isPremium ? 'Yes' : 'No'}</p>
        {message && <p className="error-text">{message}</p>}
        <button type="button" className="primary-button" onClick={saveProfile}>Save profile</button>
        {!user?.isPremium && <button type="button" className="secondary-button" onClick={upgradeToPremium}>Upgrade to Premium · $29</button>}
      </div>
    </div>
  );
}

function AdminOverviewPage() {
  const [stats, setStats] = useState({ totalUsers: 0, totalRecipes: 0, totalPremiumMembers: 0, totalReports: 0 });
  useEffect(() => {
    api.get('/api/admin/dashboard').then(({ data }) => setStats(data.stats || {})).catch(() => {});
  }, []);

  return <div className="container page-shell"><h2>Admin Overview</h2><div className="stats-grid"><StatCard label="Users" value={stats.totalUsers} /><StatCard label="Recipes" value={stats.totalRecipes} /><StatCard label="Premium" value={stats.totalPremiumMembers} /><StatCard label="Reports" value={stats.totalReports} /></div></div>;
}

function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    const { data } = await api.get('/api/admin/users');
    setUsers(data.items || []);
  };

  useEffect(() => { loadUsers(); }, []);

  return <div className="container page-shell"><h2>Users</h2>{users.map((user) => <div className="mini-card" key={user.id}><p>{user.name}</p><p>{user.email}</p><button type="button" className="secondary-button" onClick={() => api.patch(`/api/admin/users/${user.id}/block`, { blocked: !user.isBlocked }).then(() => loadUsers())}>Toggle block</button></div>)}</div>;
}

function AdminRecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [message, setMessage] = useState('');
  const loadRecipes = async () => {
    const { data } = await api.get('/api/admin/recipes');
    setRecipes(data.items || []);
  };
  useEffect(() => { loadRecipes().catch(() => setMessage('Unable to load recipes.')); }, []);
  const updateRecipe = async (recipe, changes) => {
    try {
      const { data } = await api.patch(`/api/admin/recipes/${recipe.id}/${changes.featured !== undefined ? 'feature' : 'status'}`, changes);
      setRecipes((current) => current.map((item) => item.id === recipe.id ? data.recipe : item));
      setMessage('Recipe updated.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update recipe.');
    }
  };
  return <div className="container page-shell"><h2>Recipes</h2>{message && <p role="status">{message}</p>}{recipes.map((recipe) => <div className="mini-card" key={recipe.id}><p>{recipe.recipeName}</p><p>{recipe.status}</p><button type="button" className="secondary-button" onClick={() => updateRecipe(recipe, { featured: !recipe.isFeatured })}>{recipe.isFeatured ? 'Remove featured' : 'Feature'}</button><button type="button" className="secondary-button" onClick={() => updateRecipe(recipe, { status: recipe.status === 'published' ? 'hidden' : 'published' })}>{recipe.status === 'published' ? 'Hide' : 'Restore'}</button></div>)}</div>;
}

function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState('');
  const loadReports = async () => {
    const { data } = await api.get('/api/admin/reports');
    setReports(data.items || []);
  };
  useEffect(() => { loadReports().catch(() => setMessage('Unable to load reports.')); }, []);
  const updateReport = async (report, status) => {
    try {
      const { data } = await api.patch(`/api/admin/reports/${report.id}`, { status });
      setReports((current) => current.map((item) => item.id === report.id ? data.report : item));
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update report.');
    }
  };
  return <div className="container page-shell"><h2>Reports</h2>{message && <p role="status">{message}</p>}{reports.map((report) => <div className="mini-card" key={report.id}><p>{report.reason}</p><p>{report.status}</p><p>Recipe: {report.recipeId}</p>{report.status === 'pending' && <div className="detail-actions"><button type="button" className="secondary-button" onClick={() => updateReport(report, 'resolved')}>Resolve</button><button type="button" className="secondary-button" onClick={() => updateReport(report, 'dismissed')}>Dismiss</button></div>}</div>)}</div>;
}

function AdminTransactionsPage() {
  const [payments, setPayments] = useState([]);
  useEffect(() => { api.get('/api/admin/transactions').then(({ data }) => setPayments(data.items || [])).catch(() => {}); }, []);
  return <div className="container page-shell"><h2>Transactions</h2>{payments.map((payment) => <div className="mini-card" key={payment.id}><p>{payment.userEmail}</p><p>{payment.paymentStatus}</p><p>${payment.amount}</p></div>)}</div>;
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RecipeCard({ recipe, compact = false }) {
  if (!recipe) return null;

  return (
    <article className={`recipe-card ${compact ? 'compact' : ''}`}>
      <img src={recipe.recipeImage} alt={recipe.recipeName} />
      <div className="card-body">
        <div className="meta-row">
          <span>{recipe.category}</span>
          <span>{recipe.cuisineType}</span>
        </div>
        <h3>{recipe.recipeName}</h3>
        <p>{recipe.preparationTime}</p>
        <div className="card-footer">
          <span>❤ {recipe.likesCount || 0}</span>
          <Link to={`/recipes/${recipe.id}`}>View details</Link>
        </div>
      </div>
    </article>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>RecipeHub</h3>
          <p>Thoughtful recipes for everyday cooking.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/recipes">Browse recipes</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <p>hello@recipehub.app</p>
          <p>On the web</p>
        </div>
      </div>
    </footer>
  );
}

function NotFoundPage() {
  return (
    <div className="container page-shell empty-state">
      <h2>Page not found</h2>
      <p>The recipe you searched for isn't here.</p>
      <Link to="/" className="primary-button">Back home</Link>
    </div>
  );
}

export default App;
