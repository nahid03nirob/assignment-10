import recipeOne from '../../Image/Recipe/1.jpg';
import recipeTwo from '../../Image/Recipe/2.jpg';
import recipeThree from '../../Image/Recipe/3.jpg';
import recipeFour from '../../Image/Recipe/4.jpg';
import recipeFive from '../../Image/Recipe/5.jpg';
import foodSeven from '../../Image/food/7.jpg';
import chefOne from '../../Image/chef/1.jpg';
import chefTwo from '../../Image/chef/2.jpg';

export const recipes = [
  {
    id: 'r1',
    name: 'Smoky Chicken Biryani',
    image: recipeOne,
    category: 'Dinner',
    cuisine: 'Bangladeshi',
    difficulty: 'Medium',
    time: 75,
    ingredients: ['Basmati rice', 'Chicken', 'Yogurt', 'Fried onion', 'Biryani spice'],
    instructions: 'Marinate the chicken with yogurt and spices, cook until tender, layer with rice and steam until fragrant.',
    author: 'Ayesha Rahman',
    likes: 184,
    featured: true,
    price: 4.99,
    description: 'A fragrant, layered biryani for family dinners and special gatherings.'
  },
  {
    id: 'r2',
    name: 'Creamy Garlic Pasta',
    image: recipeTwo,
    category: 'Lunch',
    cuisine: 'Italian',
    difficulty: 'Easy',
    time: 28,
    ingredients: ['Pasta', 'Garlic', 'Cream', 'Parmesan', 'Parsley'],
    instructions: 'Boil pasta, create a rich garlic cream sauce, toss together and finish with herbs.',
    author: 'Marco Silva',
    likes: 221,
    featured: true,
    price: 2.99,
    description: 'A quick comfort meal with silky sauce and a restaurant-style finish.'
  },
  {
    id: 'r3',
    name: 'Crispy Veggie Tacos',
    image: recipeThree,
    category: 'Snacks',
    cuisine: 'Mexican',
    difficulty: 'Easy',
    time: 35,
    ingredients: ['Tortillas', 'Beans', 'Corn', 'Avocado', 'Lime'],
    instructions: 'Warm tortillas, fill with spiced beans and vegetables and finish with avocado and lime.',
    author: 'Nora Diaz',
    likes: 146,
    featured: false,
    price: 1.99,
    description: 'Crunchy, colorful tacos that are bright and filling for any time of day.'
  },
  {
    id: 'r4',
    name: 'Mango Coconut Pudding',
    image: recipeFour,
    category: 'Dessert',
    cuisine: 'Thai',
    difficulty: 'Easy',
    time: 20,
    ingredients: ['Mango', 'Coconut milk', 'Sugar', 'Gelatin', 'Mint'],
    instructions: 'Blend mango, simmer coconut milk, set with gelatin and chill before serving.',
    author: 'Ayesha Rahman',
    likes: 199,
    featured: true,
    price: 3.49,
    description: 'A silky dessert with tropical flavor and a smooth creamy texture.'
  },
  {
    id: 'r5',
    name: 'Lemon Herb Salmon',
    image: recipeFive,
    category: 'Dinner',
    cuisine: 'Mediterranean',
    difficulty: 'Medium',
    time: 32,
    ingredients: ['Salmon', 'Lemon', 'Dill', 'Olive oil', 'Garlic'],
    instructions: 'Season salmon, bake until flaky and serve with bright lemon herb sauce.',
    author: 'Sam Carter',
    likes: 174,
    featured: false,
    price: 5.49,
    description: 'A light, elegant dinner that is fast enough for weeknights.'
  },
  {
    id: 'r6',
    name: 'Spiced Lentil Soup',
    image: foodSeven,
    category: 'Lunch',
    cuisine: 'Middle Eastern',
    difficulty: 'Easy',
    time: 42,
    ingredients: ['Red lentils', 'Carrot', 'Cumin', 'Tomato', 'Cilantro'],
    instructions: 'Simmer lentils with vegetables and spices, blend partially and finish with herbs.',
    author: 'Mina Karim',
    likes: 132,
    featured: false,
    price: 2.49,
    description: 'Warm, hearty soup with comforting spices and rich texture.'
  }
];

export const users = [
  {
    id: 'admin-1',
    name: 'Admin',
    email: 'admin@recipehub.com',
    password: 'Admin123',
    role: 'admin',
    image: chefOne
  },
  {
    id: 'user-1',
    name: 'Ayesha Rahman',
    email: 'ayesha@example.com',
    password: 'User123',
    role: 'user',
    image: chefTwo
  }
];
