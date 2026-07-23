# Specification: Fitur Convert PDF (006)

## Overview
Fitur Konversi PDF memungkinkan pengguna mengubah berbagai jenis dokumen dari dan menjadi PDF sepenuhnya secara lokal. Fitur ini dirancang dengan antarmuka asimetris modern yang memungkinkan pengguna melihat pratinjau dokumen, menyesuaikan pengaturan halaman, dan melakukan konversi massal.

## Functional Requirements
- **Format yang Didukung:**
  - Office ke PDF (Word, Excel, PPT)
  - PDF ke Office (Word, Excel, PPT)
  - Gambar ke PDF (JPG, PNG)
  - PDF ke Gambar (JPG, PNG)
- **Operasi Lanjutan:**
  - **Batch Processing:** Mendukung konversi banyak file sekaligus dalam satu tindakan.
  - **Ekstraksi Khusus:** Opsi untuk mengonversi halaman tertentu saja dari PDF sumber.
  - **Pengaturan Output:** Pengaturan tambahan untuk output halaman (orientasi, batas tepi/margin).
- **Engine Pilihan Terbaik:** Menggunakan kombinasi LibreOffice Headless, Ghostscript, dan library NodeJS offline (misal poppler-utils/canvas/sharp) untuk memastikan kualitas dan akurasi tinggi tanpa merusak formatting.

## Non-Functional Requirements
- **Privasi:** Semua file diproses secara offline tanpa diunggah ke cloud.
- **UI/UX Standar:** Mematuhi panduan `conductor/code_styleguides/custom.md` (pratinjau PDF interaktif, layout asimetris, anti-collapse).

## Acceptance Criteria
- [ ] Mampu memproses konversi dua-arah (Office/Gambar ↔ PDF).
- [ ] Pengaturan halaman dan rentang ekstraksi dihormati oleh konverter.
- [ ] Proses batch berjalan dengan indikator pemuatan yang jelas (tanpa layout jump).
- [ ] Notifikasi sukses/error ditampilkan dengan benar sesuai panduan UX.
