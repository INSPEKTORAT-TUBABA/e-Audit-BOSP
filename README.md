# Monitoring Dana BOSP — GitHub Pages + Firebase + Google Drive

Isi paket: `index.html` (aplikasi), `firestore.rules`, `apps-script.gs`, `README.md`.
Alur: sekolah mengisi data dan mengunggah dokumen, berkas masuk ke **folder Google Drive Anda**, data muncul di tampilan auditor. Laptop tidak perlu menyala.

## 1. Proyek Firebase (login dan database)
1. https://console.firebase.google.com → **Add project**.
2. **Authentication → Get started → Email/Password → Enable.**
3. **Firestore Database → Create database** (mode produksi) → tab **Rules** → tempel `firestore.rules` → **Publish**.
4. **Project settings → Your apps → Web (`</>`)** → salin `firebaseConfig`.
5. **Authentication → Settings → Authorized domains → Add:** `NAMAANDA.github.io`.
(Firebase Storage tidak dipakai, jadi tidak perlu paket Blaze.)

## 2. Folder dan skrip Google Drive
1. Di Google Drive (akun yang akan menyimpan berkas), buat folder, misalnya `Berkas Monitoring BOSP`. Salin ID folder dari alamatnya (`drive.google.com/drive/folders/ID_FOLDER`).
2. Buka https://script.google.com → **New project** → hapus isi bawaan → tempel isi `apps-script.gs`.
3. Ganti `API_KEY` dengan `apiKey` dari firebaseConfig, dan `FOLDER_ID` dengan ID folder tadi → simpan.
4. **Deploy → New deployment → Select type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - **Deploy** → izinkan akses Drive dan permintaan eksternal saat diminta → salin **Web app URL**.
5. Keamanan: walau akses "Anyone", skrip menolak setiap permintaan tanpa token login Firebase yang sah.
6. Setelah mengubah skrip, buat deployment baru (Manage deployments → Edit → New version) agar perubahan berlaku.
7. Bila akun Google Anda dikelola organisasi, administratornya bisa melarang web app "Anyone"; gunakan akun lain atau minta izin.

### Struktur folder otomatis
Saat sekolah mengunggah, skrip membentuk folder sesuai isian Identitas sekolah itu:

```
Berkas Monitoring BOSP/
  SMP/
    Sukamaju/            (Kecamatan)
      Negeri/
        SMPN 1 Contoh [ab12cd34]/
          20261016-101500-rekening_koran.pdf
      Swasta/
```
- Jenjang dan Status dipilih dari daftar (Jenjang: PAUD, TK, SD, SMP, SMA, SMK, SLB, PKBM). Kecamatan diketik sekolah; skrip menyeragamkan huruf (mis. "sukamaju" menjadi "Sukamaju") agar tidak terbentuk folder ganda.
- Unggah ditolak bila Nama, Jenjang, Kecamatan, atau Status belum diisi.
- Bila sekolah mengubah Kecamatan, Jenjang, atau Status setelah mengunggah, berkas lama tetap di folder lama dan unggahan baru masuk ke folder baru. Pindahkan berkas lama secara manual bila perlu.
- Daftar jenjang dapat diubah di `apps-script.gs` (konstanta `JENJANG`) dan `index.html` (konstanta `SEL`); keduanya harus sama.

## 3. Hubungkan aplikasi
Buka `index.html`, lalu di dekat akhir file:
- ganti `const GAS="ISI"` dengan Web app URL dari langkah 2;
- ganti nilai `ISI` pada `const cfg={...}` dengan isi `firebaseConfig`.

## 4. Akun auditor (administrator)
1. **Authentication → Users → Add user** (e-mail dan kata sandi).
2. Salin **User UID**.
3. **Firestore → Start collection `users` → Document ID = UID**, field: `role` = `auditor`, `name` = nama auditor.
Sekolah mendaftar sendiri lewat tombol **Daftar (satuan pendidikan)**; aturan hanya mengizinkan peran `sekolah`.

## 5. Taruh di GitHub
1. Buat repositori, unggah `index.html` ke akar.
2. **Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.**
3. Alamat: `https://NAMAANDA.github.io/NAMAREPO/`.

## 6. Uji sebelum dibagikan
1. Daftar sebagai sekolah → isi identitas lengkap (termasuk Jenjang, Kecamatan, Status) → unggah satu PDF kecil → pastikan berkas muncul di folder Drive sesuai struktur Jenjang/Kecamatan/Status/Sekolah.
2. Masuk sebagai auditor → pastikan sekolah dan tautan berkasnya muncul.
3. Masuk sebagai sekolah kedua → pastikan tidak melihat data sekolah pertama atau tampilan auditor.
4. Coba berkas 8–10 MB untuk memastikan batas kiriman berfungsi.

## Hal yang perlu diketahui
- Berkas disimpan di Drive milik pemilik skrip. Auditor lain hanya bisa membukanya bila folder itu **dibagikan** ke akun Google mereka. Sekolah tidak bisa membuka berkasnya sendiri lewat tautan di halaman karena berkas bersifat privat.
- Batas ukuran per berkas di aplikasi: 10 MB. Apps Script juga punya kuota harian; periksa batas terbaru di dokumentasi Google bila banyak sekolah mengunggah bersamaan.
- Format: PDF, gambar, Word, Excel, CSV, teks.
- Repositori publik terlihat semua orang. `firebaseConfig` dan Web app URL bukan rahasia, tetapi **jangan** memasukkan data sekolah atau kata sandi ke repositori.
- Pasal dan definisi pengisian di aplikasi masih draf dan perlu diverifikasi serta disetujui reviewer.
- Belum diuji dengan proyek Firebase dan Apps Script sungguhan. Lakukan langkah 6 sebelum dipakai di banyak sekolah.
