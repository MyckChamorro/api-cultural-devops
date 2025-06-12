const request = require('supertest');
const { app } = require('./testSetup');

describe('POST /greetings', () => {
  test('debería crear un nuevo saludo', async () => {
    const response = await request(app)
      .post('/greetings')
      .send({ message: '¡Hola, mundo!' })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('message', '¡Hola, mundo!');
  });
}); 