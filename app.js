const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const multer = require('multer');
const path = require('path');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/dairyproductdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Serve static files from "uploads" folder
app.use('/uploads', express.static('uploads'));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Import models
const Category = require('./models/category');
const Product = require('./models/product');

// Index Route
app.get('/', (req, res) => {
    res.render('index');
  });
  
  // Show Categories
  app.get('/categories', async (req, res) => {
    const categories = await Category.find();
    res.render('categories', { categories });
  });
  
  // Add Category
  app.post('/categories', async (req, res) => {
    const newCategory = new Category({ name: req.body.name });
    await newCategory.save();
    res.redirect('/categories');
  });
  
  // Delete Category
  app.delete('/categories/:id', async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/categories');
  });
  
  // Show Products
  app.get('/products', async (req, res) => {
    const products = await Product.find().populate('category');
    const categories = await Category.find();
    res.render('products', { products, categories });
  });
  
  // Add Product
  app.post('/products', upload.array('images', 10), async (req, res) => {
    const product = new Product({
      category: req.body.category,
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      images: req.files.map(file => file.filename)
    });
    await product.save();
    res.redirect('/products');
  });
  
  // Delete Product
  app.delete('/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/products');
  });

  // Update Category
app.post('/categories/update', async (req, res) => {
  const { id, name } = req.body;
  await Category.findByIdAndUpdate(id, { name });
  res.redirect('/categories');
});

// Update Product
app.post('/products/update', upload.array('images'), async (req, res) => {
  const { id, name, price, quantity } = req.body;
  const images = req.files.map(file => file.filename); // Save uploaded image filenames

  await Product.findByIdAndUpdate(id, { name, price, quantity, images });
  res.redirect('/products');
});
  
// Next step covers routes

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
