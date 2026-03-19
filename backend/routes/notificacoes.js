const express = require('express');
const db      = require('../database');
const auth    = require('../middleware/auth');
const router  = express.Router();

router.get('/', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM notificacoes ORDER BY criado_em DESC');
  res.json(rows);
});

router.post('/', auth, async (req, res) => {
  const { titulo, mensagem, tipo } = req.body;
  const [r] = await db.execute(
    'INSERT INTO notificacoes (titulo, mensagem, tipo) VALUES (?,?,?)',
    [titulo, mensagem, tipo || 'info']
  );
  res.json({ id: r.insertId, mensagem: 'Notificação enviada!' });
});

router.put('/:id/lida', async (req, res) => {
  await db.execute('UPDATE notificacoes SET lida = TRUE WHERE id = ?', [req.params.id]);
  res.json({ mensagem: 'Marcada como lida' });
});

router.delete('/:id', auth, async (req, res) => {
  await db.execute('DELETE FROM notificacoes WHERE id = ?', [req.params.id]);
  res.json({ mensagem: 'Removida!' });
});

router.delete('/', auth, async (req, res) => {
  await db.execute('DELETE FROM notificacoes');
  res.json({ mensagem: 'Todas removidas!' });
});

module.exports = router;
