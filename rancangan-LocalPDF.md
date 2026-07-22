# Rancangan Aplikasi: LocalPDF
### Software Design Document — Pengganti iLovePDF Premium (Electron Desktop App)

**Versi dokumen:** 1.1 — tech stack difinalkan (React + TypeScript)
**Status:** Draft rancangan, siap masuk implementasi Fase 0
**Target platform utama:** Windows (dengan opsi ekspansi ke macOS/Linux)

---

## 1. Latar Belakang & Tujuan

### 1.1 Masalah yang diselesaikan
Fitur premium iLovePDF (compress tanpa batas, batch processing, tanpa watermark, dsb.) mengharuskan langganan berbayar. Kebutuhan sebenarnya — compress, merge, split, convert PDF — bisa dipenuhi 100% oleh engine open-source yang berjalan lokal, tanpa biaya berlangganan dan tanpa data keluar ke server pihak ketiga.

### 1.2 Tujuan produk
1. Menyediakan fitur inti iLovePDF secara lokal & gratis, tanpa batas ukuran/jumlah file.
2. Bisa didistribusikan ke orang lain (teman) sebagai **satu file installer**, tanpa mengharuskan mereka install Docker/WSL/Node.js/dependency apa pun secara manual.
3. Berjalan sepenuhnya offline — cocok untuk dokumen sensitif (KTP, laporan keuangan, dsb).

### 1.3 Non-tujuan (di luar cakupan v1)
- Tidak menyasar kolaborasi multi-user / cloud sync.
- Tidak menyasar e-signature, PDF compare, atau redaksi otomatis di rilis pertama (masuk daftar *future enhancement*).

---

## 2. Functional Requirements

| ID | Fitur | Engine di belakang | Prioritas |
|---|---|---|---|
| F1 | Compress PDF (3 level: screen/ebook/printer + custom DPI) | Ghostscript | Must-have (P0) |
| F2 | Merge banyak PDF jadi satu | QPDF | Must-have (P0) |
| F3 | Split PDF (per halaman / per range) | QPDF | Must-have (P0) |
| F4 | Convert Word/Excel/PPT → PDF | LibreOffice headless | Should-have (P1) |
| F5 | Protect PDF (tambah password) | QPDF `--encrypt` | Should-have (P1) |
| F6 | Unlock PDF (hapus password, kalau tahu passwordnya) | QPDF `--decrypt` | Should-have (P1) |
| F7 | Rotate halaman | QPDF | Nice-to-have (P2) |
| F8 | OCR (scan → PDF yang teksnya bisa di-select) | OCRmyPDF + Tesseract | Nice-to-have (P2), butuh riset ukuran bundle |

## 3. Non-Functional Requirements

| Aspek | Target |
|---|---|
| **Privasi** | Tidak ada file yang dikirim ke server manapun; semua proses di mesin lokal. |
| **Distribusi** | Satu file installer (`.exe`), tanpa prasyarat instalasi software lain oleh end-user. |
| **Ukuran instalasi** | Ditoleransi hingga ~700MB (didominasi LibreOffice portable), demi reliability. |
| **Performa** | File PDF <50MB diproses <5 detik untuk compress/merge/split; convert Office bisa beberapa detik lebih lama (batas wajar acuan: <15 detik untuk file <20 halaman). |
| **Kompatibilitas OS** | v1 fokus Windows 10/11 64-bit. macOS/Linux menyusul di v2 (arsitektur sudah dirancang mendukung, lihat §7). |
| **Ketahanan (resilience)** | Kalau satu engine crash/timeout, aplikasi tidak ikut crash — user dapat pesan error yang jelas. |

---

## 4. Keputusan Arsitektur & Alasannya

