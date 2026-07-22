# Product Guidelines — LocalPDF

## 1. Bahasa & Lokalisasi

### 1.1 Strategi Bahasa: Bilingual (ID + EN)
- **Teks UI utama** ditulis dalam **Bahasa Indonesia** — judul halaman, label tombol, pesan status, error message, tooltip.
- **Istilah teknis PDF** tetap dalam **Bahasa Inggris** yang sudah umum dipakai: *Compress*, *Merge*, *Split*, *Convert*, *Protect*, *Unlock*, *OCR*.
- **Alasan:** Target pengguna Indonesia sudah familiar dengan istilah-istilah ini dari pengalaman memakai iLovePDF dan tool serupa. Menerjemahkannya (mis. "Gabungkan" vs "Merge") justru menambah cognitive load.

### 1.2 Contoh Penerapan
| Konteks | Contoh |
|---|---|
| Judul halaman | "Compress PDF" |
| Deskripsi fitur | "Kecilkan ukuran file PDF tanpa mengorbankan kualitas secara signifikan." |
| Tombol aksi | "Mulai Compress" |
| Pesan sukses | "Selesai! Ukuran berkurang 83% (12.4MB → 2.1MB)" |
| Pesan error | "Gagal memproses file. Pastikan file adalah PDF yang valid." |
| Placeholder drag-drop | "Seret file PDF ke sini, atau klik untuk memilih" |

---

## 2. Tone of Voice

### 2.1 Karakter: Profesional & Terpercaya
- **Formal tapi tidak kaku** — Gunakan bahasa yang sopan dan jelas, tanpa jargon teknis yang tidak perlu.
- **Membangun kepercayaan** — Penting karena pengguna memproses dokumen sensitif. Setiap pesan harus meyakinkan bahwa data mereka aman.
- **Informatif, bukan bertele-tele** — Berikan informasi yang dibutuhkan, tanpa kalimat pengisi.

### 2.2 Panduan Penulisan
| Lakukan ✅ | Hindari ❌ |
|---|---|
| "File Anda diproses sepenuhnya di perangkat ini." | "Tenang aja, file kamu aman kok!" |
| "Terjadi kesalahan saat memproses file." | "Oops! Ada yang salah nih 😅" |
| "Proses selesai. Klik untuk menyimpan hasil." | "Yay! Udah jadi! Buruan download!" |
| "Pastikan file berformat PDF yang valid." | "Hmm, kayaknya file-nya bukan PDF deh..." |

### 2.3 Aturan Khusus
- **Tidak menggunakan emoji di pesan utama UI** (tombol, label, status). Emoji hanya boleh dipakai di halaman marketing/landing jika ada.
- **Konsisten:** Gunakan "Anda" (bukan "kamu") untuk sapaan pengguna.
- **Aktif, bukan pasif:** "Pilih level kompresi" (bukan "Level kompresi dapat dipilih").

---

## 3. Identitas Visual

### 3.1 Palet Warna: Hijau-Teal
Warna hijau-teal dipilih karena menyiratkan **keamanan, privasi, dan kesegaran** — selaras dengan core value LocalPDF.

| Token | Hex | Penggunaan |
|---|---|---|
| `--color-primary` | `#0D9488` | Tombol utama, link, elemen interaktif aktif |
| `--color-primary-hover` | `#0F766E` | Hover state tombol utama |
| `--color-primary-light` | `#14B8A6` | Aksen, highlight, badge |
| `--color-primary-subtle` | `#CCFBF1` | Background badge, selected state (light) |
| `--color-surface` | `#0F172A` | Background utama (dark mode) |
| `--color-surface-elevated` | `#1E293B` | Card, modal, sidebar |
| `--color-surface-hover` | `#334155` | Hover state pada surface |
| `--color-text-primary` | `#F1F5F9` | Teks utama (dark mode) |
| `--color-text-secondary` | `#94A3B8` | Teks sekunder, placeholder |
| `--color-border` | `#334155` | Border card, divider |
| `--color-success` | `#22C55E` | Status sukses |
| `--color-error` | `#EF4444` | Status error, validasi gagal |
| `--color-warning` | `#F59E0B` | Status peringatan |

