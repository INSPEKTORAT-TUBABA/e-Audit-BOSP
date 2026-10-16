/**
 * Penerima unggahan berkas -> Google Drive.
 * Tempel di Google Apps Script (script.google.com), isi dua konstanta, lalu Deploy > Web app.
 */
const API_KEY = 'ISI_API_KEY_FIREBASE';   // apiKey dari firebaseConfig
const FOLDER_ID = 'ISI_ID_FOLDER_DRIVE';  // ID folder tujuan di Google Drive Anda
const OK_EXT = /\.(pdf|png|jpe?g|gif|webp|csv|txt|docx?|xlsx?)$/i;

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
// Verifikasi token login Firebase; hanya pengguna yang sudah masuk boleh memakai skrip ini.
function uidFrom(token) {
  const r = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + API_KEY, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify({ idToken: token })
  });
  if (r.getResponseCode() !== 200) return null;
  const u = (JSON.parse(r.getContentText()).users || [])[0];
  return u ? u.localId : null;
}
const JENJANG = ['PAUD', 'TK', 'SD', 'SMP', 'SMA', 'SMK', 'SLB', 'PKBM'], STATUS = ['Negeri', 'Swasta'];
function clean(s) { return String(s || '').replace(/[^\w \-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 50); }
function title(s) { return clean(s).toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }
function sub(p, n) { const it = p.getFoldersByName(n); return it.hasNext() ? it.next() : p.createFolder(n); }
// Struktur: FOLDER_UTAMA / JENJANG / Kecamatan / Negeri|Swasta / Nama sekolah [id]
function dirFor(root, id, q) {
  if (JENJANG.indexOf(q.j) < 0 || STATUS.indexOf(q.st) < 0 || !title(q.k) || !clean(q.s)) return null;
  const base = sub(sub(sub(root, q.j), title(q.k)), q.st), k = ' [' + id.slice(0, 8) + ']', it = base.getFolders();
  while (it.hasNext()) { const d = it.next(); if (d.getName().endsWith(k)) return d; }
  return base.createFolder(clean(q.s) + k);
}
function doPost(e) {
  try {
    const q = JSON.parse(e.postData.contents), id = uidFrom(q.t);
    if (!id) return out({ ok: false, e: 'Belum masuk atau token tidak valid' });
    const root = DriveApp.getFolderById(FOLDER_ID);
    if (q.a === 'up') {
      if (!OK_EXT.test(q.n)) return out({ ok: false, e: 'Format berkas tidak diizinkan' });
      if (q.d.length > 14 * 1024 * 1024) return out({ ok: false, e: 'Berkas terlalu besar' });
      const nm = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyyMMdd-HHmmss') + '-' + q.n.replace(/[^\w.\-]/g, '_');
      const d = dirFor(root, id, q);
      if (!d) return out({ ok: false, e: 'Identitas sekolah (nama, jenjang, kecamatan, status) belum lengkap' });
      const f = d.createFile(Utilities.newBlob(Utilities.base64Decode(q.d), q.m, nm));
      f.setDescription(id);
      return out({ ok: true, id: f.getId(), url: f.getUrl() });
    }
    if (q.a === 'del') {
      const f = DriveApp.getFileById(q.id);
      if (f.getDescription() !== id) return out({ ok: false, e: 'Bukan berkas Anda' });
      f.setTrashed(true);
      return out({ ok: true });
    }
    return out({ ok: false, e: 'Aksi tidak dikenal' });
  } catch (x) { return out({ ok: false, e: String(x) }); }
}
