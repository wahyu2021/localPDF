# Spesifikasi Track: Refactor UI Components (PDFToWord & Lainnya)

## 1. Ikhtisar
Mengekstrak dan menyederhanakan kode UI yang berulang di halaman `PDFToWord` (dan halaman fitur lainnya) ke dalam komponen *shared/feature-driven* yang dapat digunakan kembali, guna memastikan kode DRY dan konsisten.

## 2. Persyaratan Fungsional
1. **Pemanfaatan Atomic Components:** Komponen baru akan menggunakan komponen dasar dari `components/ui/` (seperti Card dan Button).
2. **Ekstraksi Feature-Driven Components Baru:** Membuat komponen *shared* yang belum ada:
   - `SuccessCard` (`shared/`): Untuk membungkus tampilan hasil sukses (ikon bulat, pesan sukses, tombol aksi).
   - `ProcessActionGroup` (`shared/`): Untuk membungkus grup tombol aksi dan *progress bar* di bagian bawah panel konfigurasi.
3. **Penerapan Refactor:** Menerapkan komponen tersebut pada halaman `PDFToWord` dan halaman fitur lainnya (Compress, Merge, Split, Convert, Security) secara menyeluruh.

## 3. Di Luar Cakupan (Out of Scope)
- Penambahan fitur fungsional PDF baru.
- Perubahan alur logika backend (Main process). Refactor ini murni struktural UI (Renderer).
