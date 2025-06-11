const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Configura la conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root', // Cambia esto si tienes una contraseña
  database: 'api_cult'
});

db.connect(err => {
  if (err) throw err;
  console.log('Conectado a MySQL');
});


app.use(express.static('public'));


// GET /greetings → Lista todos
app.get('/greetings', (req, res) => {
  db.query('SELECT * FROM greetings', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST /greetings → Crea uno
app.post('/greetings', (req, res) => {
  const { message } = req.body;
  db.query('INSERT INTO greetings (message) VALUES (?)', [message], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, message });
  });
});

// PUT /greetings/:id → Edita uno
app.put('/greetings/:id', (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  db.query('UPDATE greetings SET message = ? WHERE id = ?', [message, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, message });
  });
});

// DELETE /greetings/:id → Elimina uno
app.delete('/greetings/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM greetings WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: id });
  });
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});