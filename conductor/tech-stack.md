# Tech Stack — LocalPDF

## 1. Overview

LocalPDF adalah aplikasi desktop Electron yang memproses file PDF sepenuhnya secara lokal. Arsitektur terdiri dari 3 layer: **Main Process** (Node.js), **Renderer Process** (React/Chromium), dan **Engine Layer** (native binaries).

---

## 2. Core Platform

| Layer | Teknologi | Versi | Alasan Pemilihan |
|---|---|---|---|
| Desktop Shell | **Electron** | v43+ | Bundling native binary + distribusi 1 installer. Cross-platform ready. |
| Bahasa | **TypeScript** | v7.x | Type-safety untuk kontrak IPC lintas proses (main ↔ renderer). Strict mode enabled. |
| Build Tool | **electron-vite** | latest | Memisahkan build config main/preload/renderer otomatis. Hot-reload renderer saat development. |
| Module System | **CommonJS** (main) / **ESM** (renderer) | — | Main process menggunakan CommonJS (standar Electron), renderer menggunakan ESM via Vite. |

---

## 3. Frontend (Renderer Process)

| Kategori | Teknologi | Alasan |
|---|---|---|
| UI Framework | **React 18** | State management terstruktur untuk progress tracking multi-task. |
| Styling | **Tailwind CSS** | Rapid prototyping, utility-first, tanpa file CSS terpisah per komponen. |
| Komponen UI | **shadcn/ui** | Copy-paste components (bukan dependency). Mudah di-custom, ringan. |
| Icons | **Lucide React** | Konsisten dengan shadcn/ui, ringan, tree-shakeable. |
| State Management | **Zustand** | Lebih ringan dari Redux. Cukup untuk state task & progress tracking. |
| Drag & Drop | **react-dropzone** | Abstraksi drag-drop yang battle-tested, menghindari handler manual. |
| PDF Preview | **pdfjs-dist** (PDF.js) | Preview thumbnail halaman sebelum split/compress. |

---

## 4. Backend (Main Process)

| Kategori | Teknologi | Alasan |
|---|---|---|
| Binary Execution | **execa** | Promise-based API, lebih rapi dari `child_process` untuk error/timeout/output. |
| Task ID | **nanoid** | ID unik per task untuk progress tracking & temp folder isolation. |
| Zip Output | **archiver** | Bungkus hasil split/batch jadi 1 `.zip`. |
| Logging | **electron-log** | Log tersimpan ke file — penting untuk debug laporan bug, bukan hanya `console.log`. |
| IPC Security | **contextBridge** | `contextIsolation: true`, `nodeIntegration: false`. Renderer tidak pernah akses Node langsung. |

---

## 5. Engine Layer (Native Binaries — Bundled)

| Engine | Lisensi | Fungsi |
|---|---|---|
| **QPDF** | Apache 2.0 | Merge, Split, Protect (encrypt), Unlock (decrypt), Rotate |
| **Ghostscript** (`gswin64c`) | AGPL v3 | Compress PDF (3 level + custom DPI) |
| **LibreOffice** (headless/portable) | MPL 2.0 | Convert Office (Word/Excel/PPT) → PDF |
| **Tesseract** + **OCRmyPDF** | Apache 2.0 | OCR (P2, opsional) |

> Semua binary di-bundle di `binaries/win/` dan di-copy via `extraResources` electron-builder. Tidak masuk `asar` karena perlu dieksekusi langsung dari disk.

---

## 6. Development & Quality

| Kategori | Teknologi | Alasan |
|---|---|---|
| Testing | **Vitest** + **React Testing Library** | Satu ekosistem dengan Vite, lebih cepat dari Jest. Test co-located dengan source. |
| Linting | **ESLint** (typescript-eslint) | Konsistensi kode, deteksi error statis. |
| Formatting | **Prettier** | Format otomatis, tanpa debat style. |

---

## 7. Packaging & Distribusi

| Aspek | Detail |
|---|---|
| Packager | **electron-builder** |
| Target | `nsis` (Windows installer) |
| Output | `.exe` installer, satu file |
| Platform v1 | Windows 10/11 64-bit |
| Platform v2 | macOS (`dmg`), Linux (`AppImage`) — arsitektur sudah disiapkan |

---

## 8. Struktur Path Alias (tsconfig)

```json
{
  "@engines/*": ["src/main/engines/*"],
  "@utils/*": ["src/main/utils/*"],
  "@shared/*": ["src/shared/*"]
}
```
