const request = require('supertest');
const { app } = require('./testSetup');

describe('DELETE /greetings/:id', () => {
  test('debería eliminar un saludo', async () => {
    // Primero creamos un saludo
    const createResponse = await request(app)
      .post('/greetings')
      .send({ message: '¡Hola para eliminar!' })
      .expect(201);
    
    const greetingId = createResponse.body.id;

    // Luego lo eliminamos
    const response = await request(app)
      .delete(`/greetings/${greetingId}`)
      .expect(200);

    expect(response.body).toHaveProperty('deleted', greetingId.toString());

    // Verificamos que ya no existe
    await request(app)
      .get('/greetings')
      .expect(200)
      .then(response => {
        expect(response.body.find(g => g.id === greetingId)).toBeUndefined();
      });
  });
}); 