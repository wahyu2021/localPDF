# Specification: Fitur Merge PDF

## 1. Overview
Fitur "Gabungkan PDF" memungkinkan pengguna memilih dua atau lebih file PDF dan menggabungkannya menjadi satu dokumen tunggal secara luring (offline) menggunakan kekuatan *QPDF*.

## 2. Functional Requirements
- **Multi-File Selection:** Pengguna dapat menyeleksi atau *drag-and-drop* banyak file PDF sekaligus ke area kerja.
- **Reordering (Drag & Drop):** Terdapat antarmuka berbentuk daftar (*list*) tempat pengguna dapat menggeser item naik/turun (*drag and drop*) untuk menentukan urutan file saat digabung.
- **Merge Engine:** Proses penggabungan dijalankan secara lokal di *Main Process* menggunakan eksekusi argumen QPDF (`qpdf --empty --pages input1.pdf input2.pdf ... -- output.pdf`).
- **Save Flow:** Menampilkan indikator proses/loading. Hasil penggabungan disimpan di file *temporary*, kemudian memunculkan dialog **Save As** agar pengguna menentukan secara persis nama dan lokasi folder penyimpanan.
- **Result UI:** Setelah selesai, layar komparasi menampilkan informasi total ukuran file baru yang digabung, beserta tombol untuk "Simpan File Gabungan" dan "Batal/Ulangi".

## 3. Out of Scope
- Penghapusan atau pengeditan halaman satuan di dalam file PDF yang sama sebelum digabungkan (fokus murni pada penggabungan keseluruhan file tingkat dokumen).
