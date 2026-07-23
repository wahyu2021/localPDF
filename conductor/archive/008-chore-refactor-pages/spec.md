# Specification: Refactor Pages (008-chore-refactor-pages)

## Overview
Track ini berfokus pada pembersihan dan restrukturisasi (refactoring) kode di sisi *Frontend* (React). Tujuan utamanya adalah mengurangi ukuran file komponen halaman yang sudah terlalu panjang (beberapa mencapai 300+ baris) untuk meningkatkan keterbacaan kode (*readability*) dan kemudahan pemeliharaan (*maintainability*) tanpa mengubah fungsi aplikasi.

## Scope
Pekerjaan ini akan diterapkan secara menyeluruh ke **semua halaman fitur** di aplikasi:
- `ConvertPage`
- `SecurityPage`
- `MergePage`
- `SplitPage`

## Refactoring Strategies
1. **Feature-Scoped Components:** Memecah blok UI yang panjang (seperti kartu pilihan mode atau panel form pengaturan) menjadi sub-komponen. Sub-komponen ini akan disimpan di dalam struktur folder baru per halaman (misal: `src/pages/Security/components/`).
2. **Layout Wrappers:** Membuat komponen kerangka standar (seperti `PageHeader` atau `FeatureLayout`) untuk merender elemen yang selalu berulang seperti tombol kembali, judul fitur, dan kerangka utama, sehingga menghilangkan duplikasi kode *wrapper*.
3. **Custom Hooks:** Mengekstrak fungsi-fungsi logika bisnis (seperti validasi dan komunikasi ke backend/IPC) dari komponen UI menjadi *custom hooks* jika diperlukan.

## Acceptance Criteria
- [ ] Ukuran kode di dalam file utama (seperti `SecurityPage.tsx`) menyusut drastis menjadi maksimal ~150 baris.
- [ ] Folder `src/pages/` menjadi lebih terstruktur dengan sub-folder untuk fitur yang kompleks.
- [ ] Aplikasi tetap berfungsi 100% normal tanpa ada regresi (fungsi yang rusak akibat refactor).
