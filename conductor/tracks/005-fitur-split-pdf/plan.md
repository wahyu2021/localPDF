# Implementation Plan: Fitur Split PDF

## Phase 1: Setup & State Management
- [ ] Task: Buat Tipe Data IPC untuk proses Split (`SPLIT_PDF` payload & response) di `src/shared/ipc-types.ts`.
- [ ] Task: Pastikan konstan channel IPC tersedia di `src/shared/ipc-channels.ts`.
- [ ] Task: Buat Global Store Zustand (`src/renderer/src/store/splitStore.ts`) untuk mengelola status file tunggal, opsi mode, teks input *range*, dan hasil proses.
- [x] Task: Buat Tipe Data IPC untuk proses Split (`SPLIT_PDF` payload & response) di `src/shared/ipc-types.ts`.
- [x] Task: Pastikan konstan channel IPC tersedia di `src/shared/ipc-channels.ts`.
- [x] Task: Buat Global Store Zustand (`src/renderer/src/store/splitStore.ts`) untuk mengelola status file tunggal, opsi mode, teks input *range*, dan hasil proses.
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Backend Logic & QPDF Integration
- [x] Register IPC Handler `SPLIT_PDF` in `src/main/index.ts`.
- [x] Create `splitHandler.ts` to process:
  - `split_all` (Extract all pages into separate PDFs)
  - `extract` (Extract specific pages/ranges like "1-3, 5")
- [x] Integrate `qpdf` binary for actual splitting.
- [x] Implement IPC Handler `SELECT_FOLDER` using Electron `dialog.showOpenDialog`.
- [x] Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Frontend UI & State Connection
- [x] Create `src/renderer/src/pages/SplitPage.tsx`
  - Two modes: Extract Range, Split All.
  - Dropzone / File selection.
  - Text input for range.
- [x] Integrate with `src/renderer/src/App.tsx`.
- [x] Wire UI with `useSplitStore`.
- [x] Add PDF Preview using `react-pdf`.
- [x] Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: Testing & Polish
- [x] Test `split_all` mode.
- [x] Test `extract` mode with valid and invalid inputs.
- [x] Test UI feedback (processing state, success state).
