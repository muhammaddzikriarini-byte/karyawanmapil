const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Inisialisasi Database
const db = new sqlite3.Database("./database.db", (err) => {
    if (err) console.error("Gagal terhubung ke database:", err.message);
    else console.log("Database SQLite siap digunakan!");
});

// Buat Tabel otomatis jika belum ada
db.serialize(() => {
    // Tabel Kontak (Pesan)
    db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT,
        email TEXT,
        pesan TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabel Galeri Gambar (Lengkap: kategori, judul, subjudul, deskripsi, image_url)
    db.run(`
    CREATE TABLE IF NOT EXISTS galleries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kategori TEXT,
        judul TEXT,
        subjudul TEXT,
        deskripsi TEXT,
        image_url TEXT
    )`);
});

// ==========================================
// 1. API KONTAK (GET & POST)
// ==========================================

// [GET] Ambil semua data pesan kontak
app.get("/api/contact", (req, res) => {
    const sql = "SELECT * FROM contacts ORDER BY id DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ status: "error", message: err.message });
        }
        res.json({ status: "success", data: rows });
    });
});

// [POST] Simpan pesan baru dari form kontak
app.post("/api/contact", (req, res) => {
    const { nama, email, pesan } = req.body;

    if (!nama || !email || !pesan) {
        return res.status(400).json({
            status: "failed",
            message: "Semua kolom (nama, email, pesan) wajib diisi!",
        });
    }

    const sql = "INSERT INTO contacts (nama, email, pesan) VALUES (?, ?, ?)";
    db.run(sql, [nama, email, pesan], function (err) {
        if (err) {
            return res.status(500).json({ status: "error", message: err.message });
        }
        res.status(201).json({
            status: "success",
            message: "Pesan berhasil dikirim!",
            data: { id: this.lastID, nama, email, pesan },
        });
    });
});

// ==========================================
// 2. API GAMBAR / GALERI (GET & POST)
// ==========================================

// [GET] Ambil daftar gambar (Bisa difilter via Query Parameter, misal: ?kategori=RPL)
app.get("/api/gallery", (req, res) => {
    const { kategori, subjudul } = req.query;

    let sql = "SELECT * FROM galleries";
    let params = [];
    let conditions = [];

    if (kategori) {
        conditions.push("kategori = ?");
        params.push(kategori);
    }

    if (subjudul) {
        conditions.push("subjudul = ?");
        params.push(subjudul);
    }

    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY id ASC";

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ status: "error", message: err.message });
        }
        res.json({ status: "success", data: rows });
    });
});

// [POST] Tambah data gambar (Support 1 data atau Banyak data sekaligus)
app.post("/api/gallery", (req, res) => {
    const data = req.body;

    // A. Jika data yang dikirim berupa Array (Banyak data sekaligus)
    if (Array.isArray(data)) {
        if (data.length === 0) {
            return res.status(400).json({
                status: "failed",
                message: "Data array tidak boleh kosong!",
            });
        }

        const placeholders = data.map(() => "(?, ?, ?, ?, ?)").join(", ");
        const sql = `INSERT INTO galleries (kategori, judul, subjudul, deskripsi, image_url) VALUES ${placeholders}`;
        
        const values = [];
        data.forEach((item) => {
            values.push(
                item.kategori || "",
                item.judul || "", 
                item.subjudul || "", 
                item.deskripsi || "", 
                item.image_url || ""
            );
        });

        db.run(sql, values, function (err) {
            if (err) {
                return res.status(500).json({ status: "error", message: err.message });
            }
            res.status(201).json({
                status: "success",
                message: `${this.changes} data gambar berhasil ditambahkan sekaligus!`,
            });
        });
    } 
    // B. Jika data yang dikirim cuma 1 Object
    else {
        const { kategori, judul, subjudul, deskripsi, image_url } = data;

        if (!judul) {
            return res.status(400).json({
                status: "failed",
                message: "Judul/Nama wajib diisi!",
            });
        }

        const sql = "INSERT INTO galleries (kategori, judul, subjudul, deskripsi, image_url) VALUES (?, ?, ?, ?, ?)";
        db.run(sql, [kategori || "", judul, subjudul || "", deskripsi || "", image_url || ""], function (err) {
            if (err) {
                return res.status(500).json({ status: "error", message: err.message });
            }
            res.status(201).json({
                status: "success",
                message: "Gambar berhasil ditambahkan ke galeri!",
                data: { 
                    id: this.lastID, 
                    kategori: kategori || "",
                    judul, 
                    subjudul: subjudul || "", 
                    deskripsi: deskripsi || "", 
                    image_url: image_url || ""
                },
            });
        });
    }
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server Backend berjalan di http://localhost:${PORT}`);
});