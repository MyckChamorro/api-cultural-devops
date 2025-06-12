const request = require('supertest');
const { app, db } = require('./testSetup');

describe('Audit Logs', () => {
  test('debería registrar todas las operaciones', async () => {
    // Realizar todas las operaciones
    await request(app).get('/greetings');

    const createResponse = await request(app)
      .post('/greetings')
      .send({ message: '¡Hola para auditoría!' });
    
    const id = createResponse.body.id;

    await request(app)
      .put(`/greetings/${id}`)
      .send({ message: '¡Hola actualizado para auditoría!' });

    await request(app)
      .delete(`/greetings/${id}`);

    // Verificar los logs
    const logs = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM audit_logs ORDER BY id ASC', (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    expect(logs.length).toBe(4);
    expect(logs[0].action).toBe('LIST');
    expect(logs[1].action).toBe('CREATE');
    expect(logs[2].action).toBe('UPDATE');
    expect(logs[3].action).toBe('DELETE');
  });
}); 