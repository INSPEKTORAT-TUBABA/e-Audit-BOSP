# Panduan Pemasangan — E-Audit Dana BOS

Isi paket:
- `public/index.html` — aplikasi
- `firestore.rules`, `storage.rules` — aturan keamanan (wajib di-deploy)
- `firebase.json`, `.firebaserc`, `firestore.indexes.json` — konfigurasi deploy

## 1. Buat proyek Firebase
1. Buka https://console.firebase.google.com → **Add project** (mis. `eaudit-bos-tubaba`). Google Analytics boleh dimatikan.
2. **Upgrade ke paket Blaze (bayar sesuai pemakaian).** Cloud Storage for Firebase mewajibkan Blaze. Kuota gratis tetap berlaku, jadi untuk puluhan sekolah biayanya umumnya kecil. Setelah itu buka **Billing → Budgets & alerts** dan pasang batas anggaran (mis. Rp100.000/bulan) agar ada peringatan.
3. **Build → Authentication → Get started → Sign-in method → Google → Enable**, isi *support email*, simpan.
4. **Build → Firestore Database → Create database** (mode *production*). Pilih lokasi `asia-southeast2` (Jakarta).
5. **Build → Storage → Get started** (mode *production*), lokasi sama dengan Firestore.
6. **Project settings (ikon roda gigi) → Your apps → ikon Web `</>`** → daftarkan aplikasi → salin objek `firebaseConfig`.

## 2. Isi konfigurasi
1. Buka `public/index.html`, cari `firebaseConfig`, ganti semua nilai `ISI_...` dengan hasil salinan.
2. Buka `.firebaserc`, ganti `ISI_PROJECT_ID` dengan ID proyek.

## 3. Deploy (sekali pasang)
Butuh Node.js. Di terminal, dari folder paket ini:
```
npm install -g firebase-tools
firebase login
firebase deploy
```
Perintah ini memasang aplikasi (Hosting), aturan Firestore, dan aturan Storage sekaligus. Alamat aplikasi: `https://ID-PROYEK.web.app`.

Jika `firebase deploy` untuk Storage menolak karena izin lintas layanan, setujui permintaan izin yang muncul, lalu ulangi.

## 4. Daftarkan petugas Inspektorat
Di **Firestore Database → Start collection**:
- Collection ID: `auditors`
- Document ID: **email Google petugas, huruf kecil semua** (mis. `nama@gmail.com`)
- Field: `nama` (string) berisi nama petugas

Ulangi untuk setiap petugas. Menambah atau mencabut petugas cukup dengan menambah atau menghapus dokumennya, tanpa mengubah kode.

## 5. Domain sendiri (opsional)
Jika memakai domain/subdomain sendiri (mis. `eaudit.tubabakab.go.id`): **Hosting → Add custom domain**, lalu tambahkan domain itu di **Authentication → Settings → Authorized domains**. Domain `.web.app` dan `.firebaseapp.com` sudah otomatis terdaftar.

## 6. Uji sebelum dipakai
1. Masuk dengan akun Google biasa → isi profil sekolah → unggah satu dokumen.
2. Masuk dengan akun petugas → sekolah tadi muncul di dashboard → buka → klik **Review**.
3. Masuk lagi sebagai sekolah → status dan catatan terlihat.
4. Dengan akun sekolah kedua, pastikan dokumen sekolah pertama tidak terlihat.

## Catatan penting
- **Pendaftaran sekolah terbuka:** akun Google mana pun bisa mengisi profil sekolah. Petugas perlu mencocokkan NPSN dengan data resmi, dan sebaiknya sekolah diminta memakai email belajar.id atau email resmi sekolah.
- **Pencadangan:** ekspor Firestore berkala (Firebase Console → Firestore → Import/Export) atau aktifkan *scheduled backups*.
- **Pembaruan aplikasi:** ubah `public/index.html`, lalu jalankan `firebase deploy --only hosting`.
- **Perubahan aturan:** `firebase deploy --only firestore:rules,storage`.
