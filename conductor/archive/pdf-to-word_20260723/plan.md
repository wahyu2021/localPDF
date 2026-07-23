# Implementation Plan: PDF to Word (DOCX) Conversion
# Track: pdf-to-word_20260723

## Phase 1: Shared Constants and Types

- [ ] Task: Add `PDF_TO_WORD` IPC channel constant.
    - [ ] Tambahkan `PDF_TO_WORD: 'pdf:to-word'` ke `src/shared/ipc-channels.ts`.
- [ ] Task: Definisikan tipe IPC baru.
    - [ ] Tambahkan `PdfToWordPayload` ke `src/shared/ipc-types.ts`.
    - [ ] Tambahkan `PdfToWordResult` ke `src/shared/ipc-types.ts`.

## Phase 2: Backend Implementation (Main Process)

- [ ] Task: Buat `src/main/handlers/pdfToWordHandler.ts`.
    - [ ] Implementasikan fungsi `registerPdfToWordHandler`.
    - [ ] Generate temporary task ID dan output path menggunakan `tempFileManager`.
    - [ ] Implementasikan pemanggilan LibreOffice headless via `execa` (bukan `runEngine` karena argumen berbeda).
    - [ ] Implementasikan progress reporting dasar (`sendProgress`: 10% mulai, 100% selesai).
    - [ ] Implementasikan logika salin file dan hapus temp.
- [ ] Task: Update `src/main/index.ts`.
    - [ ] Import dan daftarkan `registerPdfToWordHandler(mainWindow)`.

## Phase 3: Frontend State Management

- [ ] Task: Buat `src/renderer/src/store/pdfToWordStore.ts`.
    - [ ] Definisikan interface state: `file`, `filePath`, `isProcessing`, `progress`, `result`.
    - [ ] Implementasikan semua setter actions.
    - [ ] Implementasikan fungsi `reset`.

## Phase 4: Frontend UI Implementation

- [ ] Task: Buat `src/renderer/src/pages/PDFToWord/index.tsx`.
    - [ ] Implementasikan Drag & Drop zone untuk upload PDF.
    - [ ] Implementasikan `useEffect` untuk `onProgressUpdate`.
    - [ ] Implementasikan state loading dengan progress bar dan estimasi waktu.
    - [ ] Implementasikan state sukses dengan tombol "Simpan File Word".
    - [ ] Implementasikan handler `handleConvert` yang memanggil IPC.
    - [ ] Implementasikan handler `handleSave` yang membuka dialog simpan.
- [ ] Task: Update `src/renderer/src/App.tsx`.
    - [ ] Tambahkan rute `/pdf-to-word` yang mengarah ke `<PDFToWordPage />`.
- [ ] Task: Update `src/renderer/src/components/layout/Sidebar.tsx`.
    - [ ] Tambahkan tautan navigasi "PDF ke Word" dengan ikon yang sesuai.

## Phase 5: Verification & Commit

- [ ] Task: Jalankan dev server dan uji seluruh alur konversi secara manual.
- [ ] Task: Commit semua perubahan dengan pesan: `feat: tambah fitur konversi PDF ke Word menggunakan LibreOffice`.
- [ ] Task: Push ke branch `develop`.
