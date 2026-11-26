# Katarsis — Perpustakaan Digital Sejarah

Katarsis adalah website perpustakaan digital dan arsip pustaka sejarah Nusantara serta historiografi dunia dengan dukungan ketersediaan **Buku Cetak**, **Naskah PDF**, dan **Audiobook**, dilengkapi gerbang akses kartu pembaca Surya dalam satu antarmuka statis yang siap diunggah ke GitHub dan diterbitkan melalui GitHub Pages.

## Fitur Utama

- **Katalog Pustaka Sejarah**: Pencarian cepat berdasarkan judul, penulis, nomor arsip (*accession number*), serta penyaringan menurut era sejarah dan format ketersediaan.
- **Ketersediaan Buku Cetak**: Informasi ketersediaan eksemplar fisik di ruang baca, kode rak, tahun edisi, serta formulir peminjaman buku cetak dengan tanda bukti reservasi.
- **Ruang Baca & Unduh PDF**: Pembaca naskah terintegrasi dengan daftar isi bab, pengatur ukuran huruf, penanda halaman, serta generator berkas `.pdf` asli yang dapat langsung diunduh.
- **Ruang Dengar Audiobook**: Pemutar audio narasi sejarah per bab dengan kontrol kecepatan putar (`0.85x` – `1.5x`), pelacakan progres mendengarkan, dan dukungan sintesis suara (*Web Speech API*).
- **Lini Masa Historiografi**: Navigasi kronologis naskah dari era Kerajaan Nusantara hingga periode Diplomasi & Kemerdekaan.
- **Siap GitHub & GitHub Pages**: Konfigurasi `base: './'` pada Vite dan alur kerja otomatis `.github/workflows/deploy.yml`.

## Cara Mengunggah ke GitHub & Mengaktifkan GitHub Pages

1. **Inisialisasi repositori Git lokal**:
   ```bash
   git init
   git add .
   git commit -m "Rilis awal Katarsis"
   ```

2. **Hubungkan ke repositori GitHub Anda**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/USERNAME/katarsis.git
   git push -u origin main
   ```

3. **Aktifkan GitHub Pages**:
   - Buka repositori Anda di GitHub.
   - Masuk ke **Settings** → **Pages**.
   - Pada bagian **Build and deployment**, ubah **Source** menjadi **GitHub Actions**.
   - Setiap kali Anda melakukan `git push` ke branch `main`, workflow `.github/workflows/deploy.yml` akan otomatis membangun dan menerbitkan situs ini.

## Pengembangan Lokal

```bash
npm install
npm run dev
```

Untuk membangun berkas produksi statis ke folder `dist/`:

```bash
npm run build
```
