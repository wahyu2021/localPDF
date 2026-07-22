# Track 005: Fitur Split PDF

## 1. Tujuan
Memungkinkan pengguna untuk memotong satu file PDF berdasarkan rentang halaman (Page Range) atau mengekstrak halaman tertentu menjadi file baru.

## 2. Kriteria Sukses
- [ ] Terdapat input untuk memasukkan pola pemisahan (misal: "1-5", "6,8,10", atau "Ekstrak semua halaman").
- [ ] UI menampilkan visualisasi jumlah halaman dari dokumen sumber.
- [ ] Terdapat handler IPC (`SPLIT_PDF`) yang mengeksekusi **QPDF** untuk memisahkan halaman (qpdf in.pdf --pages in.pdf 1-5 -- out.pdf).
- [ ] Menangani fungsi simpan jamak (*multiple output files*) jika opsi pisah per halaman dipilih, mungkin dengan menyimpannya ke dalam folder.

## 3. Komponen Utama yang Diperlukan
- `src/renderer/src/pages/SplitPage.tsx`
- `src/main/handlers/splitHandler.ts`
