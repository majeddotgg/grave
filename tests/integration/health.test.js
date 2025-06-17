const request = require('supertest');
const app = require('../../server');

describe('Health Check Endpoint', () => {
  test('GET /api/health should return 200 and health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'API is healthy');
    expect(response.body).toHaveProperty('timestamp');
  });
}); 