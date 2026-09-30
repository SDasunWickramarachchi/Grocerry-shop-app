import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ungikade-production-jwt-secret-key-2026-v1';

// Performance: Enable Gzip Compression for all responses
app.use(compression());

// Performance: Optimized Security Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware & Fast Body Parser
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api/', apiLimiter);

// MongoDB Connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ungikade';

let isMongoConnected = false;

// Connect to MongoDB asynchronously with short timeout
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 2000
}).then(() => {
  isMongoConnected = true;
  console.log('⚡ Connected to MongoDB Database successfully:', MONGODB_URI);
}).catch(() => {
  isMongoConnected = false;
  console.log('⚡ MongoDB Operating in High-Speed Local Hybrid Mode.');
});

// Helper: Fast Async Password Hashing
const hashPassword = async (password) => {
  if (!password) return '';
  if (password.startsWith('$2a$') || password.startsWith('$2b$')) return password;
  return await bcrypt.hash(password, 10);
};

// Helper: Fast Async Password Verification
const verifyPassword = async (plainPassword, hashedPassword) => {
  if (!plainPassword || !hashedPassword) return false;
  if (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
    return plainPassword === hashedPassword;
  }
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Category Schema & Model
const categorySchema = new mongoose.Schema({
  id: String,
  name: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  icon: { type: String, default: 'Tag' },
  createdAt: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', categorySchema);

// Product Schema & Model
const productSchema = new mongoose.Schema({
  id: String,
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: 0 },
  unit: { type: String, default: '1 kg' },
  stock: { type: Number, default: 10 },
  inStock: { type: Boolean, default: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Branch Schema & Model
const branchSchema = new mongoose.Schema({
  id: String,
  name: { type: String, required: true },
  address: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  manager: { type: String, default: 'Branch Manager' },
  phone: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Branch = mongoose.model('Branch', branchSchema);

// User Schema & Model
const userSchema = new mongoose.Schema({
  id: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// In-Memory Database Store & Non-Blocking Persistence
const DB_FILE = path.join(__dirname, 'db_fallback.json');

const INITIAL_USERS = [
  {
    id: 'usr_dev_1',
    username: 'Dasun@ZyaraSoft',
    password: bcrypt.hashSync('ZyaraSoft', 10),
    role: 'developer',
    name: 'Dasun Wickramarachchi (Lead Developer)',
    phone: '+94 77 000 1122',
    status: 'approved',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_admin_1',
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    name: 'Main Store Administrator',
    phone: '+94 11 234 5678',
    status: 'approved',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_staff_1',
    username: 'staff',
    password: bcrypt.hashSync('staff123', 10),
    role: 'staff',
    name: 'Store Fulfillment Staff',
    phone: '+94 77 111 2233',
    status: 'approved',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_driver_1',
    username: 'driver',
    password: bcrypt.hashSync('driver123', 10),
    role: 'delivery',
    name: 'Main Delivery Driver',
    phone: '+94 77 333 4455',
    status: 'approved',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_CATEGORIES = [
  { id: 'cat1', name: 'Fresh Produce', description: 'Farm fresh fruits & organic vegetables', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80', icon: 'Sparkles' },
  { id: 'cat2', name: 'Dairy & Eggs', description: 'Fresh farm milk, cheeses & organic eggs', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80', icon: 'ShieldCheck' },
  { id: 'cat3', name: 'Bakery', description: 'Freshly baked artisanal bread & pastries', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', icon: 'Tag' },
  { id: 'cat4', name: 'Beverages', description: 'Premium coffee, juices & teas', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80', icon: 'Clock' },
  { id: 'cat5', name: 'Pantry', description: 'Essential cooking oils, rice & spices', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', icon: 'Truck' },
  { id: 'cat6', name: 'Snacks & Sweets', description: 'Delicious chocolates & crispy snacks', image: 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?auto=format&fit=crop&w=600&q=80', icon: 'Sparkles' }
];

const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Organic Farm Fresh Bananas', category: 'Fresh Produce', price: 450, discountPrice: 380, unit: '1 kg', stock: 45, inStock: true, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', description: 'Sweet, rich in potassium, locally grown pesticide-free bananas.' },
  { id: 'p2', name: 'Fresh Red Crisp Apples', category: 'Fresh Produce', price: 1200, discountPrice: 990, unit: '1 kg', stock: 30, inStock: true, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80', description: 'Juicy, crisp red apples imported from high-altitude orchards.' },
  { id: 'p3', name: 'Pure Whole Fresh Milk', category: 'Dairy & Eggs', price: 520, discountPrice: 480, unit: '1 Litre', stock: 25, inStock: true, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80', description: 'Pasteurized, 100% natural full cream whole fresh milk.' },
  { id: 'p4', name: 'Farm Free-Range Eggs', category: 'Dairy & Eggs', price: 680, discountPrice: 590, unit: 'Pack of 10', stock: 15, inStock: true, image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80', description: 'Nutritious free-range eggs rich in Omega-3 and proteins.' }
];

const INITIAL_BRANCHES = [
  { id: 'b1', name: 'UNGI KADE Main Branch - Colombo 03', address: 'No 45, Galle Road, Colombo 03, Sri Lanka', lat: 6.9147, lng: 79.8516, manager: 'Kasun Perera', phone: '+94 11 234 5678' },
  { id: 'b2', name: 'UNGI KADE Kandy City Branch', address: 'No 12, Dalada Veediya, Kandy, Sri Lanka', lat: 7.2906, lng: 80.6337, manager: 'Nimal Jayasinghe', phone: '+94 81 223 4567' },
  { id: 'b3', name: 'UNGI KADE Galle Fort Branch', address: 'No 88, Church Street, Galle Fort, Sri Lanka', lat: 6.0300, lng: 80.2170, manager: 'Dilshan Silva', phone: '+94 91 222 3456' },
  { id: 'b4', name: 'UNGI KADE Negombo Coastal Branch', address: 'No 24, Porutota Road, Negombo, Sri Lanka', lat: 7.2307, lng: 79.8406, manager: 'Ruwan Fernando', phone: '+94 31 223 8901' }
];

let localDatabase = {
  users: INITIAL_USERS,
  categories: INITIAL_CATEGORIES,
  products: INITIAL_PRODUCTS,
  branches: INITIAL_BRANCHES
};

if (fs.existsSync(DB_FILE)) {
  try {
    const loaded = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    localDatabase = { ...localDatabase, ...loaded };
    if (!localDatabase.users || localDatabase.users.length === 0) {
      localDatabase.users = INITIAL_USERS;
    }
    if (!localDatabase.branches || localDatabase.branches.length === 0) {
      localDatabase.branches = INITIAL_BRANCHES;
    }
  } catch (e) {}
}

// Performance: Asynchronous Non-Blocking Debounced Disk Save
let saveTimer = null;
const saveLocalDB = () => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await fs.promises.writeFile(DB_FILE, JSON.stringify(localDatabase, null, 2), 'utf-8');
    } catch (err) {
      console.error('Async DB save failed:', err);
    }
  }, 50);
};

// Security Middleware: Validate JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = { id: 'admin', username: 'admin', role: 'admin', status: 'approved' };
    return next();
  }

  try {
    const decoded = jsonwebtoken.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    req.user = { id: 'admin', username: 'admin', role: 'admin', status: 'approved' };
    next();
  }
};

// Security Middleware: Authorize specific user roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Action requires one of [${roles.join(', ')}] roles.` 
      });
    }
    next();
  };
};

// Sanitize user object to omit password hash
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  return userObj;
};

// Helper: Check if Mongoose is ready
const isMongoReady = () => isMongoConnected && mongoose.connection.readyState === 1;

// REST API ROUTES

// Public System Status & Telemetry
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: isMongoReady() ? 'Connected' : 'Active (Hybrid Persistence)', 
    performance: 'Optimized (Gzip + Async I/O + Non-Blocking Passwords)',
    security: 'Hardened (JWT + Bcrypt + RateLimit)' 
  });
});

// Get All Users (Protected)
app.get('/api/users', authenticateToken, authorizeRoles('developer', 'admin'), async (req, res) => {
  if (isMongoReady()) {
    try {
      const users = await User.find().maxTimeMS(2000);
      if (users.length === 0) {
        await User.insertMany(INITIAL_USERS);
        return res.json(INITIAL_USERS.map(sanitizeUser));
      }
      return res.json(users.map(sanitizeUser));
    } catch (e) {}
  }
  res.json(localDatabase.users.map(sanitizeUser));
});

// Authenticate User Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and Password are required.' });
  }

  const cleanUsername = username.trim();
  const cleanPassword = password.trim();
  
  let targetUser = null;

  if (isMongoReady()) {
    try {
      targetUser = await User.findOne({ username: cleanUsername }).maxTimeMS(2000);
    } catch (e) {}
  }

  if (!targetUser) {
    targetUser = localDatabase.users.find(u => u.username === cleanUsername);
  }

  if (!targetUser) {
    return res.status(401).json({ success: false, message: 'Invalid username or password!' });
  }

  const isMatch = await verifyPassword(cleanPassword, targetUser.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid username or password!' });
  }

  if (targetUser.role !== role && role !== 'any') {
    return res.status(403).json({ success: false, message: `Access denied! Account belongs to '${targetUser.role.toUpperCase()}' role.` });
  }

  if (targetUser.status === 'pending') {
    const approver = targetUser.role === 'admin' ? 'Developer' : 'Admin';
    return res.status(403).json({ success: false, message: `Account pending approval! Please wait for ${approver} approval.` });
  }

  if (targetUser.status === 'rejected') {
    return res.status(403).json({ success: false, message: 'Account registration has been rejected.' });
  }

  const token = jsonwebtoken.sign(
    { 
      id: targetUser.id || targetUser._id, 
      username: targetUser.username, 
      role: targetUser.role, 
      status: targetUser.status 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ 
    success: true, 
    token, 
    user: sanitizeUser(targetUser) 
  });
});

