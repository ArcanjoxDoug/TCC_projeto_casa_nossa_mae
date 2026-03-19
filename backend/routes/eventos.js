const express = require('express');
const db      = require('../database');
const auth    = require('../middleware/auth');
const router  = express.Router();

// GET — público
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM eventos ORDER BY data ASC');
    res.json(rows);
  } catch { res.status(500).json({ erro: 'Erro ao buscar eventos' }); }
});

// POST — somente admin
router.post('/', auth, async (req, res) => {
  const { titulo, local, data, hora, tipo, descricao } = req.body;
  try {
    const [r] = await db.execute(
      'INSERT INTO eventos (titulo, local, data, hora, tipo, descricao) VALUES (?,?,?,?,?,?)',
      [titulo, local, data, hora, tipo || 'normal', descricao || '']
    );
    res.json({ id: r.insertId, mensagem: 'Evento criado!' });
  } catch { res.status(500).json({ erro: 'Erro ao criar evento' }); }
});

// PUT — editar
router.put('/:id', auth, async (req, res) => {
  const { titulo, local, data, hora, tipo, descricao } = req.body;
  try {
    await db.execute(
      'UPDATE eventos SET titulo=?, local=?, data=?, hora=?, tipo=?, descricao=? WHERE id=?',
      [titulo, local, data, hora, tipo, descricao, req.params.id]
    );
    res.json({ mensagem: 'Evento atualizado!' });
  } catch { res.status(500).json({ erro: 'Erro ao atualizar evento' }); }
});

// DELETE
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.execute('DELETE FROM eventos WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Evento removido!' });
  } catch { res.status(500).json({ erro: 'Erro ao remover evento' }); }
});

module.exports = router;
