const request = require('supertest');
const app = require('../../server');

describe('Graves Endpoints', () => {
  const testSection = {
    section_id: 'TEST-GRAVE',
    section_name: 'Test Grave Section',
    total_plots: 100,
    available_plots: 100,
    description: 'Test section for grave testing'
  };

  const testGrave = {
    grave_id: 'TEST-GRAVE-01',
    section: 'TEST-GRAVE',
    grave_row: 1,
    grave_plot: 1,
    status: 'available'
  };

  beforeAll(async () => {
    // Create test section before running grave tests
    await request(app)
      .post('/api/sections')
      .send(testSection);
  });

  describe('GET /api/graves', () => {
    test('should return all graves with pagination', async () => {
      const response = await request(app)
        .get('/api/graves?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should filter graves by section', async () => {
      const response = await request(app)
        .get('/api/graves?section=TEST-GRAVE')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeDefined();
    });

    test('should filter graves by status', async () => {
      const response = await request(app)
        .get('/api/graves?status=available')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('POST /api/graves', () => {
    test('should create a new grave', async () => {
      const response = await request(app)
        .post('/api/graves')
        .send(testGrave)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Grave created successfully');
    });

    test('should return 400 for invalid grave data', async () => {
      const invalidGrave = {
        grave_id: '',
        section: '',
        grave_row: -1,
        grave_plot: -1,
        status: 'invalid_status'
      };

      const response = await request(app)
        .post('/api/graves')
        .send(invalidGrave)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });

    test('should return 409 for duplicate grave_id', async () => {
      // First create a grave
      await request(app)
        .post('/api/graves')
        .send(testGrave);

      // Try to create the same grave again
      const response = await request(app)
        .post('/api/graves')
        .send(testGrave)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Grave ID already exists');
    });
  });

  describe('GET /api/graves/available/:sectionId', () => {
    test('should return available graves for a section', async () => {
      const response = await request(app)
        .get('/api/graves/available/TEST-GRAVE')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/graves/:graveId', () => {
    test('should return a specific grave', async () => {
      // First create a grave
      await request(app)
        .post('/api/graves')
        .send(testGrave);

      const response = await request(app)
        .get(`/api/graves/${testGrave.grave_id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('grave_id', testGrave.grave_id);
    });

    test('should return 404 for non-existent grave', async () => {
      const response = await request(app)
        .get('/api/graves/NONEXISTENT')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Grave not found');
    });
  });
}); 