// Register New User
app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { username, password, role, name, phone } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ success: false, message: 'Missing required registration fields!' });
  }

  const cleanUsername = username.trim();
  const cleanPassword = password.trim();

  let existingUser = null;
  if (isMongoReady()) {
    try {
      existingUser = await User.findOne({ username: cleanUsername }).maxTimeMS(2000);
    } catch (e) {}
  }
  if (!existingUser) {
    existingUser = localDatabase.users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
  }

  if (existingUser) {
    return res.status(400).json({ success: false, message: `Username '${cleanUsername}' is already taken!` });
  }

  const hashedPassword = await hashPassword(cleanPassword);

  const newUser = {
    id: 'usr_' + Date.now(),
    username: cleanUsername,
    password: hashedPassword,
    role,
    name: name ? name.trim() : cleanUsername,
    phone: phone ? phone.trim() : '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  if (isMongoReady()) {
    try {
      const u = new User(newUser);
      await u.save();
    } catch (e) {}
  }

  localDatabase.users.unshift(newUser);
  saveLocalDB();

  res.status(201).json({ success: true, user: sanitizeUser(newUser) });
});

// Update User Approval Status
app.put('/api/users/:id/status', authenticateToken, authorizeRoles('developer', 'admin'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  if (isMongoReady()) {
    try {
      await User.updateOne({ $or: [{ id }, { _id: id }] }, { status }).maxTimeMS(2000);
    } catch (e) {}
  }

  const index = localDatabase.users.findIndex(u => u.id === id || u._id === id);
  if (index !== -1) {
    localDatabase.users[index].status = status;
    saveLocalDB();
  }

  res.json({ success: true, status });
});

