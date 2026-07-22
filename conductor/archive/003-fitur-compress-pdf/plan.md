# Implementation Plan: Compress PDF

## Phase 1: IPC & Main Process Setup
- [ ] Task: Tambahkan kontrak IPC `pdf:compress` di `src/shared/ipc-channels.ts` dan tipe parameternya di `ipc-types.ts`.
- [ ] Task: Buat `src/main/handlers/compressHandler.ts` untuk menangani logika komunikasi dari frontend.
- [ ] Task: Susun fungsi logika yang merakit argumen (*flags*) Ghostscript berdasarkan pilihan resolusi user dan mengeksekusinya via `engineRunner`.
- [ ] Task: Hubungkan handler tersebut dengan fitur pemunculan `dialog.showSaveDialog` (dari modul Electron) secara native untuk menyimpan file ke komputer pengguna.

## Phase 2: State Management & UI Components (Renderer)
- [ ] Task: Buat `compressStore.ts` menggunakan Zustand untuk menyimpan state file yang ditarik, opsi kualitas, dan persentase progress.
- [ ] Task: Buat UI `DragDropZone.tsx` dengan deteksi *drag over* dan *micro-animations*.
- [ ] Task: Buat UI `ThumbnailPreview.tsx` (akan mencoba menggunakan pustaka ringan untuk mengekstrak cover pertama).
- [ ] Task: Buat UI `QualitySelector.tsx` yang memuat tab untuk "Preset" (Extreme, Recommended, Less) dan "Advanced" (Slider DPI).
- [ ] Task: Siapkan komponen umpan balik visual `ToastNotification.tsx`.

## Phase 3: Assembly & Integration
- [ ] Task: Buat halaman utuh `CompressPage.tsx` yang merangkai komponen-komponen di Fase 2.
- [ ] Task: Pasang *listener* untuk mengirim *request* kompresi IPC saat tombol "Compress PDF" ditekan.
- [ ] Task: Perbarui `App.tsx` agar memiliki Sidebar/Navbar dan me-render `CompressPage` sebagai fitur pertama.

## Phase 4: Pengujian & Finalisasi
- [ ] Task: Pengujian terintegrasi (memasukkan file PDF asli, melihat progress bar, menyimpan hasilnya, dan menguji efektivitas kompresi).
- [ ] Task: Verifikasi estetika desain (tema hijau-teal) dan dokumentasi (JSDoc).
