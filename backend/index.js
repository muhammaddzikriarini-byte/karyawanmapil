require("dotenv").config(); // Load environment variables dari file .env

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Inisialisasi Database MySQL Laragon dari .env
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Gagal terhubung ke MySQL:", err.message);
  } else {
    console.log("Database MySQL Laragon siap digunakan!");
  }
});

// ==========================================
// 1. API KONTAK (GET & POST)
// ==========================================

app.get("/api/contact", (req, res) => {
  const sql = "SELECT * FROM contacts ORDER BY id DESC";
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ status: "error", message: err.message });
    res.json({ status: "success", data: rows });
  });
});

app.post("/api/contact", (req, res) => {
  const { nama, email, pesan } = req.body;

  if (!nama || !email || !pesan) {
    return res.status(400).json({
      status: "failed",
      message: "Semua kolom (nama, email, pesan) wajib diisi!",
    });
  }

  const sql = "INSERT INTO contacts (nama, email, pesan) VALUES (?, ?, ?)";
  db.query(sql, [nama, email, pesan], (err, result) => {
    if (err) return res.status(500).json({ status: "error", message: err.message });
    res.status(201).json({
      status: "success",
      message: "Pesan berhasil dikirim!",
      data: { id: result.insertId, nama, email, pesan },
    });
  });
});

// ==========================================
// 2. API GAMBAR / GALERI (GET & POST)
// ==========================================

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

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ status: "error", message: err.message });
    res.json({ status: "success", data: rows });
  });
});

app.post("/api/gallery", (req, res) => {
  const data = req.body;

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

    db.query(sql, values, (err, result) => {
      if (err) return res.status(500).json({ status: "error", message: err.message });
      res.status(201).json({
        status: "success",
        message: `${result.affectedRows} data gambar berhasil ditambahkan sekaligus!`,
      });
    });
  } else {
    const { kategori, judul, subjudul, deskripsi, image_url } = data;

    if (!judul) {
      return res.status(400).json({
        status: "failed",
        message: "Judul/Nama wajib diisi!",
      });
    }

    const sql = "INSERT INTO galleries (kategori, judul, subjudul, deskripsi, image_url) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [kategori || "", judul, subjudul || "", deskripsi || "", image_url || ""], (err, result) => {
      if (err) return res.status(500).json({ status: "error", message: err.message });
      res.status(201).json({
        status: "success",
        message: "Gambar berhasil ditambahkan ke galeri!",
        data: {
          id: result.insertId,
          kategori: kategori || "",
          judul,
          subjudul: subjudul || "",
          deskripsi: deskripsi || "",
          image_url: image_url || "",
        },
      });
    });
  }
});

// Jalankan Server
app.listen(PORT, () => {
  console.log(`Server Backend berjalan di http://localhost:${PORT}`);
});