require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.use(express.json());
app.use(express.static(__dirname));

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((erro) => {
  if (erro) {
    console.log('Erro ao conectar ao MySQL:', erro);
    return;
  }

  console.log('Conectado ao MySQL!');
});

app.get('/produtos', (req, res) => {
  connection.query('SELECT * FROM produtos', (erro, resultados) => {
    if (erro) {
      return res.status(500).json({ erro: 'Erro ao buscar produtos' });
    }

    res.json(resultados);
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});