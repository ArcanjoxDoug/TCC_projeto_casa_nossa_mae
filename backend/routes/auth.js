const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../database');
const router  = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [rows] = await db.execute(
      'SELECT * FROM administradores WHERE email = ?', [email]
    );
    if (rows.length === 0)
      return res.status(401).json({ erro: 'Credenciais inválidas' });

    const admin = rows[0];
    const senhaValida = await bcrypt.compare(senha, admin.senha_hash);
    if (!senhaValida)
      return res.status(401).json({ erro: 'Credenciais inválidas' });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, nome: admin.nome },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, nome: admin.nome, email: admin.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// GET /api/auth/verificar — checar se token ainda é válido
router.get('/verificar', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ valido: false });
  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valido: true, nome: dados.nome });
  } catch {
    res.status(401).json({ valido: false });
  }
});

module.exports = router;
