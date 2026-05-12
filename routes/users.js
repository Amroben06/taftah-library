const express = require('express');
const router = express.Router();
const db = require('../database');
const { authMiddleware, adminMiddleware } = require('../middleware');

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id,name,email,role,created_at FROM users WHERE id=?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
  res.json(user);
});

router.put('/me', authMiddleware, (req, res) => {
  db.prepare('UPDATE users SET name=? WHERE id=?').run(req.body.name, req.user.id);
  res.json({ message: 'تم التحديث ✅' });
});

router.get('/me/favorites', authMiddleware, (req, res) => {
  const rows = db.prepare(
    `SELECT books.* FROM favorites
     JOIN books ON favorites.book_id = books.id
     WHERE favorites.user_id = ? ORDER BY favorites.created_at DESC`
  ).all(req.user.id);
  res.json(rows);
});

router.post('/me/favorites/:bookId', authMiddleware, (req, res) => {
  try {
    db.prepare('INSERT OR IGNORE INTO favorites (user_id,book_id) VALUES (?,?)').run(req.user.id, req.params.bookId);
    res.json({ message: 'تمت الإضافة للمفضلة ✅' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/me/favorites/:bookId', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM favorites WHERE user_id=? AND book_id=?').run(req.user.id, req.params.bookId);
  res.json({ message: 'تمت الإزالة' });
});

router.get('/', adminMiddleware, (req, res) => {
  const rows = db.prepare('SELECT id,name,email,role,created_at FROM users ORDER BY created_at DESC').all();
  res.json(rows);
});

router.delete('/:id', adminMiddleware, (req, res) => {
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  res.json({ message: 'تم حذف المستخدم ✅' });
});

module.exports = router;