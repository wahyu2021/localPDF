# Specification: Security PDF (007-fitur-security-pdf)

## Overview
Fitur ini memungkinkan pengguna untuk memanipulasi tingkat keamanan file PDF secara offline. Pengguna dapat mengunci PDF (memberikan password), membuka kunci PDF (menghapus password dari file), serta mengatur restriksi/batasan akses (seperti larangan cetak, salin, atau edit).

## Functional Requirements
1. **Mode Pemilihan (Mode-First UI)**
   - UI awal menampilkan pilihan mode: "Kunci PDF", "Buka Kunci PDF", dan "Atur Batasan Akses".
   - Area unggah file (menggunakan `<DragDropZone>`) baru muncul setelah mode dipilih.
2. **Kunci PDF (Encrypt)**
   - Input: File PDF dan User Password (untuk membuka).
   - Output: File PDF yang terenkripsi dan membutuhkan password saat dibuka.
3. **Buka Kunci PDF (Decrypt)**
   - Input: File PDF terkunci dan Password yang valid.
   - Output: File PDF murni yang tidak lagi membutuhkan password.
4. **Batasan Akses (Restrict)**
   - Terdapat opsi checkbox untuk menonaktifkan fitur pencetakan (printing), penyalinan (copying), dan modifikasi.
   - Membutuhkan Owner Password untuk mengunci konfigurasi batasan tersebut.
5. **Engine/Backend**
   - Menggunakan **QPDF** sebagai engine eksekusi di latar belakang karena efisiensinya dalam menangani manipulasi keamanan PDF.

## Non-Functional Requirements
- **Performa & Keamanan:** Password diproses langsung ke QPDF secara lokal dan tidak boleh dilog (dicatat) di console atau di file sistem.
- **UX:** Konsisten menggunakan komponen UI yang sudah seragam di halaman lain.

## Acceptance Criteria
- [ ] Pengguna harus memilih salah satu mode sebelum mengunggah file.
- [ ] Pengguna berhasil mengunci file PDF dan mengujinya.
- [ ] Pengguna berhasil menghapus sandi dari file PDF terkunci.
- [ ] Pengguna berhasil mengaplikasikan restriksi (copy/print) dengan Master/Owner password.
- [ ] Pesan error yang informatif jika password yang dimasukkan salah.
