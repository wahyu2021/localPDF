# Track 006: Fitur Convert PDF

## 1. Tujuan
Memungkinkan pengguna untuk mengonversi halaman-halaman PDF menjadi sekumpulan gambar (PNG / JPEG) berkualitas tinggi.

## 2. Kriteria Sukses
- [ ] Pengguna bisa mengatur resolusi gambar (*DPI*), dan memilih output PNG atau JPEG.
- [ ] UI untuk memilih spesifik halaman mana saja yang mau di-*render* ke gambar, atau semua halaman.
- [ ] Handler IPC (`CONVERT_TO_PDF`) akan memanggil **Ghostscript** dengan argumen `-sDEVICE=png16m` atau `-sDEVICE=jpeg` yang bisa menghasilkan multi-file (misal `output-%03d.png`).
- [ ] Backend menggabungkan hasilnya ke dalam file ZIP, atau langsung menyimpannya ke dalam direktori (*Folder Picker*).

## 3. Komponen Utama yang Diperlukan
- `src/renderer/src/pages/ConvertPage.tsx`
- `src/main/handlers/convertHandler.ts`
