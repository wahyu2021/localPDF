# Track: 003-fitur-compress-pdf

## Overview
Implementasi fitur "Compress PDF" untuk mengecilkan ukuran file PDF secara offline menggunakan **Ghostscript**. Fitur ini akan memiliki antarmuka (UI) React yang sangat interaktif dan premium.

## Functional Requirements
1. **Pengaturan Kualitas (Quality Levels):**
   - **Mode Cepat (Presets):** Pilihan baku (Extreme Compression, Recommended Compression, Less Compression) setara *preset* PDFSETTINGS Ghostscript (`/screen`, `/ebook`, `/printer`).
   - **Mode Kustom (Advanced):** Slider interaktif bagi *power user* untuk mengatur DPI gambar (image resolution) secara spesifik.
2. **UI/UX (Renderer):**
   - **Zona Drag-and-Drop:** Area drop file yang dilengkapi animasi halus (micro-animations) saat file ditarik ke dalam aplikasi.
   - **Thumbnail Preview:** Aplikasi akan mengekstrak dan menampilkan pratinjau (thumbnail) dari halaman pertama dokumen PDF yang dimasukkan.
   - **Feedback Proses:** Menampilkan *progress bar* dinamis selama kompresi backend berjalan untuk meyakinkan pengguna bahwa aplikasi tidak macet.
   - **Toast Notification:** Menampilkan notifikasi sukses/gagal yang modern saat proses berakhir.
3. **Manajemen Penyimpanan (Backend/IPC):**
   - Proses dienkapsulasi menggunakan state management **Zustand**.
   - Ketika eksekusi Ghostscript via `engineRunner` selesai, Main Process akan memicu **dialog native Save As**.
   - Nama file bawaan (default) yang ditawarkan pada dialog *Save As* adalah `<nama-asli>_compressed.pdf`.

## Acceptance Criteria
- [ ] Pengguna bisa drag-and-drop dokumen PDF atau memilih lewat File Explorer.
- [ ] Thumbnail halaman pertama PDF berhasil dirender di UI sebelum proses kompresi dimulai.
- [ ] Kompresi berjalan via IPC ke Ghostscript (`gswin64c.exe`) tanpa membekukan layar (non-blocking UI).
- [ ] Dialog "Simpan Sebagai" muncul setelah berhasil dikompresi.
- [ ] Mematuhi estetika premium (warna hijau-teal) dan standar JSDoc/TSDoc di dalam kode.
