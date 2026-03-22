const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../server')

const MONGODB_TEST_URI = 'mongodb://mongodb:27017/fullstackdb_test'

let token = ''
let itemId = ''

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_TEST_URI)
  }
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

// ── AUTH TESTS ────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@test.com', password: 'password123' })
    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body).toHaveProperty('token')
    token = res.body.token
  })

  it('should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User 2', email: 'test@test.com', password: 'password123' })
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password123' })
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrongpassword' })
    expect(res.statusCode).toBe(401)
  })
})

// ── HEALTH CHECK ──────────────────────────────────────────────
describe('GET /api/health', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.statusCode).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})

// ── ITEMS TESTS (authenticated) ───────────────────────────────
describe('POST /api/items', () => {
  it('should create item when authenticated', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Item', description: 'Jest test item', status: 'active' })
    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    itemId = res.body.item._id
  })

  it('should reject item creation without token', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Unauthorized Item' })
    expect(res.statusCode).toBe(401)
  })
})

describe('GET /api/items', () => {
  it('should return items for authenticated user', async () => {
    const res = await request(app)
      .get('/api/items')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body.items)).toBe(true)
  })
})

describe('DELETE /api/items/:id', () => {
  it('should delete item when authenticated', async () => {
    const res = await request(app)
      .delete(`/api/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
