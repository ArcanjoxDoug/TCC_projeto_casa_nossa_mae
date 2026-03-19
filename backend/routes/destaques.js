const express = require('express');
const db      = require('../database');
const auth    = require('../middleware/auth');
const router  = express.Router();

router.get('/', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM destaques ORDER BY criado_em DESC');
  res.json(rows);
});

router.post('/', auth, async (req, res) => {
  const { emoji, titulo, categoria, data_publicacao } = req.body;
  const [r] = await db.execute(
    'INSERT INTO destaques (emoji, titulo, categoria, data_publicacao) VALUES (?,?,?,?)',
    [emoji || '🌻', titulo, categoria || 'Destaque', data_publicacao || '']
  );
  res.json({ id: r.insertId, mensagem: 'Destaque publicado!' });
});

router.delete('/:id', auth, async (req, res) => {
  await db.execute('DELETE FROM destaques WHERE id = ?', [req.params.id]);
  res.json({ mensagem: 'Removido!' });
});

module.exports = router;
```

---

## PASSO 3 — Conectar ao Railway

Depois de criar todos os arquivos no GitHub:

1. No Railway, clique em **"New Project"**
2. Escolha **"Deploy from GitHub repo"**
3. Selecione o repositório `casa-nossa-mae`
4. O Railway vai detectar automaticamente que é Node.js

Depois adicione o banco de dados:

1. Clique em **"New"** dentro do projeto
2. Escolha **"Database" → "MySQL"**
3. O Railway cria o banco e gera as variáveis automaticamente

---

## PASSO 4 — Configurar as variáveis de ambiente no Railway

No painel do Railway, clique no serviço Node.js, vá em **"Variables"** e adicione:
```
DB_HOST     → copiar do MySQL criado pelo Railway
DB_USER     → copiar do MySQL criado pelo Railway
DB_PASSWORD → copiar do MySQL criado pelo Railway
DB_NAME     → copiar do MySQL criado pelo Railway
DB_PORT     → copiar do MySQL criado pelo Railway
JWT_SECRET  → cnm2026chaveSecreta
