# Alur Kerja (Workflow) — LocalPDF

## 1. Strategi Branching: Git-Flow

Proyek ini menggunakan strategi Git-Flow untuk mengelola rilis versi desktop yang terencana secara rapi.

- `main` — Branch utama yang mencerminkan kode di lingkungan produksi (versi rilis stabil). Kode di sini harus selalu siap pakai.
- `develop` — Branch integrasi utama. Fitur baru dan perbaikan *bug* yang sedang berjalan digabungkan ke sini sebelum rilis.
- `feature/*` — Branch sementara untuk pengembangan fitur spesifik. Dibuat dari `develop` dan di-merge kembali ke `develop`. (Contoh: `feature/compress-pdf`).
- `hotfix/*` — Branch untuk perbaikan *bug* kritis di produksi. Dibuat dari `main`, dan di-merge kembali ke `main` serta `develop`.
- `release/*` — Branch untuk persiapan rilis versi baru. Dibuat dari `develop` dan di-merge ke `main` dan `develop` setelah siap rilis.

## 2. Aturan Pesan Commit (Conventional Commits)

Proyek ini mewajibkan **Conventional Commits dalam Bahasa Indonesia** untuk memudahkan penulisan *changelog* secara otomatis.
Gunakan format: `<tipe>: <deskripsi singkat dalam huruf kecil>`

**Tipe yang diizinkan:**
- `feat:` — Menambahkan fitur baru (mis. `feat: tambah fitur perlindungan password PDF`).
- `fix:` — Memperbaiki *bug* (mis. `fix: perbaiki path binary eksekusi di Windows`).
- `refactor:` — Menulis ulang kode tanpa mengubah fitur eksternal (mis. `refactor: pisahkan IPC handlers menjadi beberapa file`).
- `style:` — Perubahan formatting, spasi, semi-colon (mis. `style: rapikan indentasi pada App.tsx`).
- `chore:` — Tugas maintenance, update *dependency*, atau konfigurasi (mis. `chore: update versi electron-builder`).
- `docs:` — Perubahan pada dokumentasi proyek (mis. `docs: perbarui panduan instalasi di README`).
- `test:` — Menambah atau mengubah *unit test* (mis. `test: tambah test case untuk engine kompresi`).

## 3. Proses Pengembangan (Lifecycle)
1. Pindah ke branch `develop`: `git checkout develop`
2. Tarik kode terbaru: `git pull origin develop`
3. Buat branch fitur baru: `git checkout -b feature/nama-fitur-baru`
4. Lakukan penulisan kode dan selesaikan fitur.
5. Lakukan *commit* atomik (satu *commit* = satu perubahan logis) dengan format Conventional Commits Bahasa Indonesia.
6. Buat *Pull Request* (PR) ke branch `develop`.

## 4. CI/CD (Continuous Integration & Deployment)

**Strategi:** GitHub Actions.

- **Continuous Integration (CI):** 
  Setiap *Push* atau *Pull Request* ke branch `develop` dan `main` akan memicu *workflow* GitHub Actions untuk:
  - Menjalankan `npm install`.
  - Melakukan *Linting* (`eslint`).
  - Mengeksekusi *Unit Tests* (`vitest`).
  - Memastikan *build* TypeScript tidak gagal.
- **Continuous Deployment (CD):** 
  Setiap kali tag versi rilis baru dibuat (misal `v1.0.0`), *workflow* rilis akan aktif:
  - Membangun *installer* `LocalPDF-Setup.exe` menggunakan `electron-builder` khusus untuk Windows.
  - Mempublikasikannya secara otomatis sebagai aset *release* di GitHub Releases.
