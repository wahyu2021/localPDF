# Implementation Plan: Refactor Pages (008-chore-refactor-pages)

## Phase 1: Shared Layout Abstraction
- [ ] Task: Buat komponen layout standar di `src/renderer/src/components/FeatureLayout.tsx` (yang mencakup pembungkus halaman, judul, dan logika tombol "Kembali" yang seragam).

## Phase 2: Refactoring Security Page
- [ ] Task: Restrukturisasi direktori dengan membuat `src/renderer/src/pages/Security/` dan pindahkan `SecurityPage.tsx` ke dalamnya.
    - [ ] Sub-task: Buat sub-komponen `SecurityModeCards.tsx` untuk UI pemilihan mode awal.
    - [ ] Sub-task: Buat sub-komponen `SecuritySettingsPanel.tsx` untuk mengisolasi form input password dan restriksi.
- [ ] Task: Susun ulang file utama `SecurityPage.tsx` menggunakan komponen-komponen di atas dan `FeatureLayout`.

## Phase 3: Refactoring Convert Page
- [ ] Task: Restrukturisasi direktori dengan membuat `src/renderer/src/pages/Convert/` dan pindahkan `ConvertPage.tsx`.
    - [ ] Sub-task: Buat sub-komponen `ConvertModeCards.tsx`.
- [ ] Task: Susun ulang file utama `ConvertPage.tsx` menggunakan komponen-komponen baru dan `FeatureLayout`.

## Phase 4: Refactoring Merge & Split Pages
- [ ] Task: Restrukturisasi direktori untuk `Merge` dan `Split` ke folder masing-masing.
- [ ] Task: Terapkan `FeatureLayout` pada kedua halaman tersebut. (Karena komponen ini lebih sederhana, mungkin tidak butuh sub-komponen tambahan selain layouting).

## Phase 5: Finalization & Verification
- [ ] Task: Rapikan seluruh *import paths* di `App.tsx` dan memastikan aplikasi tidak mengalami *compile error*.
- [ ] Task: Conductor - User Manual Verification 'Refactor Pages' (Protocol in workflow.md)
