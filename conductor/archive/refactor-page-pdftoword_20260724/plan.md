# Rencana Implementasi: Refactor UI Components (PDFToWord & Lainnya)

## Phase 1: Pembuatan Shared Components
- [ ] Task: Buat komponen `SuccessCard.tsx` di direktori `src/renderer/src/components/shared/`.
- [ ] Task: Buat komponen `ProcessActionGroup.tsx` di direktori `src/renderer/src/components/shared/`.

## Phase 2: Refactoring Halaman PDFToWord
- [ ] Task: Hapus markup UI yang duplikat di `PDFToWord/index.tsx`.
- [ ] Task: Integrasikan `SuccessCard` dan `ProcessActionGroup` di halaman tersebut.
- [ ] Task: Pastikan aplikasi berjalan normal tanpa error JSX.

## Phase 3: Refactoring Sisa Halaman Fitur
- [ ] Task: Refactor `Compress/index.tsx` menggunakan komponen baru.
- [ ] Task: Refactor `Merge/index.tsx` menggunakan komponen baru.
- [ ] Task: Refactor `Split/index.tsx` menggunakan komponen baru.
- [ ] Task: Refactor `Convert/index.tsx` menggunakan komponen baru.
- [ ] Task: Refactor `Security/index.tsx` menggunakan komponen baru.

## Phase 4: Verifikasi & Commit
- [ ] Task: Jalankan `npx electron-vite build` untuk memastikan tidak ada error TypeScript/Build.
- [ ] Task: Uji navigasi UI secara visual.
- [ ] Task: Buat commit git menggunakan format Conventional Commits.
