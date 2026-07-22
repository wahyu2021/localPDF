# Track Plan: Setup Engine & Binary Manager

**Deskripsi:** Mempersiapkan arsitektur backend untuk mengunduh, membundel, dan mengeksekusi binary native (QPDF & Ghostscript) secara aman dari Main Process Electron menggunakan `execa`.

---

## Tahap 1: Persiapan Folder & Gitignore
- [ ] Buat direktori `scripts/` untuk skrip instalasi dan `binaries/win/` untuk menampung file eksekusi.
- [ ] Perbarui `.gitignore` agar mengabaikan direktori `binaries/` (karena binary ini terlalu besar untuk repositori Git).

## Tahap 2: Skrip Download Otomatis
- [ ] Buat skrip `scripts/setup-binaries.ts`.
- [ ] Implementasikan logika untuk mengunduh QPDF (versi rilis Windows) dan meletakkannya di `binaries/win/`.
- [ ] Implementasikan logika untuk mengunduh Ghostscript dan meletakkannya di `binaries/win/`.
*(Catatan: LibreOffice akan diatur terpisah pada iterasi selanjutnya).*

## Tahap 3: Path Resolver & Temp Manager
- [ ] Buat `src/main/utils/binaryPath.ts` untuk mendapatkan *absolute path* binary (penting karena letak file akan berbeda saat development vs setelah jadi `.exe`).
- [ ] Buat `src/main/utils/tempFileManager.ts` untuk mengatur pembuatan folder temporer (`temp/uploads` & `temp/output`) dan auto-cleanup.

## Tahap 4: Engine Runner Generic (execa wrapper)
- [ ] Buat modul `src/main/engines/engineRunner.ts`.
- [ ] Buat fungsi pembungkus (wrapper) `runEngine(binaryName, args, options)` menggunakan `execa`.
- [ ] Integrasikan pengaturan batas waktu (*timeout*), manajemen *child process*, dan pelemparan *error* log menggunakan `electron-log`.
