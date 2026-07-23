# Implementation Plan: Fitur Convert PDF (006)

## Phase 1: Persiapan Lingkungan & Engine Konversi
- [ ] Task: Integrasi LibreOffice Headless (Untuk konversi Office)
    - [ ] Setup script `setup-binaries.ts` untuk mengunduh/memastikan LibreOffice portabel tersedia.
    - [ ] Buat fungsi pembungkus (wrapper) untuk mengeksekusi konversi dokumen Office menggunakan `execa`.
- [ ] Task: Integrasi Konversi Gambar (Ghostscript / Libraries lokal)
    - [ ] Tambahkan konfigurasi `pdf-lib` untuk menyatukan gambar (JPG/PNG) ke dalam sebuah halaman PDF baru (Image-to-PDF).
    - [ ] Konfigurasi Ghostscript / Poppler untuk merender halaman PDF menjadi file gambar (PDF-to-Image).

## Phase 2: Pengembangan Lapisan Backend (Main Process)
- [ ] Task: Buat IPC Handlers untuk Konversi PDF
    - [ ] Buat file `src/main/handlers/convertHandler.ts`.
    - [ ] Daftarkan channel `pdf:convert` di `src/shared/ipc-channels.ts`.
    - [ ] Implementasikan logika untuk menganalisis format *input* dan memilih program CLI / library konversi yang sesuai.
- [ ] Task: Perbarui `src/shared/ipc-types.ts`
    - [ ] Definisikan kontrak *interface payload* konversi (parameter mode, output, opsi halaman).

## Phase 3: Pengembangan Frontend (Renderer Process)
- [ ] Task: Persiapan State Management (Zustand)
    - [ ] Buat `src/renderer/src/store/convertStore.ts` untuk mengelola form input, progres batch, file, dan status error.
- [ ] Task: Pembuatan Halaman ConvertPage
    - [ ] Buat file `src/renderer/src/pages/ConvertPage.tsx` menggunakan tata letak grid `lg:grid-cols-12` asimetris.
    - [ ] Integrasikan kotak *drag-and-drop* file dinamis yang mampu mengenali jenis file ekstensi (*.pdf*, *.docx*, *.jpg* dll).
    - [ ] Integrasikan `PDFCanvasPreview` jika input adalah PDF.
- [ ] Task: Pembuatan Pengaturan Konversi UI
    - [ ] Implementasi form tipe konversi via `RadioGroup` dari shadcn/ui.
    - [ ] Implementasi validasi rentang halaman yang responsif *(real-time)*.

## Phase 4: Integrasi Akhir & Finishing
- [ ] Task: Pengujian (QA) Fitur Lengkap
    - [ ] Uji performa *batch processing* beberapa dokumen Office ke PDF.
    - [ ] Uji keluaran file PDF ke ZIP (gambar banyak).
- [ ] Task: Optimalisasi UX
    - [ ] Kunci dimensi (min-height) UI agar tidak terjadi *scroll-jump*.
    - [ ] Tambahkan notifikasi UI dan blokir aksi secara bersih.
