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
