const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 5000;

// Middleware (Izin akses & parsing JSON)
app.use(cors());
app.use(express.json());

// Inisialisasi Database SQLite
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error('Gagal terhubung ke database:', err.message);
    else console.log('Database SQLite berhasil dibuat/terhubung!');
});

// Buat Tabel Otomatis Jika Belum Ada
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT,
      email TEXT,
      pesan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS galleries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      judul TEXT,
      image_url TEXT
    )
  `);
});

// === ENDPOINT FORM KONTAK ===

// 1. Ambil Semua Pesan Masuk
app.get('/api/contact', (req, res) => {
    db.all('SELECT * FROM contacts ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2. Kirim Pesan Baru
app.post('/api/contact', (req, res) => {
    const { nama, email, pesan } = req.body;
    if (!nama || !email || !pesan) {
        return res.status(400).json({ error: 'Semua kolom wajib diisi!' });
    }

    db.run(
        'INSERT INTO contacts (nama, email, pesan) VALUES (?, ?, ?)',
        [nama, email, pesan],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Pesan berhasil disimpan!', id: this.lastID });
        }
    );
});

// === ENDPOINT GALERI ===

// 3. Ambil Semua Foto Galeri
app.get('/api/gallery', (req, res) => {
    db.all('SELECT * FROM galleries ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 4. Tambah Foto Baru ke Galeri
app.post('/api/gallery', (req, res) => {
    const { judul, image_url } = req.body;
    if (!judul || !image_url) {
        return res.status(400).json({ error: 'Judul dan URL Gambar wajib diisi!' });
    }

    db.run(
        'INSERT INTO galleries (judul, image_url) VALUES (?, ?)',
        [judul, image_url],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Foto berhasil ditambahkan!', id: this.lastID });
        }
    );
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server Backend berjalan di http://localhost:${PORT}`);
});