const express = require('express');
const db      = require('../database');
const auth    = require('../middleware/auth');
const router  = express.Router();

// GET — somente admin vê as inscrições
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM voluntarios ORDER BY criado_em DESC'
    );
    res.json(rows);
  } catch { res.status(500).json({ erro: 'Erro ao buscar voluntários' }); }
});

// POST — público, qualquer visitante pode se inscrever
router.post('/', async (req, res) => {
  const { nome, email, telefone, area, motivacao } = req.body;
  try {
    const [r] = await db.execute(
      'INSERT INTO voluntarios (nome, email, telefone, area, motivacao) VALUES (?,?,?,?,?)',
      [nome, email, telefone || '', area, motivacao || '']
    );
    res.json({ id: r.insertId, mensagem: 'Inscrição realizada com sucesso!' });
  } catch { res.status(500).json({ erro: 'Erro ao realizar inscrição' }); }
});

// DELETE — somente admin
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.execute('DELETE FROM voluntarios WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Inscrição removida!' });
  } catch { res.status(500).json({ erro: 'Erro ao remover inscrição' }); }
});

module.exports = router;
