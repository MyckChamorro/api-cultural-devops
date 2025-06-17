const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());


const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

function notifySlack(message) {
  axios.post(SLACK_WEBHOOK_URL, { text: message })
    .catch(err => console.error('Error enviando a Slack:', err));
}

// Configura la conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password', // Cambia esto si tienes una contraseña
  database: 'api_cult_test',
  port: 3306
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
    notifySlack(`Nuevo saludo creado: "${message}" (ID: ${result.insertId})`);
    res.status(201).json({ id: result.insertId, message });
  });
});

// PUT /greetings/:id → Edita uno
app.put('/greetings/:id', (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  db.query('UPDATE greetings SET message = ? WHERE id = ?', [message, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    notifySlack(`Saludo actualizado: "${message}" (ID: ${id})`);
    res.json({ id, message });
  });
});

// DELETE /greetings/:id → Elimina uno
app.delete('/greetings/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM greetings WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    notifySlack(`Saludo eliminado: "${id}"`);
    res.json({ deleted: id });
  });
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});