### 3.2 Tipografi
- **Font utama:** `Inter` (Google Fonts) — clean, modern, sangat readable di UI.
- **Font monospace:** `JetBrains Mono` — untuk menampilkan path file, ukuran file, log.
- **Ukuran:** Gunakan skala `rem` berbasis 16px.
  - Heading halaman: `1.5rem` (24px)
  - Subheading: `1.125rem` (18px)
  - Body: `0.875rem` (14px)
  - Caption/small: `0.75rem` (12px)

### 3.3 Iconography
- Gunakan **Lucide React** sebagai icon set utama.
- Setiap fitur punya icon yang konsisten:
  - Compress: `FileDown`
  - Merge: `FilePlus2`
  - Split: `Scissors`
  - Convert: `FileOutput`
  - Protect: `Lock`
  - Unlock: `Unlock`

### 3.4 Spacing & Layout
- Gunakan **sistem kelipatan 4px** untuk spacing: `4, 8, 12, 16, 24, 32, 48, 64`.
- **Border radius:** `8px` (default), `12px` (card besar), `9999px` (pill/badge).
- **Shadow system:** 3 tingkat — `sm` (subtle), `md` (card), `lg` (modal/dropdown).

---

## 4. Prinsip UX

### 4.1 Drag-and-Drop Sebagai Interaksi Utama
- Area drop harus **besar dan jelas** — minimal 60% area viewport saat halaman fitur terbuka.
- Visual feedback saat file di-hover di atas area drop: border berubah warna + background highlight.
- Tetap sediakan tombol "Pilih File" sebagai alternatif bagi pengguna yang tidak familiar dengan drag-and-drop.
- Validasi tipe file **segera** setelah drop (sebelum proses dimulai). Tampilkan pesan jelas jika tipe file tidak didukung.

### 4.2 Feedback Instan
- **Setiap aksi pengguna harus mendapat respons visual dalam <100ms:**
  - Klik tombol → state berubah ke loading (spinner/disabled).
  - File di-drop → nama file muncul + preview thumbnail (jika PDF).
  - Proses selesai → toast notification + hasil ditampilkan.
  - Error terjadi → pesan error muncul dengan saran tindakan.
- **Progress bar** untuk operasi yang membutuhkan waktu (compress, convert). Gunakan indeterminate spinner jika progress exact tidak tersedia.
- **Toast notification** untuk konfirmasi aksi ringan (file tersimpan, clipboard copied).

### 4.3 Keyboard Shortcuts
- Navigasi antar fitur: `Ctrl+1` s/d `Ctrl+6` untuk 6 fitur utama.
- `Ctrl+O` — Buka file picker.
- `Enter` — Mulai proses (saat file sudah terpilih).
- `Escape` — Batalkan proses / kembali ke dashboard.
- Tampilkan hint keyboard shortcut di tooltip tombol.

### 4.4 Responsivitas Window
- Ukuran minimum window: `800 x 600`.
- Layout harus tetap fungsional saat window di-resize hingga ukuran minimum.
- Dashboard grid menyesuaikan: 3 kolom (>1024px), 2 kolom (800-1024px).

---

## 5. Aksesibilitas

- Kontras warna memenuhi **WCAG AA** (rasio minimum 4.5:1 untuk teks).
- Semua elemen interaktif bisa diakses via **keyboard** (tab navigation + focus ring visible).
- Gunakan **semantic HTML** (`<main>`, `<nav>`, `<section>`, `<button>`).
- Sertakan `aria-label` pada icon-only buttons.
- Drag-and-drop area harus punya alternatif keyboard-accessible (tombol "Pilih File").
