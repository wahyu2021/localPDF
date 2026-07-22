# Product Guide — LocalPDF

## Initial Concept

Pengganti iLovePDF Premium — semua proses PDF dilakukan lokal, tanpa internet.

---

## 1. Visi Produk

LocalPDF adalah aplikasi desktop gratis dan open-source yang menyediakan semua fitur pengolahan PDF premium — compress, merge, split, convert, protect, unlock, OCR — sepenuhnya di mesin lokal pengguna. **Tidak ada file yang pernah dikirim ke server manapun.** Satu file installer, tanpa prasyarat, siap pakai oleh siapa saja.

**Tagline:** *"Semua fitur PDF premium. Gratis. Lokal. Privat."*

---

## 2. Target Pengguna

| Segmen | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Profesional** | Pekerja kantoran yang rutin mengolah dokumen sensitif (KTP, laporan keuangan, kontrak) | Privasi, kecepatan, tanpa watermark |
| **Mahasiswa & Pelajar** | Mengerjakan tugas, compress file untuk upload, merge dokumen skripsi | Gratis, tanpa batas ukuran/jumlah file |
| **Tim Kecil / UMKM** | Butuh tool PDF tanpa langganan per-seat | Zero-cost, offline, mudah didistribusikan |
| **Privacy-conscious User** | Tidak mau upload dokumen pribadi ke layanan cloud | 100% lokal, tidak ada network call |

---

## 3. Core Values

1. **🔒 Privasi Absolut** — Setiap byte data tetap di mesin pengguna. Tidak ada telemetry, tidak ada analytics, tidak ada network request. Cocok untuk dokumen sensitif.
2. **📦 Zero-Config Install** — Satu file `.exe` installer. Tidak perlu install Docker, WSL, Node.js, atau dependency apapun secara manual. Download → install → pakai.
3. **⚡ Performa Cepat** — File PDF <50MB diproses dalam hitungan detik. Engine native (QPDF, Ghostscript, LibreOffice) berjalan langsung tanpa overhead virtualisasi.

---

## 4. Fitur Produk

### 4.1 Must-Have (P0) — Rilis Pertama
| Fitur | Deskripsi | Engine |
|---|---|---|
| **Compress PDF** | 3 level kompresi (screen/ebook/printer) + custom DPI | Ghostscript |
| **Merge PDF** | Gabung banyak file PDF jadi satu | QPDF |
| **Split PDF** | Pecah per halaman atau per range (mis. 1-3, 5, 7-10) | QPDF |

### 4.2 Should-Have (P1) — Segera Setelah P0
| Fitur | Deskripsi | Engine |
|---|---|---|
| **Convert Office → PDF** | Word, Excel, PowerPoint ke PDF | LibreOffice headless |
| **Protect PDF** | Tambah password enkripsi 256-bit | QPDF |
| **Unlock PDF** | Hapus password (jika password diketahui) | QPDF |

### 4.3 Nice-to-Have (P2) — V1 atau V2
| Fitur | Deskripsi | Engine |
|---|---|---|
| **OCR** | Scan → PDF searchable (teks bisa di-select) | OCRmyPDF + Tesseract |
| **Rotate Halaman** | Putar halaman tertentu (90°/180°/270°) | QPDF |

---

## 5. Pengalaman Pengguna (UX)

### 5.1 Filosofi Desain
- **Modern & Premium** — Tampilan profesional yang tidak terasa seperti aplikasi "buatan sendiri". Dark mode sebagai default, animasi halus, dan micro-interactions yang bermakna.
- **Satu fitur, satu halaman** — Setiap fitur punya halaman fokus sendiri. Tidak ada form besar yang membingungkan.
- **3-State Flow** — Setiap halaman fitur mengikuti alur: *Idle → Processing → Selesai*, dengan feedback visual yang jelas di setiap state.

### 5.2 Alur Pengguna (Happy Path)
1. Buka aplikasi → lihat dashboard grid dengan 6 fitur utama.
2. Pilih fitur (mis. Compress) → drag-and-drop file PDF.
3. Atur opsi (mis. level kompresi) → klik tombol aksi.
4. Lihat progress bar → hasil ditampilkan (mis. "12.4MB → 2.1MB, hemat 83%").
5. Download hasil atau proses file lain.

---

## 6. Platform & Distribusi

| Aspek | Detail |
|---|---|
| **Platform v1** | Windows 10/11 64-bit |
| **Platform v2** | macOS, Linux (arsitektur sudah disiapkan) |
| **Format distribusi** | `.exe` installer (NSIS via electron-builder) |
| **Ukuran installer** | ~700MB (didominasi LibreOffice portable) |
| **Update mechanism** | Manual download versi baru (auto-update di v2) |

---

## 7. Non-Goals (Di Luar Cakupan v1)

- ❌ Kolaborasi multi-user / cloud sync
- ❌ E-signature
- ❌ PDF compare / diff
- ❌ Redaksi otomatis (auto-redact)
- ❌ Mobile app
- ❌ Web version