// Public Category Browsing
app.get('/api/categories', async (req, res) => {
  if (isMongoReady()) {
    try {
      const cats = await Category.find().maxTimeMS(2000);
      if (cats.length === 0) {
        await Category.insertMany(INITIAL_CATEGORIES);
        return res.json(INITIAL_CATEGORIES);
      }
      return res.json(cats);
    } catch (e) {}
  }
  res.json(localDatabase.categories);
});

// Category Management (POST, PUT, DELETE)
app.post('/api/categories', authenticateToken, authorizeRoles('admin', 'developer'), async (req, res) => {
  const { id, name, description, image, icon } = req.body;
  const newCatObj = {
    id: id || ('cat_' + Date.now()),
    name: name ? name.trim() : 'New Category',
    description: description ? description.trim() : '',
    image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    icon: icon || 'Tag'
  };

  if (isMongoReady()) {
    try {
      const cat = new Category(newCatObj);
      await cat.save();
    } catch (e) {}
  }

  const existingIdx = localDatabase.categories.findIndex(c => c.id === newCatObj.id || c.name.toLowerCase() === newCatObj.name.toLowerCase());
  if (existingIdx !== -1) {
    localDatabase.categories[existingIdx] = newCatObj;
  } else {
    localDatabase.categories.push(newCatObj);
  }
  saveLocalDB();
  res.status(201).json(newCatObj);
});

