const db = require('./db');

// Crear tablas
const createTables = async () => {
  try {
    // Tabla de saludos
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS greetings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de logs de auditoría
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tablas creadas exitosamente');
  } catch (error) {
    console.error('Error creando las tablas:', error);
  } finally {
    db.end();
  }
};

createTables(); 