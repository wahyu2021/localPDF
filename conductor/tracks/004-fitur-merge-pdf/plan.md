# Implementation Plan: Fitur Merge PDF

## Phase 1: Setup & State Management
- [ ] Task: Buat Tipe Data IPC untuk proses Merge (`MERGE_PDF` payload & response) di `src/shared/ipc-types.ts`.
- [ ] Task: Daftarkan konstan IPC Channel untuk fitur Merge di `src/shared/ipc-channels.ts`.
- [ ] Task: Buat Global Store Zustand (`src/renderer/src/store/mergeStore.ts`) untuk menyimpan daftar antrean file PDF, status drag-and-drop, dan status loading.
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Backend Logic (QPDF Execution)
- [ ] Task: Buat handler backend `src/main/handlers/mergeHandler.ts` untuk menerima instruksi gabung.
- [ ] Task: Tulis logika perakitan argumen CLI (`--empty --pages file1 file2 -- fileOutput`).
- [ ] Task: Buat fungsi untuk mengeksekusi QPDF menggunakan *engineRunner*, lalu mengembalikan *path temporary file*.
- [ ] Task: Registrasikan *handler* baru ke dalam `src/main/index.ts`.
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Frontend Integration & Desktop UI
- [ ] Task: Buat komponen halaman `src/renderer/src/pages/MergePage.tsx`.
- [ ] Task: Implementasikan pustaka *Drag and Drop* ringan (misal `@hello-pangea/dnd` atau HTML5 API) untuk mengatur urutan *list* file.
- [ ] Task: Hubungkan halaman ke IPC (`window.api.mergePdf(...)`) lewat preload script.
- [ ] Task: Buat antarmuka (UI) hasil sukses bergaya *desktop-native* (tabel komparasi & tombol Save).
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
