require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Item = require('./models/Item');

const app = express();

app.use(cors());
app.use(express.json());

// ── DATABASE CONNECTION ──────────────────────────────────────────
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/fullstackdb';
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// ── ROUTES ───────────────────────────────────────────────────────

// Health check — Jenkins uses this to verify deployment
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    message: 'Backend is running!',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// GET all items — reads from MongoDB
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET one item by ID
app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create a new item — writes to MongoDB
app.post('/api/items', async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const item = await Item.create({ name, description, status });
    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update an item
app.put('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE an item — removes from MongoDB
app.delete('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── START SERVER ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log('Backend running on port ' + PORT);
  });
};

startServer();

module.exports = app;
