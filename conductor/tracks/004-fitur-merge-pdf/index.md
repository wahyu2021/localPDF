# Track 004: Fitur Merge PDF

## 1. Tujuan
Memungkinkan pengguna untuk memilih dua atau lebih file PDF dan menggabungkannya menjadi satu file utuh dengan urutan yang bisa diatur.

## 2. Kriteria Sukses
- [ ] Pengguna bisa memilih / men-drag banyak file PDF sekaligus (multi-selection).
- [ ] Tersedia UI untuk mengubah urutan PDF (Drag & Drop list/urutan).
- [ ] Terdapat handler IPC di backend (`MERGE_PDF`) yang menggunakan **QPDF** (qpdf --empty --pages input1.pdf input2.pdf -- output.pdf).
- [ ] Menggunakan QPDF karena penggabungan lebih cepat dan 100% tanpa kehilangan kualitas (*lossless*) dibanding Ghostscript.
- [ ] Setelah proses selesai, muncul layar hasil komparasi (jumlah halaman total) dan tombol *Save As*.

## 3. Komponen Utama yang Diperlukan
- `src/renderer/src/pages/MergePage.tsx`
- `src/renderer/src/store/mergeStore.ts` (List of Files, reorder logic)
- `src/main/handlers/mergeHandler.ts` (Eksekusi binary QPDF)
