const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

const MONGODB_TEST_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/fullstackdb_test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_TEST_URI);
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// ── HEALTH CHECK TESTS ───────────────────────────────────────────
describe('GET /api/health', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});

// ── ITEMS TESTS ──────────────────────────────────────────────────
describe('GET /api/items', () => {
  it('should return an array of items', async () => {
    const res = await request(app).get('/api/items');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});

describe('POST /api/items', () => {
  it('should create a new item', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Test Item', description: 'Created by Jest test', status: 'active' });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.item.name).toBe('Test Item');
    expect(res.body.item).toHaveProperty('_id');
  });

  it('should reject item with no name', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ description: 'No name provided' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/items/:id', () => {
  it('should delete an item', async () => {
    const create = await request(app)
      .post('/api/items')
      .send({ name: 'Item to delete' });
    const id = create.body.item._id;
    const res = await request(app).delete('/api/items/' + id);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
