const request = require('supertest');
const app = require('./app');
const db = require('./db');

let greetingId;

// Función helper para mostrar el contenido de la tabla
const mostrarContenidoTabla = async () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM greetings', (err, results) => {
      if (err) reject(err);
      console.table(results);
      resolve(results);
    });
  });
};

// Función helper para mostrar los logs de auditoría
const mostrarLogsAuditoria = async () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM audit_logs ORDER BY created_at DESC', (err, results) => {
      if (err) reject(err);
      console.log('\n--- Logs de Auditoría ---');
      console.table(results);
      resolve(results);
    });
  });
};

// Limpiar las tablas antes de cada prueba
beforeEach(async () => {
  await new Promise((resolve, reject) => {
    db.query('DELETE FROM greetings', (err) => {
      if (err) reject(err);
      resolve();
    });
  });
  await new Promise((resolve, reject) => {
    db.query('DELETE FROM audit_logs', (err) => {
      if (err) reject(err);
      resolve();
    });
  });
  console.log('\n--- Estado inicial de la tabla ---');
  await mostrarContenidoTabla();
});

describe('API Endpoints', () => {
  // Test GET /greetings
  test('GET greetings debería devolver una lista vacía inicialmente', async () => {
    const response = await request(app)
      .get('/greetings')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  // Test POST /greetings
  test('POST greetings debería crear un nuevo saludo', async () => {
    const response = await request(app)
      .post('/greetings')
      .send({ message: '¡Hola, mundo!' })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('message', '¡Hola, mundo!');
    
    greetingId = response.body.id;

    console.log('\n--- Después de crear un saludo ---');
    await mostrarContenidoTabla();
  });

  // Test PUT /greetings/:id
  test('PUT /greetings/:id debería actualizar un saludo existente', async () => {
    // Primero creamos un saludo
    const createResponse = await request(app)
      .post('/greetings')
      .send({ message: '¡Hola!' })
      .expect(201);
    
    greetingId = createResponse.body.id;

    console.log('\n--- Después de crear el saludo inicial ---');
    await mostrarContenidoTabla();

    // Luego lo actualizamos
    const response = await request(app)
      .put(`/greetings/${greetingId}`)
      .send({ message: '¡Hola actualizado!' })
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.id.toString()).toBe(greetingId.toString());
    expect(response.body).toHaveProperty('message', '¡Hola actualizado!');

    console.log('\n--- Después de actualizar el saludo ---');
    await mostrarContenidoTabla();
  });

  // Test DELETE /greetings/:id
  test('DELETE greetings/:id debería eliminar un saludo', async () => {
    // Primero creamos un saludo
    const createResponse = await request(app)
      .post('/greetings')
      .send({ message: '¡Hola para eliminar!' })
      .expect(201);
    
    greetingId = createResponse.body.id;

    console.log('\n--- Después de crear el saludo para eliminar ---');
    await mostrarContenidoTabla();

    // Luego lo eliminamos
    const response = await request(app)
      .delete(`/greetings/${greetingId}`)
      .expect(200);

    expect(response.body).toHaveProperty('deleted', greetingId.toString());

    console.log('\n--- Después de eliminar el saludo ---');
    await mostrarContenidoTabla();

    // Verificamos que ya no existe
    await request(app)
      .get('/greetings')
      .expect(200)
      .then(response => {
        expect(response.body.find(g => g.id === greetingId)).toBeUndefined();
      });
  });

  // Test para verificar los logs de auditoría
  test('Debería registrar todas las operaciones en audit_logs', async () => {
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

    // Verificar que se registraron todas las operaciones
    expect(logs.length).toBe(4); // Debe haber exactamente 4 operaciones
    expect(logs[0].action).toBe('LIST');    // Primera operación: GET
    expect(logs[1].action).toBe('CREATE');  // Segunda operación: POST
    expect(logs[2].action).toBe('UPDATE');  // Tercera operación: PUT
    expect(logs[3].action).toBe('DELETE');  // Cuarta operación: DELETE
  });
});

// Cerrar la conexión a la base de datos después de todas las pruebas
afterAll(done => {
  db.end(done);
}); 