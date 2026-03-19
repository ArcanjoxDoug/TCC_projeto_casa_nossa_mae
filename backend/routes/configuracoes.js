const express = require('express');
const db      = require('../database');
const auth    = require('../middleware/auth');
const router  = express.Router();

// GET — público, o site precisa saber as configurações
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM configuracoes LIMIT 1');
    res.json(rows[0] || {});
  } catch { res.status(500).json({ erro: 'Erro ao buscar configurações' }); }
});

// PUT — somente admin
router.put('/', auth, async (req, res) => {
  const { chatbot, push, voluntarios } = req.body;
  try {
    await db.execute(
      'UPDATE configuracoes SET chatbot=?, push=?, voluntarios=?',
      [chatbot, push, voluntarios]
    );
    res.json({ mensagem: 'Configurações salvas!' });
  } catch { res.status(500).json({ erro: 'Erro ao salvar configurações' }); }
});

module.exports = router;
