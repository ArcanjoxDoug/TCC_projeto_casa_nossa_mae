const express = require('express');
const db      = require('../database');
const auth    = require('../middleware/auth');
const router  = express.Router();

// GET — somente admin
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM atividade_admin ORDER BY criado_em DESC LIMIT 20'
    );
    res.json(rows);
  } catch { res.status(500).json({ erro: 'Erro ao buscar atividades' }); }
});

// POST — registrar nova atividade
router.post('/', auth, async (req, res) => {
  const { texto, cor } = req.body;
  try {
    await db.execute(
      'INSERT INTO atividade_admin (texto, cor) VALUES (?,?)',
      [texto, cor || '#1a4b8c']
    );
    res.json({ mensagem: 'Atividade registrada!' });
  } catch { res.status(500).json({ erro: 'Erro ao registrar atividade' }); }
});

// DELETE — limpar histórico
router.delete('/', auth, async (req, res) => {
  try {
    await db.execute('DELETE FROM atividade_admin');
    res.json({ mensagem: 'Histórico limpo!' });
  } catch { res.status(500).json({ erro: 'Erro ao limpar histórico' }); }
});

module.exports = router;
