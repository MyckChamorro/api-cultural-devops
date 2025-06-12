const request = require('supertest');
const { app } = require('./testSetup');

describe('GET /greetings', () => {
  test('debería devolver una lista vacía inicialmente', async () => {
    const response = await request(app)
      .get('/greetings')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });
}); 