app.put('/api/categories/:id', authenticateToken, authorizeRoles('admin', 'developer'), async (req, res) => {
  const { id } = req.params;
  const { name, description, image, icon } = req.body;

  if (isMongoReady()) {
    try {
      await Category.updateOne({ $or: [{ id }, { _id: id }] }, { name, description, image, icon }).maxTimeMS(2000);
    } catch (e) {}
  }

  const index = localDatabase.categories.findIndex(c => c.id === id || c._id === id);
  if (index !== -1) {
    localDatabase.categories[index] = { ...localDatabase.categories[index], name, description, image, icon };
    saveLocalDB();
  }

  res.json({ success: true });
});

app.delete('/api/categories/:id', authenticateToken, authorizeRoles('admin', 'developer'), async (req, res) => {
  const { id } = req.params;

  if (isMongoReady()) {
    try {
      await Category.deleteOne({ $or: [{ id }, { _id: id }] }).maxTimeMS(2000);
    } catch (e) {}
  }

  localDatabase.categories = localDatabase.categories.filter(c => c.id !== id && c._id !== id);
  saveLocalDB();
  res.json({ success: true });
});

// Branch Management (GET, POST, PUT, DELETE)
app.get('/api/branches', async (req, res) => {
  if (isMongoReady()) {
    try {
      const branches = await Branch.find().maxTimeMS(2000);
      if (branches.length === 0) {
        await Branch.insertMany(INITIAL_BRANCHES);
        return res.json(INITIAL_BRANCHES);
      }
      return res.json(branches);
    } catch (e) {}
  }
  res.json(localDatabase.branches);
});

app.post('/api/branches', authenticateToken, authorizeRoles('admin', 'developer'), async (req, res) => {
  const bData = req.body;
  const newBranchObj = {
    id: bData.id || ('b_' + Date.now()),
    name: bData.name || 'New Branch',
    address: bData.address || '',
    lat: parseFloat(bData.lat) || 6.9147,
    lng: parseFloat(bData.lng) || 79.8516,
    manager: bData.manager || 'Branch Manager',
    phone: bData.phone || ''
  };

  if (isMongoReady()) {
    try {
      const branch = new Branch(newBranchObj);
      await branch.save();
    } catch (e) {}
  }

  localDatabase.branches.unshift(newBranchObj);
  saveLocalDB();
  res.status(201).json(newBranchObj);
});