| Keputusan | Alternatif yang dipertimbangkan | Alasan dipilih |
|---|---|---|
| **Electron** (desktop app) | Web app + Docker backend | Distribusi ke teman dengan spek lebih rendah jauh lebih mudah: 1 installer vs install Docker Desktop + WSL2. |
| **Native binary ter-bundle** (qpdf/gs/soffice) | Docker container (Gotenberg) | Tidak butuh virtualization di BIOS, tidak ada overhead RAM idle 1-4GB, tidak butuh admin rights untuk Docker. |
| **React + TypeScript untuk UI** | Vanilla JS, Vue | Butuh state yang agak kompleks (progress per task, preview PDF, form password), TypeScript juga krusial untuk kontrak IPC yang type-safe lintas proses. |
| **IPC via `contextBridge`**, bukan `nodeIntegration: true` | Renderer akses Node langsung | Standar keamanan Electron; mencegah renderer mengeksekusi perintah sistem sembarangan kalau suatu saat ada konten eksternal termuat. |

### 4.1 Tech Stack Final

| Layer | Pilihan | Alasan |
|---|---|---|
| Desktop shell | **Electron** (v32+) | Bundling native binary + distribusi 1 installer |
| Build tool/scaffold | **electron-vite** | Memisahkan build config main/preload/renderer otomatis (masing-masing environment beda: Node vs browser), plus hot-reload renderer saat development |
| UI Framework | **React 18** | Dipilih untuk state management yang lebih terstruktur |
| Bahasa | **TypeScript 5.x** | Type-safety, terutama untuk kontrak IPC (§7) |
| Styling | **Tailwind CSS** | Cepat untuk dashboard & form, tanpa file CSS terpisah per komponen |
| Komponen UI | **shadcn/ui** | Komponen (button, card, dialog, progress bar) di-*copy* ke project — bukan dependency raksasa, tetap gampang di-custom |
| Icons | **lucide-react** | Ringan, konsisten dengan shadcn/ui |
| State management | **Zustand** | Lebih ringan dari Redux, cukup untuk state "task mana yang diproses, progress berapa persen" |
| Drag & drop file | **react-dropzone** | Menghindari nulis handler drag-drop manual |
| PDF preview | **pdfjs-dist** (PDF.js) | Preview thumbnail halaman sebelum split/compress |
| Eksekusi binary (qpdf/gs/soffice) | **execa** (bukan `child_process` mentah) | API promise-based, lebih rapi untuk urus error/timeout/output |
| Zip hasil split/batch | **archiver** | Bungkus banyak file hasil split jadi 1 `.zip` |
| ID unik per task | **nanoid** | `taskId` untuk progress tracking & temp folder per task |
| Logging | **electron-log** | Log tersimpan ke file — penting untuk debug laporan bug dari teman, bukan cuma `console.log` |
| Packaging/installer | **electron-builder** | Kompatibel dengan output electron-vite, target `nsis` untuk Windows |
| Testing | **Vitest** + React Testing Library | Satu ekosistem dengan Vite, lebih cepat dari Jest |
| Linting/format | **ESLint** (typescript-eslint) + **Prettier** | Konsistensi kode |

---

## 5. Arsitektur Sistem

```
┌───────────────────────────────────────────────────────────────────┐
│                          ELECTRON APP                              │
│                                                                     │
│  ┌────────────────────────┐  IPC   ┌───────────────────────────┐  │
│  │   RENDERER PROCESS      │<------>│    MAIN PROCESS            │  │
│  │   (UI - Chromium)       │  invoke │    (Node.js)                │  │
│  │                          │  send   │                             │  │
│  │  - Dashboard fitur       │        │  - Terima request dari UI  │  │
│  │  - Drag & drop file      │        │  - Validasi file/path       │  │
│  │  - Progress bar          │        │  - Panggil Engine Wrapper   │  │
│  │  - Tombol download hasil │        │  - Kirim progress balik     │  │
│  └────────────────────────┘        └──────────────┬──────────────┘  │
│                                                     │ spawn()         │
│                                     ┌───────────────▼───────────────┐│
│                                     │        ENGINE WRAPPER LAYER    ││
│                                     │  compress.js / merge.js /      ││
│                                     │  split.js / convert.js /       ││
│                                     │  protect.js                    ││
│                                     └───────────────┬───────────────┘│
│                                                     │ child_process   │
│                          ┌──────────────────────────┼────────────────┼───┐
│                          ▼                          ▼                ▼   │
│                   ┌─────────────┐          ┌─────────────┐   ┌────────────┐
│                   │ qpdf.exe    │          │ gswin64c.exe│   │ soffice.exe│
│                   │ (bundled)   │          │ (bundled)   │   │ (bundled)  │
│                   └─────────────┘          └─────────────┘   └────────────┘
└───────────────────────────────────────────────────────────────────┘
        Semua di atas berjalan 100% lokal di mesin user, tanpa network.
```

