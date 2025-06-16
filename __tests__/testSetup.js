const { app, db } = require('../app');

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
});

// Cerrar la conexión después de todas las pruebas
afterAll(done => {
  db.end(done);
});

module.exports = { app, db }; 