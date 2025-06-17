const request = require('supertest');
const { app } = require('./testSetup');

describe('PUT /greetings/:id', () => {
  test('debería actualizar un saludo existente', async () => {
    // Primero creamos un saludo
    const createResponse = await request(app)
      .post('/greetings')
      .send({ message: '¡Hola!' })
      .expect(201);
    
    const greetingId = createResponse.body.id;

    // Luego lo actualizamos
    const response = await request(app)
      .put(`/greetings/${greetingId}`)
      .send({ message: '¡Hola actualizado!' })
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.id.toString()).toBe(greetingId.toString());
    expect(response.body).toHaveProperty('message', '¡Hola actualizado!');
  });
}); 