const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use(express.static('public'));


// GET /greetings → Lista todos
app.get('/greetings', (req, res) => {
  db.query('SELECT * FROM greetings', (err, results) => {
    if (err) {
      console.error('Error en SELECT greetings:', err);
      return res.status(500).json({ error: err.message });
    }
    db.query('INSERT INTO audit_logs (action, greeting_id, old_value, new_value) VALUES (?, NULL, NULL, NULL)', ['LIST'], (err2) => {
      if (err2) {
        console.error('Error en INSERT audit_logs (LIST):', err2);
        return res.status(500).json({ error: err2.message });
      }
      res.json(results);
    });
  });
});

// POST /greetings → Crea uno
app.post('/greetings', (req, res) => {
  const { message } = req.body;
  db.query('INSERT INTO greetings (message) VALUES (?)', [message], (err, result) => {
    if (err) {
      console.error('Error en INSERT greetings:', err);
      return res.status(500).json({ error: err.message });
    }
    db.query('INSERT INTO audit_logs (action, greeting_id, old_value, new_value) VALUES (?, ?, NULL, ?)', ['CREATE', result.insertId, message], (err2) => {
      if (err2) {
        console.error('Error en INSERT audit_logs (CREATE):', err2);
        return res.status(500).json({ error: err2.message });
      }
      res.status(201).json({ id: result.insertId, message });
    });
  });
});

// PUT /greetings/:id → Edita uno
app.put('/greetings/:id', (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  // Obtener el valor anterior
  db.query('SELECT message FROM greetings WHERE id = ?', [id], (err, rows) => {
    if (err) {
      console.error('Error en SELECT previo a UPDATE:', err);
      return res.status(500).json({ error: err.message });
    }
    const oldValue = rows[0] ? rows[0].message : null;
    db.query('UPDATE greetings SET message = ? WHERE id = ?', [message, id], (err, result) => {
      if (err) {
        console.error('Error en UPDATE greetings:', err);
        return res.status(500).json({ error: err.message });
      }
      db.query('INSERT INTO audit_logs (action, greeting_id, old_value, new_value) VALUES (?, ?, ?, ?)', ['UPDATE', id, oldValue, message], (err2) => {
        if (err2) {
          console.error('Error en INSERT audit_logs (UPDATE):', err2);
          return res.status(500).json({ error: err2.message });
        }
        res.json({ id, message });
      });
    });
  });
});

// DELETE /greetings/:id → Elimina uno
app.delete('/greetings/:id', (req, res) => {
  const { id } = req.params;
  // Obtener el valor anterior
  db.query('SELECT message FROM greetings WHERE id = ?', [id], (err, rows) => {
    if (err) {
      console.error('Error en SELECT previo a DELETE:', err);
      return res.status(500).json({ error: err.message });
    }
    const oldValue = rows[0] ? rows[0].message : null;
    db.query('DELETE FROM greetings WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Error en DELETE greetings:', err);
        return res.status(500).json({ error: err.message });
      }
      db.query('INSERT INTO audit_logs (action, greeting_id, old_value, new_value) VALUES (?, ?, ?, NULL)', ['DELETE', id, oldValue], (err2) => {
        if (err2) {
          console.error('Error en INSERT audit_logs (DELETE):', err2);
          return res.status(500).json({ error: err2.message });
        }
        res.json({ deleted: id });
      });
    });
  });
});

module.exports = app;