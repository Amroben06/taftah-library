const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'taftah.db');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    language TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    cover_emoji TEXT DEFAULT '📚',
    cover_color TEXT DEFAULT 'linear-gradient(135deg,#1a2a1a,#2d4a2d)',
    pages INTEGER,
    year INTEGER,
    downloads INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(book_id) REFERENCES books(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(book_id) REFERENCES books(id)
  )`);

  db.get('SELECT COUNT(*) as count FROM books', (err, row) => {
    if (row && row.count === 0) {
      const books = [
        ['المناهج التربوية الحديثة', 'د. فاطمة الزهراء أمراني', 'AR', 'التربية', 'كتاب يتناول أحدث المناهج التربوية المعتمدة في المنظومة التعليمية المغربية.', '📗', 'linear-gradient(135deg,#1a2a1a,#2d4a2d)', 168, 2024],
        ['Introduction aux Sciences Naturelles', 'Prof. Ahmed Benali', 'FR', 'العلوم', 'Une introduction complète aux sciences naturelles adaptée au programme marocain.', '📘', 'linear-gradient(135deg,#1a1a2e,#2d2d4e)', 204, 2024],
        ['تاريخ المغرب الكبير عبر العصور', 'الأستاذ محمد الناصري', 'AR', 'التاريخ', 'رحلة شاملة عبر التاريخ المغربي منذ ما قبل التاريخ حتى العصر الحديث.', '📙', 'linear-gradient(135deg,#2a1a0a,#4a3010)', 312, 2023],
        ['Child Development & Education', 'Dr. Sarah Mitchell', 'EN', 'التربية', 'A comprehensive guide to understanding child development stages.', '📕', 'linear-gradient(135deg,#0a1a2a,#103050)', 256, 2024],
        ['ⵜⴰⵎⴰⵣⵉⵖⵜ ⴷ ⵓⵙⵏⵓⴱⴳ', 'ⴰⵙⵙⵉⵔⴹ ⵏ ⵜⴼⵉⵍⴰⵍⵜ', 'AMZ', 'الأمازيغية', 'كتاب يتناول اللغة الأمازيغية وآدابها وتراثها الشفهي.', '📒', 'linear-gradient(135deg,#1a0a2a,#301050)', 144, 2024],
        ['Géographie du Maroc Moderne', 'Rachid Ouali', 'FR', 'الجغرافيا', 'Exploration géographique du Maroc contemporain.', '📔', 'linear-gradient(135deg,#0a2a1a,#105030)', 188, 2023],
        ['الصحة النفسية للطفل', 'د. نادية الحسيني', 'AR', 'الصحة', 'دليل شامل للوالدين والمعلمين حول الصحة النفسية للأطفال.', '📓', 'linear-gradient(135deg,#2a0a0a,#4a1010)', 192, 2024],
        ['Mathématiques Appliquées', 'Prof. Youssef Tazi', 'FR', 'الرياضيات', 'Manuel de mathématiques appliquées couvrant algèbre et géométrie.', '📑', 'linear-gradient(135deg,#1a2a0a,#2a4010)', 240, 2023],
      ];
      const stmt = db.prepare(`INSERT INTO books (title,author,language,category,description,cover_emoji,cover_color,pages,year) VALUES (?,?,?,?,?,?,?,?,?)`);
      books.forEach(b => stmt.run(b));
      stmt.finalize();
      console.log('✅ Sample books seeded');
    }
  });

});

module.exports = db;