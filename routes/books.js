const express = require('express');
const router = express.Router();
const db = require('../database');
const { authMiddleware, adminMiddleware } = require('../middleware');

router.get('/', (req, res) => {
  const { lang, category, search, sort } = req.query;
  let query = 'SELECT * FROM books WHERE 1=1';
  const params = [];

  if (lang)     { query += ' AND language = ?';                        params.push(lang); }
  if (category) { query += ' AND category = ?';                        params.push(category); }
  if (search)   { query += ' AND (title LIKE ? OR author LIKE ?)';     params.push(`%${search}%`, `%${search}%`); }

  if (sort === 'downloads')    query += ' ORDER BY downloads DESC';
  else if (sort === 'rating')  query += ' ORDER BY rating DESC';
  else if (sort === 'newest')  query += ' ORDER BY created_at DESC';
  else                         query += ' ORDER BY id DESC';

  try {
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'الكتاب غير موجود' });
  res.json(row);
});

router.post('/', adminMiddleware, (req, res) => {
  const { title, author, language, category, description, cover_emoji, cover_color, pages, year } = req.body;
  try {
    const result = db.prepare(
      `INSERT INTO books (title,author,language,category,description,cover_emoji,cover_color,pages,year)
       VALUES (?,?,?,?,?,?,?,?,?)`
    ).run(title, author, language, category, description, cover_emoji||'📚', cover_color||'linear-gradient(135deg,#1a2a1a,#2d4a2d)', pages, year);
    res.json({ id: result.lastInsertRowid, message: 'تم إضافة الكتاب ✅' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', adminMiddleware, (req, res) => {
  const { title, author, language, category, description, cover_emoji, cover_color, pages, year } = req.body;
  try {
    db.prepare(
      `UPDATE books SET title=?,author=?,language=?,category=?,description=?,cover_emoji=?,cover_color=?,pages=?,year=? WHERE id=?`
    ).run(title, author, language, category, description, cover_emoji, cover_color, pages, year, req.params.id);
    res.json({ message: 'تم التحديث ✅' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', adminMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
    res.json({ message: 'تم الحذف ✅' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/download', (req, res) => {
  db.prepare('UPDATE books SET downloads = downloads + 1 WHERE id = ?').run(req.params.id);
  res.json({ message: 'ok' });
});

router.post('/:id/review', authMiddleware, (req, res) => {
  const { rating, comment } = req.body;
  try {
    db.prepare('INSERT INTO reviews (user_id,book_id,rating,comment) VALUES (?,?,?,?)')
      .run(req.user.id, req.params.id, rating, comment);
    const r = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE book_id=?').get(req.params.id);
    db.prepare('UPDATE books SET rating=?,rating_count=? WHERE id=?').run(r.avg, r.cnt, req.params.id);
    res.json({ message: 'تم إضافة التقييم ✅' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id/reviews', (req, res) => {
  const rows = db.prepare(
    `SELECT reviews.*, users.name FROM reviews
     JOIN users ON reviews.user_id = users.id
     WHERE reviews.book_id = ? ORDER BY reviews.created_at DESC`
  ).all(req.params.id);
  res.json(rows);
});

module.exports = router;