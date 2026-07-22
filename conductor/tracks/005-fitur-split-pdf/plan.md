# Implementation Plan: Fitur Split PDF

## Phase 1: Setup & State Management
- [ ] Task: Buat Tipe Data IPC untuk proses Split (`SPLIT_PDF` payload & response) di `src/shared/ipc-types.ts`.
- [ ] Task: Pastikan konstan channel IPC tersedia di `src/shared/ipc-channels.ts`.
- [ ] Task: Buat Global Store Zustand (`src/renderer/src/store/splitStore.ts`) untuk mengelola status file tunggal, opsi mode, teks input *range*, dan hasil proses.
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Backend Logic (QPDF Execution)
- [ ] Task: Buat *handler* baru `src/main/handlers/splitHandler.ts` untuk menangani instruksi IPC.
- [ ] Task: Tambahkan logika IPC khusus untuk membuka dialog **Select Folder** dari *Main Process* ke `preload/index.ts`.
- [ ] Task: Tulis perakitan argumen QPDF untuk eksekusi mode 'Extract Range' (`qpdf --empty --pages...`) dan mode 'Split All' (`qpdf --split-pages...`).
- [ ] Task: Registrasikan `splitHandler` di `src/main/index.ts`.
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Frontend Integration & Desktop UI
- [ ] Task: Buat komponen UI utama `src/renderer/src/pages/SplitPage.tsx` dengan desain *native desktop* (Pilihan *Tab/Radio* untuk mode, dan *Input Range*).
- [ ] Task: Ekspos API `splitPdf` dan `selectFolder` di dalam *preload script* (`src/preload/index.ts`).
- [ ] Task: Implementasikan transisi antar mode (Input → Loading → Success) dan hubungkan *store* dengan pemanggilan IPC.
- [ ] Task: Hubungkan *SplitPage* ke navigasi utama di `src/renderer/src/App.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
