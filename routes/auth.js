const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  try {
    const hashed = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (name,email,password) VALUES (?,?,?)').run(name, email, hashed);
    const token = jwt.sign({ id: result.lastInsertRowid, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: result.lastInsertRowid, name, email, role: 'user' } });
  } catch(e) { res.status(400).json({ error: 'البريد الإلكتروني مستخدم مسبقاً' }); }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(400).json({ error: 'البريد الإلكتروني غير موجود' });
    if (!bcrypt.compareSync(password, user.password))
      return res.status(400).json({ error: 'كلمة المرور غير صحيحة' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;