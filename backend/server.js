const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Servir os arquivos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas da API
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/eventos',      require('./routes/eventos'));
app.use('/api/notificacoes', require('./routes/notificacoes'));
app.use('/api/estatisticas', require('./routes/estatisticas'));
app.use('/api/destaques',    require('./routes/destaques'));

// Qualquer outra rota serve o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
