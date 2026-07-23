# Specification: Fitur Split PDF

## 1. Overview
Fitur "Split PDF" memungkinkan pengguna memecah satu dokumen PDF besar menjadi beberapa dokumen kecil, atau mengekstrak halaman tertentu menjadi satu dokumen PDF baru secara luring (offline) menggunakan *engine* QPDF.

## 2. Functional Requirements
- **Mode Operasi (Dual Mode):**
  1. **Ekstrak/Range:** Pengguna dapat mengekstrak halaman tertentu (atau beberapa rentang) menjadi satu file gabungan baru.
  2. **Pecah Semua (Split All):** Setiap halaman dalam dokumen akan dipecah menjadi file PDF yang berdiri sendiri.
- **Mekanisme Input:**
  - Hanya menerima 1 file PDF dalam satu sesi pemrosesan.
  - Untuk mode Ekstrak, tersedia *text input* tempat pengguna mengetik rentang (contoh: `1-3, 5, 7-10`). Teks divalidasi dengan format standar rentang angka.
- **Merge Engine (QPDF):**
  - Menggunakan eksekusi lokal lewat QPDF.
  - *Extract mode:* `qpdf --empty --pages input.pdf 1-3,5 -- output.pdf`
  - *Split All mode:* `qpdf --split-pages input.pdf output_prefix.pdf`
- **Save Flow:** Menampilkan indikator *loading*. Saat eksekusi akan dimulai, aplikasi memunculkan dialog **Pilih Folder (Select Directory)**. File hasil akan langsung di-generate oleh QPDF ke dalam folder tersebut dengan penamaan otomatis.
- **Result UI:** Layar hasil menampilkan keterangan jumlah file/halaman yang berhasil diekstrak dan tombol aksi "Buka Folder Tujuan" atau "Mulai Ulang".

## 3. Out of Scope
- Pratinjau (*preview*) visual isi setiap halaman dokumen.
- Memisahkan lebih dari 1 file asal (batch splitting) dalam sekali jalan.