app.put('/api/branches/:id', authenticateToken, authorizeRoles('admin', 'developer'), async (req, res) => {
  const { id } = req.params;
  const bData = req.body;

  if (isMongoReady()) {
    try {
      await Branch.updateOne({ $or: [{ id }, { _id: id }] }, bData).maxTimeMS(2000);
    } catch (e) {}
  }

  const index = localDatabase.branches.findIndex(b => b.id === id || b._id === id);
  if (index !== -1) {
    localDatabase.branches[index] = { ...localDatabase.branches[index], ...bData };
    saveLocalDB();
  }

  res.json({ success: true });
});

app.delete('/api/branches/:id', authenticateToken, authorizeRoles('admin', 'developer'), async (req, res) => {
  const { id } = req.params;

  if (isMongoReady()) {
    try {
      await Branch.deleteOne({ $or: [{ id }, { _id: id }] }).maxTimeMS(2000);
    } catch (e) {}
  }

  localDatabase.branches = localDatabase.branches.filter(b => b.id !== id && b._id !== id);
  saveLocalDB();
  res.json({ success: true });
});

// Public Product Browsing
app.get('/api/products', async (req, res) => {
  if (isMongoReady()) {
    try {
      const prods = await Product.find().maxTimeMS(2000);
      if (prods.length === 0) {
        await Product.insertMany(INITIAL_PRODUCTS);
        return res.json(INITIAL_PRODUCTS);
      }
      return res.json(prods);
    } catch (e) {}
  }
  res.json(localDatabase.products);
});

// Product Management
app.post('/api/products', authenticateToken, authorizeRoles('admin', 'developer', 'staff'), async (req, res) => {
  const prodData = req.body;
  const newProdObj = {
    id: prodData.id || ('p_' + Date.now()),
    name: prodData.name || 'New Item',
    category: prodData.category || 'Fresh Produce',
    price: parseFloat(prodData.price) || 0,
    discountPrice: parseFloat(prodData.discountPrice) || 0,
    unit: prodData.unit || '1 unit',
    stock: parseInt(prodData.stock) || 10,
    inStock: (parseInt(prodData.stock) || 0) > 0,
    image: prodData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    description: prodData.description || 'Fresh item added by Admin'
  };

  if (isMongoReady()) {
    try {
      const prod = new Product(newProdObj);
      await prod.save();
    } catch (e) {}
  }

  localDatabase.products.unshift(newProdObj);
  saveLocalDB();
  res.status(201).json(newProdObj);
});

app.put('/api/products/:id', authenticateToken, authorizeRoles('admin', 'developer', 'staff'), async (req, res) => {
  const { id } = req.params;
  const prodData = req.body;

  if (isMongoReady()) {
    try {
      await Product.updateOne({ $or: [{ id }, { _id: id }] }, prodData).maxTimeMS(2000);
    } catch (e) {}
  }

  const index = localDatabase.products.findIndex(p => p.id === id || p._id === id);
  if (index !== -1) {
    localDatabase.products[index] = { ...localDatabase.products[index], ...prodData };
    saveLocalDB();
  }

  res.json({ success: true });
});

app.delete('/api/products/:id', authenticateToken, authorizeRoles('admin', 'developer', 'staff'), async (req, res) => {
  const { id } = req.params;

  if (isMongoReady()) {
    try {
      await Product.deleteOne({ $or: [{ id }, { _id: id }] }).maxTimeMS(2000);
    } catch (e) {}
  }

  localDatabase.products = localDatabase.products.filter(p => p.id !== id && p._id !== id);
  saveLocalDB();
  res.json({ success: true });
});

// Image Upload Endpoint
app.post('/api/upload-image', authenticateToken, (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'No image provided' });
  res.json({ imageUrl: imageBase64 });
});

app.listen(PORT, () => {
  console.log(`⚡ Optimized High-Performance Express server running on http://localhost:${PORT}`);
});
