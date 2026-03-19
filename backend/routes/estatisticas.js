const express = require('express');
const db      = require('../database');
const auth    = require('../middleware/auth');
const router  = express.Router();

router.get('/', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM estatisticas LIMIT 1');
  res.json(rows[0] || {});
});

router.put('/', auth, async (req, res) => {
  const { familias, voluntarios, anos, projetos } = req.body;
  await db.execute(
    'UPDATE estatisticas SET familias=?, voluntarios=?, anos=?, projetos=?',
    [familias, voluntarios, anos, projetos]
  );
  res.json({ mensagem: 'Estatísticas atualizadas!' });
});

module.exports = router;
