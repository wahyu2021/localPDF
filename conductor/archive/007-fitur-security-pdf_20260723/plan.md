# Implementation Plan: Security PDF (007-fitur-security-pdf)

## Phase 1: Setup & Backend Implementation (QPDF)
- [ ] Task: Definisikan format payload dan channel di `shared/ipc-channels.ts` dan `shared/ipc-types.ts` untuk keamanan (encrypt, decrypt, restrict).
- [ ] Task: Buat `main/handlers/securityHandler.ts` untuk mengorkestrasi eksekusi perintah QPDF.
    - [ ] Sub-task: Implementasi logika enkripsi (menambah user password).
    - [ ] Sub-task: Implementasi logika dekripsi (menghapus password dari file).
    - [ ] Sub-task: Implementasi logika restriksi (menetapkan owner password dan menolak akses cetak/salin).
- [ ] Task: Daftarkan *handler* baru ke dalam `main/index.ts`.
- [ ] Task: Tambahkan *bridge* API di `preload/index.ts`.

## Phase 2: State Management (Frontend)
- [ ] Task: Buat `renderer/src/store/securityStore.ts` (Zustand).
    - [ ] Sub-task: Kelola state `mode` (lock | unlock | restrict), `file`, `passwords`, dan konfigurasi `restrictions`.

## Phase 3: UI & Routing Implementation
- [ ] Task: Buat komponen halaman `renderer/src/pages/SecurityPage.tsx`.
    - [ ] Sub-task: Buat UI *mode-first* (pilih opsi Kunci/Buka Kunci/Batasi sebelum upload).
    - [ ] Sub-task: Gunakan `<DragDropZone>` yang sudah konsisten untuk input file.
    - [ ] Sub-task: Buat panel input pengaturan password dan *checkbox* batasan akses.
- [ ] Task: Integrasikan `securityStore` dengan komponen frontend dan panggil fungsi Electron API.
- [ ] Task: Daftarkan rute `/security` di *sidebar* navigasi pada `App.tsx`.

## Phase 4: Testing & Polish
- [ ] Task: Uji semua skenario keamanan dan pastikan penanganan error (seperti salah password) tampil rapi di UI.
- [ ] Task: Conductor - User Manual Verification 'Security PDF' (Protocol in workflow.md)
