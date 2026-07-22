# Track Plan: Setup Skeleton & Arsitektur Awal

**Deskripsi:** Menginisialisasi kerangka dasar proyek LocalPDF sesuai dengan dokumen rancangan. Meliputi pembuatan struktur folder, pengaturan Main Process (Node.js), Preload Script (contextBridge), dan Renderer (React + Tailwind).

---

## Tahap 1: Setup Struktur Folder & Dependencies
- [ ] Buat direktori utama: `src/main/`, `src/preload/`, `src/renderer/`, dan `src/shared/`.
- [ ] Install dependency tambahan yang dibutuhkan (React, ReactDOM, Tailwind CSS, dll) jika belum ada di `package.json`.
- [ ] Buat file konfigurasi TypeScript pendukung (mis. `tsconfig.node.json`, `tsconfig.web.json` jika menggunakan pemisahan module).

## Tahap 2: Main Process & Preload Script
- [ ] Buat `src/main/index.ts` sebagai entry point Electron.
- [ ] Buat `src/main/window.ts` untuk fungsi pembentukan BrowserWindow.
- [ ] Definisikan kontrak IPC awal di `src/shared/ipc-channels.ts` dan `src/shared/ipc-types.ts`.
- [ ] Buat `src/preload/index.ts` untuk mengekspos API ke renderer secara aman menggunakan `contextBridge`.

## Tahap 3: Renderer Process (UI React)
- [ ] Buat file `index.html` sebagai kerangka utama.
- [ ] Konfigurasi Tailwind CSS (`tailwind.config.ts` dan `globals.css`).
- [ ] Buat `src/renderer/src/main.tsx` sebagai titik masuk React.
- [ ] Buat `src/renderer/src/App.tsx` dasar (menyediakan layout dasar/dashboard kosong).
- [ ] Hubungkan komponen shadcn/ui dan *utility functions* (seperti `cn()`).

## Tahap 4: Verifikasi & Testing
- [ ] Pastikan skrip `npm run dev` dapat menjalankan aplikasi tanpa *error* kompilasi.
- [ ] Verifikasi bahwa IPC (dari React ke Main Process) dapat berjalan dengan memanggil fungsi dummy via `window.api`.
- [ ] Pastikan *hot-reloading* atau kompilasi tsc berjalan lancar.
