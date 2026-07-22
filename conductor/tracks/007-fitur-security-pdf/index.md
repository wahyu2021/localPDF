# Track 007: Fitur Security PDF (Protect & Unlock)

## 1. Tujuan
Menyediakan antarmuka bagi pengguna untuk menambahkan kata sandi (Enkripsi/Protect) pada file PDF, atau menghapus kata sandi dari file PDF yang terkunci (Dekripsi/Unlock) jika mereka mengetahui sandinya.

## 2. Kriteria Sukses
- [ ] UI mode ganda (Tab: Enkripsi & Dekripsi).
- [ ] Mode Protect: Input kata sandi dan eksekusi **QPDF** dengan parameter enkripsi 256-bit AES (`qpdf --encrypt user-pw owner-pw 256 -- input.pdf output.pdf`).
- [ ] Mode Unlock: Menerima PDF terkunci, meminta kata sandi pada UI, lalu membuka kuncinya permanen (`qpdf --password=sandi --decrypt input.pdf output.pdf`).
- [ ] Manajemen error yang baik jika kata sandi salah.

## 3. Komponen Utama yang Diperlukan
- `src/renderer/src/pages/SecurityPage.tsx`
- `src/main/handlers/securityHandler.ts`