### 5.1 Prinsip desain kunci
- **Renderer tidak pernah memanggil `child_process`/`execa` langsung.** Semua permintaan lewat `ipcRenderer.invoke(...)` (dibungkus `window.api.*` yang type-safe), main process yang eksekusi.
- **Setiap engine dibungkus modul terpisah** (`src/main/engines/*.ts`) dengan interface seragam: terima `input path(s) + opsi`, kembalikan `output path` atau `error`, dan melaporkan progress lewat callback — menggunakan `execa` untuk eksekusi binary yang lebih rapi daripada `child_process` mentah.
- **File sementara (`uploads/`, `output/`) dibersihkan otomatis** setelah hasil diunduh atau setelah aplikasi ditutup, supaya tidak menumpuk sampah di disk user.

---

## 6. Struktur Folder Project

Scaffold awal dibuat lewat `electron-vite` (template `react-ts`), lalu disesuaikan strukturnya mengikuti kebiasaan tim React/Electron di industri — dengan prinsip **YAGNI (You Aren't Gonna Need It)**: pattern hanya ditambahkan kalau ada masalah nyata yang diselesaikan, bukan diantisipasi dari awal.

```
localpdf-electron/
├── resources/
│   └── icon.ico                     # icon aplikasi untuk electron-builder
├── scripts/
│   └── setup-binaries.ts            # download & extract qpdf/gs/libreoffice ke binaries/, sekali jalan
├── binaries/                         # HASIL scripts/setup-binaries.ts — masuk .gitignore, TIDAK di-commit
│   ├── win/
│   │   ├── qpdf.exe
│   │   ├── gswin64c.exe
│   │   └── libreoffice-portable/...
│   ├── mac/                          # disiapkan untuk v2
│   └── linux/                        # disiapkan untuk v2
│
├── src/
│   ├── main/                         # === MAIN PROCESS (Node.js, TypeScript) ===
│   │   ├── index.ts                  # entry tipis: app.whenReady() + createMainWindow()
│   │   ├── window.ts                 # createMainWindow(), dipisah agar index.ts tetap simple
│   │   ├── engines/
│   │   │   ├── compress.ts           # wrapper Ghostscript (pakai execa)
│   │   │   ├── compress.test.ts      # test co-located, bukan folder __tests__ terpisah
│   │   │   ├── merge.ts
│   │   │   ├── split.ts
│   │   │   ├── convert.ts
│   │   │   ├── protect.ts
│   │   │   └── engineRunner.ts       # helper generik: execa + timeout + progress parsing
│   │   ├── ipc/
│   │   │   └── handlers.ts           # SEMUA channel di 1 file — 6 fungsi kecil, gampang di-scan
│   │   └── utils/
│   │       ├── binaryPath.ts         # resolve path binary sesuai OS & dev/packaged mode
│   │       ├── tempFileManager.ts    # buat & bersihkan folder uploads/output (pakai nanoid utk taskId)
│   │       └── validators.ts         # cek ekstensi, magic bytes, ukuran file
│   │
│   ├── preload/                      # === PRELOAD (jembatan aman) ===
│   │   └── index.ts                  # contextBridge.exposeInMainWorld('api', {...})
│   │
│   ├── renderer/                     # === RENDERER (React + TSX) ===
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx              # entry React
│   │       ├── App.tsx               # switch antar 6 halaman via useState — TANPA router
│   │       │                         #   (single window, tidak ada deep-link/URL yang perlu di-share)
│   │       ├── components/
│   │       │   ├── ui/               # shadcn/ui — auto-generated, jangan diedit manual
│   │       │   └── shared/           # Dropzone, PdfPreview, ProgressBar — dipakai lintas fitur
│   │       ├── features/             # feature-based, bukan type-based
│   │       │   ├── compress/
│   │       │   │   ├── CompressPage.tsx
│   │       │   │   ├── useCompress.ts    # custom hook: bungkus window.api + loading/error state
│   │       │   │   └── CompressPage.test.tsx
│   │       │   ├── merge/
│   │       │   ├── split/
│   │       │   ├── convert/
│   │       │   └── protect/
│   │       ├── store/
│   │       │   └── taskStore.ts      # Zustand — state task & progress
│   │       ├── lib/
│   │       │   └── utils.ts          # cn() helper shadcn, formatBytes(), dll
│   │       └── styles/
│   │           └── globals.css       # Tailwind entry
│   │
│   └── shared/                       # === DI-IMPORT main DAN renderer ===
│       ├── ipc-types.ts              # payload & return type tiap channel IPC (§7)
│       └── ipc-channels.ts           # nama channel sebagai const, hindari typo string mentah
│
├── temp/                              # masuk .gitignore
│   ├── uploads/                       # file yang di-drop user (dihapus setelah proses)
│   └── output/                        # hasil proses (dihapus setelah didownload/ditutup app)
│
├── .env.development
├── .env.production
├── .gitignore
├── .eslintrc.cjs
├── .prettierrc
├── electron.vite.config.ts            # config build untuk 3 environment (main/preload/renderer)
├── electron-builder.yml                # konfigurasi packaging final (.exe)
├── tsconfig.json                       # base, di-extend oleh 2 di bawah
├── tsconfig.node.json                   # untuk main + preload (target: Node)
├── tsconfig.web.json                    # untuk renderer (target: DOM)
├── vitest.config.ts
├── tailwind.config.ts
├── components.json                      # config shadcn/ui
├── README.md                            # wajib: cara setup, npm run setup:binaries, cara build installer
├── out/                                  # hasil akhir electron-builder (LocalPDF-Setup-1.0.0.exe)
└── package.json
```

### 6.1 Keputusan yang sengaja *tidak* dimasukkan ke v1 (dan kenapa)

| Ditunda | Alasan |
|---|---|
| **Barrel export** (`engines/index.ts` re-export semua) | Berisiko circular dependency & mengganggu tree-shaking Vite; ditambahkan nanti kalau import path yang berulang beneran jadi masalah nyata. |
| **File handler IPC terpisah per channel** | 6 channel masih sangat terbaca dalam 1 `handlers.ts`. Dipecah nanti kalau logic tiap handler sudah tumbuh besar (>50 baris). |
| **React Router** | App ini single window tanpa kebutuhan URL/deep-link/browser history — `useState` di `App.tsx` sudah cukup. |
| **CI/CD (`.github/workflows`)** | Distribusi masih manual (dibagikan langsung ke teman); otomasi build baru bernilai kalau rilis sudah rutin. |

Prinsip di baliknya: pattern enterprise di atas **valid dan dipakai di industri**, tapi kebiasaan senior dev yang sesungguhnya adalah menambahkannya **saat ada bukti nyata dibutuhkan**, bukan dari hari pertama.

---

## 7. Kontrak IPC (API internal antara UI dan Main Process)

Ini bagian yang paling penting untuk "menjaga arah" pengembangan — setiap fitur punya kontrak jelas sebelum ditulis kodenya. Dengan TypeScript, kontrak ini **tidak cuma dokumentasi** — didefinisikan sungguhan di `src/shared/ipc-types.ts` + `ipc-channels.ts`, dan di-*import* oleh main process maupun renderer, supaya kalau ada field yang salah tipe/typo, compiler langsung teriak sebelum runtime.

```ts
// src/shared/ipc-channels.ts
export const IPC_CHANNELS = {
  COMPRESS_PDF: 'compress-pdf',
  MERGE_PDF: 'merge-pdf',
  SPLIT_PDF: 'split-pdf',
  CONVERT_TO_PDF: 'convert-to-pdf',
  PROTECT_PDF: 'protect-pdf',
  UNLOCK_PDF: 'unlock-pdf',
} as const;

// src/shared/ipc-types.ts
export interface CompressPayload {
  filePath: string;
  level: 'screen' | 'ebook' | 'printer' | 'custom';
  customDPI?: number;
}
export interface CompressResult {
  success: boolean;
  outputPath?: string;
  originalSize?: number;
  newSize?: number;
  error?: string;
}
```

| Channel | Arah | Payload (dari UI) | Return (ke UI) |
|---|---|---|---|
| `compress-pdf` | invoke | `{ filePath, level: 'screen'\|'ebook'\|'printer'\|'custom', customDPI? }` | `{ success, outputPath, originalSize, newSize }` atau `{ success:false, error }` |
| `merge-pdf` | invoke | `{ filePaths: string[] }` | `{ success, outputPath }` |
| `split-pdf` | invoke | `{ filePath, mode: 'all'\|'range', range?: '1-3,5' }` | `{ success, outputPaths: string[] }` (zip kalau >1 file) |
| `convert-to-pdf` | invoke | `{ filePath }` | `{ success, outputPath }` |
| `protect-pdf` | invoke | `{ filePath, password }` | `{ success, outputPath }` |
| `unlock-pdf` | invoke | `{ filePath, password }` | `{ success, outputPath }` atau error kalau password salah |
| `progress-update` | send (main→renderer, event) | — | `{ taskId, percent }` |
| `open-output-folder` | invoke | `{ outputPath }` | membuka file explorer ke lokasi file |

**Aturan validasi di setiap handler (di sisi main process, bukan renderer):**
1. Pastikan `filePath` benar-benar berada di folder `temp/uploads` milik app (cegah path traversal `../../`).
2. Cek ekstensi & *magic bytes* file (bukan cuma percaya nama file) sebelum diteruskan ke engine.
3. Bungkus setiap `spawn()` dengan timeout (misal 60 detik untuk convert, 30 detik untuk compress) — kalau lewat, kill process & kembalikan error yang jelas, bukan hang selamanya.

---

## 8. Alur Data per Fitur (Sequence)

### 8.1 Compress PDF
```
User drop file PDF ke UI
   → renderer baca file, kirim ke main lewat "save-temp-file"
   → main simpan ke temp/uploads/, kembalikan path
   → user pilih level kompresi, klik "Compress"
   → renderer invoke("compress-pdf", { filePath, level })
   → main: engines/compress.js jalankan:
        gswin64c -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook
                 -dNOPAUSE -dQUIET -dBATCH
                 -sOutputFile=temp/output/xxx.pdf  temp/uploads/xxx.pdf
   → progress di-estimasi dari waktu berjalan (Ghostscript tidak punya progress bar asli,
     jadi UI pakai indeterminate spinner + tampilkan ukuran file before/after di akhir)
   → main kirim { success, outputPath, originalSize, newSize }
   → renderer tampilkan tombol "Download hasil" + persentase pengurangan ukuran
```

### 8.2 Convert Office → PDF (paling rawan, butuh perhatian ekstra)
```
User drop file .docx
   → invoke("convert-to-pdf", { filePath })
   → main: engines/convert.js jalankan:
        soffice --headless --convert-to pdf --outdir temp/output  temp/uploads/xxx.docx
   → LibreOffice headless butuh "profile lock" — kalau ada instance soffice lain
     yang masih jalan/nge-hang, proses berikutnya bisa gagal.
     Mitigasi: gunakan --env:UserInstallation=file:///temp/lo-profile-<taskId>
     supaya tiap task pakai profile terpisah, hindari race condition.
   → timeout 30-60 detik tergantung ukuran file
   → main kirim path hasil, atau error spesifik ("konversi gagal / timeout")
```

---

## 9. Desain UI/UX (Wireframe Deskriptif)

**Halaman utama — Dashboard grid:**
```
┌─────────────────────────────────────────────────────────┐
│  LocalPDF                                     [ - □ x ]  │
├─────────────────────────────────────────────────────────┤
│                                                            │
│   [🗜 Compress]   [🔗 Merge]     [✂ Split]                │
│                                                            │
│   [📄 Convert]    [🔒 Protect]   [🔓 Unlock]               │
│                                                            │
└─────────────────────────────────────────────────────────┘
```

**Halaman fitur (misal Compress), 3 state:**
1. **Idle:** area drag-and-drop besar bertuliskan "Tarik file PDF ke sini atau klik untuk pilih".
2. **Processing:** nama file + progress bar/spinner + tombol "Batalkan".
3. **Selesai:** ringkasan hasil (mis. "12.4MB → 2.1MB, hemat 83%") + tombol "Download" + "Proses file lain".

Prinsip UX: setiap fitur **satu halaman fokus**, tidak digabung jadi satu form besar — mengurangi kebingungan dan mempermudah debugging per fitur saat development.

---

## 10. Keamanan & Penanganan Error

| Risiko | Mitigasi |
|---|---|
| Path traversal lewat nama file jahat | Validasi path selalu relatif ke `temp/uploads`, tolak `..` di path |
| Renderer bisa eksekusi kode Node sembarangan | `contextIsolation: true`, `nodeIntegration: false`, akses hanya lewat `contextBridge` |
| File PDF korup / bukan PDF asli (cuma ganti ekstensi) | Cek magic bytes `%PDF-` di awal file sebelum diproses |
| LibreOffice hang/profile lock bentrok | Profile terpisah per task (`UserInstallation` unik) + timeout + kill process |
| Password salah saat unlock | Tangkap exit code QPDF spesifik untuk "invalid password", tampilkan pesan jelas (bukan generic error) |
| Disk penuh karena file temp menumpuk | Auto-cleanup `temp/uploads` & `temp/output` saat app ditutup + tombol manual "Bersihkan file sementara" di Settings |

---

## 11. Strategi Testing

| Level | Yang diuji | Cara |
|---|---|---|
| Unit | Setiap `main/engines/*.ts` (pakai **Vitest**) | Jalankan dengan sample file PDF/docx kecil, assert output file valid & ukuran sesuai ekspektasi |
| Komponen UI | Halaman React (`CompressPage.tsx`, dsb) dengan **React Testing Library** | Simulasi drag-drop, klik tombol, assert state Zustand berubah sesuai |
| Integrasi | IPC handler end-to-end | Simulasi invoke dari renderer, cek response shape sesuai kontrak tipe di `ipc-types.ts` |
| Manual (wajib sebelum distribusi) | Install hasil `.exe` di **komputer lain** (bukan mesin development) | Supaya ketahuan kalau ada binary/dependency yang lupa ke-bundle |
| Edge case | File 0KB, file >500MB, file dengan nama karakter aneh (spasi, emoji, unicode) | Manual test checklist sebelum rilis ke teman |

---

## 12. Rencana Packaging & Distribusi

- Tool: **electron-builder**, target `nsis` untuk Windows.
- `extraResources` di config memastikan folder `binaries/` ikut ter-copy ke lokasi instalasi akhir (bukan di-bundle ke dalam `asar`, karena binary `.exe` butuh dieksekusi langsung dari disk).
- **Catatan realistis:** installer yang tidak di-*code-sign* akan memicu peringatan "Windows protected your PC" (SmartScreen) saat teman kamu install. Ini normal untuk aplikasi personal/non-komersial — cukup info ke teman untuk klik "More info → Run anyway". Code signing certificate berbayar (~$100-400/tahun) hanya perlu kalau distribusi jadi lebih luas dari lingkaran teman.

---

## 13. Lisensi Engine yang Dibundle (perlu diperhatikan, bukan sekadar teknis)

| Engine | Lisensi | Implikasi untuk dibundle & dibagikan |
|---|---|---|
| QPDF | Apache 2.0 | Bebas dibundle & didistribusikan ulang, tanpa syarat berat. |
| Ghostscript | AGPL v3 (untuk versi umum/gratisnya) | Bebas dipakai, tapi AGPL punya syarat *copyleft* — kalau dibagikan ke publik luas, sertakan source/lisensi Ghostscript. Untuk dibagikan ke lingkaran teman, ini bukan concern besar, tapi baik untuk diketahui. |
| LibreOffice | MPL 2.0 | Bebas dibundle & didistribusikan, termasuk untuk keperluan yang lebih komersial sekalipun. |

---

## 14. Roadmap Pengembangan (Fase)

| Fase | Cakupan | Estimasi effort* |
|---|---|---|
| **Fase 0 — Skeleton** | Scaffold via `electron-vite` (template react-ts), setup Tailwind+shadcn/ui, `contextBridge` jalan dengan tipe dari `ipc-types.ts`, binary path resolver teruji manual (`execa` panggil qpdf/gs/soffice dari dalam Electron) | 0.5–1 hari |
| **Fase 1 — P0 Features** | Compress + Merge + Split lengkap dengan UI & IPC sesuai §7 | 2–3 hari |
| **Fase 2 — P1 Features** | Convert (LibreOffice) + Protect/Unlock | 2–3 hari |
| **Fase 3 — Polish** | Error handling menyeluruh (§10), cleanup temp files, UI progress lebih baik | 1–2 hari |
| **Fase 4 — Packaging & Distribusi** | electron-builder config, test install di mesin lain, kirim ke teman | 0.5–1 hari |
| **Fase 5 (opsional) — v2** | OCR, dukungan macOS/Linux, rotate halaman | TBD sesuai kebutuhan |

*\*Estimasi asumsi dikerjakan sendiri paruh waktu; bisa lebih cepat kalau full-time.*

---

## 15. Referensi Command Engine (untuk implementasi nanti)

```bash
# Compress (Ghostscript)
gswin64c -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook \
         -dNOPAUSE -dQUIET -dBATCH -sOutputFile=output.pdf input.pdf

# Merge (QPDF)
qpdf --empty --pages file1.pdf file2.pdf -- output_merged.pdf

# Split per range halaman (QPDF)
qpdf input.pdf --pages input.pdf 1-3 -- output_pages_1-3.pdf

# Protect dengan password (QPDF)
qpdf --encrypt <user-password> <owner-password> 256 -- input.pdf output_protected.pdf

# Unlock / hapus password (QPDF)
qpdf --password=<password> --decrypt input.pdf output_unlocked.pdf

# Convert Office ke PDF (LibreOffice headless)
soffice --headless --convert-to pdf --outdir output_folder input.docx
```

---

## 16. Ringkasan Keputusan yang Sudah Difinalkan

- ✅ Bentuk aplikasi: **Electron desktop app** (bukan web+Docker)
- ✅ Engine: **QPDF + Ghostscript + LibreOffice**, semua di-bundle sebagai binary native, dieksekusi lewat **execa**
- ✅ Frontend: **React 18 + TypeScript**, di-scaffold pakai **electron-vite**
- ✅ Styling/komponen: **Tailwind CSS + shadcn/ui + lucide-react**
- ✅ State management: **Zustand**; drag-drop: **react-dropzone**; preview PDF: **pdfjs-dist**
- ✅ Distribusi: **satu file installer `.exe`** (electron-builder), tanpa prasyarat instalasi apa pun oleh end-user
- ✅ Prioritas fitur pertama: **Compress, Merge, Split** (P0), disusul Convert/Protect/Unlock (P1)
- ⏳ Belum diputuskan: apakah OCR (F8) masuk v1 atau ditunda ke v2 — tergantung seberapa sering kamu butuh fitur itu

---

*Dokumen ini adalah rancangan hidup — wajar kalau berubah begitu mulai implementasi dan ketemu kendala teknis nyata. Tujuannya supaya arah pengembangan jelas dari awal, bukan mengunci keputusan secara kaku.*
