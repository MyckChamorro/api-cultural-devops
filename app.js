const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Configura la conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password', // Cambia esto si tienes una contraseña
  database: process.env.NODE_ENV === 'test' ? 'api_cult_test' : 'api_cult'
});

db.connect(err => {
  if (err) throw err;
  console.log('Conectado a MySQL');
});

// Función para registrar auditoría
const logAction = (action, greetingId, oldValue, newValue) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO audit_logs (action, greeting_id, old_value, new_value) VALUES (?, ?, ?, ?)';
    db.query(query, [action, greetingId, oldValue, newValue], (err) => {
      if (err) {
        console.error('Error al registrar auditoría:', err);
        reject(err);
      }
      resolve();
    });
  });
};

app.use(express.static('public'));

// GET /greetings → Lista todos
app.get('/greetings', async (req, res) => {
  try {
    const results = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM greetings', (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
    
    await logAction('LIST', null, null, JSON.stringify(results));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /greetings → Crea uno
app.post('/greetings', async (req, res) => {
  const { message } = req.body;
  try {
    const result = await new Promise((resolve, reject) => {
      db.query('INSERT INTO greetings (message) VALUES (?)', [message], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
    
    const newId = result.insertId;
    await logAction('CREATE', newId, null, message);
    res.status(201).json({ id: newId, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /greetings/:id → Edita uno
app.put('/greetings/:id', async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  
  try {
    // Obtener valor anterior
    const oldResult = await new Promise((resolve, reject) => {
      db.query('SELECT message FROM greetings WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        resolve(results[0]?.message);
      });
    });

    // Actualizar
    await new Promise((resolve, reject) => {
      db.query('UPDATE greetings SET message = ? WHERE id = ?', [message, id], (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    await logAction('UPDATE', id, oldResult, message);
    res.json({ id, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /greetings/:id → Elimina uno
app.delete('/greetings/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Obtener valor a eliminar
    const oldResult = await new Promise((resolve, reject) => {
      db.query('SELECT message FROM greetings WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        resolve(results[0]?.message);
      });
    });

    // Eliminar
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM greetings WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    await logAction('DELETE', id, oldResult, null);
    res.json({ deleted: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para ver el historial de cambios
app.get('/audit-logs', (req, res) => {
  db.query('SELECT * FROM audit_logs ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Solo inicia el servidor si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
  });
}

module.exports = { app, db };