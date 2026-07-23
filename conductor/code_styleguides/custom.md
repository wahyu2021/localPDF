# Custom Code Guidelines — LocalPDF

## 1. Prinsip DRY (Don't Repeat Yourself)
- Hindari duplikasi logika, struktur UI, atau styling.
- Ekstrak pola yang berulang menjadi *reusable function* (untuk logika/proses) atau *reusable component* (untuk UI).
- Gunakan custom hooks di React untuk mengabstraksi *stateful logic* yang dipakai di beberapa halaman/komponen.

## 2. Component-Based Architecture
- **Satu Komponen Per File:** Setiap file UI idealnya hanya mengekspor satu komponen utama.
- **Pemisahan Tanggung Jawab:** 
  - *Dumb Components (Presentational)*: Komponen UI murni (shadcn/ui, tombol, card) yang hanya menerima props dan tidak mengurus logika *state* global.
  - *Smart Components (Containers)*: Komponen tingkat fitur yang menghubungkan UI dengan *store* (Zustand) dan fungsi backend (IPC).
- Jaga komponen tetap kecil dan spesifik pada satu tugas (Single Responsibility Principle).

## 3. Clean Code & Best Practices
- **Penamaan yang Jelas:** Gunakan nama variabel dan fungsi yang deskriptif. Hindari singkatan yang membingungkan.
- **Komentar:** Tulis kode yang *self-explanatory*. Gunakan komentar hanya untuk menjelaskan *mengapa* (why) sebuah keputusan kompleks diambil, bukan *apa* (what) yang dilakukan oleh kode.
- **Error Handling:** Selalu tangkap potensi *error* (mis. saat IPC invoke gagal, eksekusi binari gagal) dan berikan *feedback* UI yang jelas kepada pengguna (jangan biarkan aplikasi *hang* atau diam).
- ikuti *best practices* React dan Electron secara ketat, termasuk menghindari `any` di TypeScript dan menggunakan `contextBridge` untuk IPC.

## 4. Dokumentasi Kode (JSDoc / TSDoc)
- **Wajib Didokumentasikan:** Setiap fungsi utama, utilitas (helper), komponen UI yang dipakai ulang, dan interface/tipe (`type`/`interface`) wajib menyertakan blok komentar JSDoc/TSDoc standar.
- **Format Standar:**
  - Deskripsikan kegunaan dari fungsi atau komponen dengan satu-dua kalimat ringkas.
  - Dokumentasikan argumen menggunakan tag `@param` dan kembalian menggunakan tag `@returns`.
  - Contoh:
    ```ts
    /**
     * Memproses file PDF untuk dikompresi sesuai level yang diminta.
     * 
     * @param filePath - Path absolut ke file PDF target.
     * @param level - Kualitas kompresi ('screen', 'ebook', 'printer').
     * @returns Promise yang mengembalikan ukuran baru jika sukses.
     */
    export async function compressPdf(filePath: string, level: string): Promise<number> { ... }
    ```
- **Dokumentasi Hidup:** Selalu perbarui blok dokumentasi (JSDoc) bersamaan dengan perubahan logika fungsi agar dokumentasi tidak menjadi usang dan menyesatkan.

## 5. Standar Interaksi UI/UX
- **Layout Asimetris Modern:** Gunakan grid `lg:grid-cols-12` dengan pembagian `lg:col-span-7` (Preview/Visual di kiri) dan `lg:col-span-5` (Pengaturan/Aksi di kanan). Hindari membungkus semua elemen ke dalam satu Card global.
- **Preview Interaktif:** Jangan suruh user membuka PDF eksternal. Gunakan komponen `PDFCanvasPreview` yang mendukung paginasi (Prev/Next buttons) untuk memudahkan pembacaan konten PDF langsung dari dalam aplikasi.
- **Validasi Real-time:** Terapkan pengecekan batas (out-of-bounds) dan validasi input secara instan. Sinkronkan total halaman dokumen (`onLoadSuccess` pada PDF) dengan input rentang, lalu cegah proses (blokir tombol/tampilkan error) jika melebih batas.
- **Radio & Struktur Flexbox:** Selalu kelompokkan opsi sejenis di dalam satu induk `RadioGroup` untuk sinkronisasi state. Gunakan class utilitas seperti `shrink-0` pada elemen grafis terkecil agar tidak terdistorsi (squished) oleh panjang teks di sebelahnya.
- **Anti-Layout Collapse:** Saat merender file berat (seperti halaman PDF tunggal), kunci ukuran wadah terluarnya (`wrapper`) dengan `min-h-[xxxpx]` (misal: `min-h-[550px]`) agar ketika transisi pergantian halaman berlangsung (loading state sementara), layar tidak mengalami lonjakan scroll (scroll-jump) yang merusak UX.
