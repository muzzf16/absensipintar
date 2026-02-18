# Ringkasan Deployment Portal SDM di cPanel (Node.js + React + SQLite)

Dokumen ini merangkum kondisi saat ini, masalah yang ditemukan, tindakan yang sudah dilakukan, dan langkah final yang harus dilakukan agar aplikasi berjalan stabil di hosting cPanel.

---

## 1. Arsitektur Aplikasi

- Backend: Node.js + Express + TypeScript
- Frontend: React (Vite build → static files)
- Database: SQLite (database.sqlite)
- Hosting: cPanel CloudLinux NodeJS Selector

Struktur utama di server:

```
/home/u1478266/sdm/
  apps/
    backend/
      dist/
      src/
      public/   ← hasil build frontend
      database.sqlite
    frontend/
  stderr.log
```

---

## 2. Masalah Utama yang Terjadi

### ❌ Error 1 — JWT_SECRET tidak tersedia

Log:

```
Error: JWT_SECRET is not set in environment
```

Penyebab:
- File `src/middleware/authMiddleware.ts` melakukan throw jika env tidak ada
- cPanel tidak membaca `.env`
- Environment variable belum diset di UI

Dampak:
- Server crash saat start

---

### ❌ Error 2 — Scheduler gagal karena tabel belum ada

Log:

```
SQLITE_ERROR: no such table: permintaan_cuti
```

Penyebab:
- Database belum migrate / seed
- Scheduler berjalan saat DB kosong

Dampak:
- Error berulang di log

---

### ❌ Error 3 — node_modules di root (CloudLinux restriction)

Penyebab:
- node_modules tidak boleh berada di root aplikasi

Solusi:
- Hapus node_modules root
- Gunakan Run NPM Install di UI

---

## 3. Tindakan yang Sudah Dilakukan

✅ Frontend build berhasil diupload ke `backend/public`

✅ Backend berhasil dijalankan manual via terminal

✅ node_modules root sudah dihapus

✅ dist/authMiddleware sudah di-hotfix sementara

---

## 4. Langkah Final Agar Aplikasi Stabil

### STEP 1 — Set Environment Variable di cPanel

Setup Node.js App → Environment Variables:

```
JWT_SECRET = <secret panjang>
NODE_ENV = production
CORS_ORIGIN = https://bprbaperabatang.com
START_SCHEDULER = false
```

Restart App

---

### STEP 2 — Patch Source Middleware (permanen)

Ubah `src/middleware/authMiddleware.ts`:

```
const JWT_SECRET = process.env.JWT_SECRET || 'temporary-secret';
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET not set');
}
```

Build ulang:

```
npm run build
```

---

### STEP 3 — Migrasi Database

Rekomendasi: lakukan di lokal

```
npm run migrate
npm run seed
```

Upload `database.sqlite` ke server

Set permission:

```
chmod 664 database.sqlite
```

---

### STEP 4 — Aktifkan Scheduler

Set:

```
START_SCHEDULER = true
```

Restart App

---

## 5. Checklist Final

- [ ] JWT_SECRET terbaca
- [ ] Server tidak crash
- [ ] dist sudah terbaru
- [ ] database.sqlite berisi tabel
- [ ] scheduler berjalan tanpa error
- [ ] Frontend load di /sdm

---

## 6. Verifikasi

```
tail -n 100 stderr.log
```

Harus muncul:

```
API running on XXXX
All scheduled jobs started
```

---

## 7. Kesimpulan

Masalah utama berasal dari:
1. Environment variable tidak tersedia
2. Database belum dimigrate
3. CloudLinux environment berbeda dari lokal

Setelah env + DB + rebuild selesai, aplikasi akan berjalan normal.

---

Jika diperlukan, deployment berikutnya cukup:

1️⃣ Upload dist baru
2️⃣ Run NPM Install
3️⃣ Restart App

---

---

## 8. Diagram Alur Deployment

Berikut alur proses deployment dari lokal hingga aplikasi berjalan di server:

```
Developer (Local Machine)
        │
        │ 1. npm run build (frontend & backend)
        ▼
Build Artifacts
(dist frontend + dist backend + database.sqlite)
        │
        │ 2. Upload ke Server (cPanel File Manager / SCP)
        ▼
Server File System (/home/u1478266/sdm)
        │
        │ 3. Run NPM Install (via cPanel UI)
        ▼
CloudLinux NodeJS Virtual Environment
(nodevenv)
        │
        │ 4. Set Environment Variables
        ▼
Node.js App Runtime
        │
        │ 5. Restart App
        ▼
Express Server Running
        │
        │ 6. Serve Static React (public/)
        ▼
User Browser → https://domain/sdm
```

Alur Database:

```
Local Migration → database.sqlite
        │
        ▼
Upload ke Server
        │
        ▼
Backend membaca DB
        │
        ▼
Scheduler aktif
```

---

## 9. Runbook Troubleshooting

Panduan cepat jika terjadi error di production.

### 🔴 Server 503 / Tidak Bisa Diakses

Cek:
```
tail -n 80 stderr.log
```

Kemungkinan:
- JWT_SECRET belum diset
- Startup file salah
- node_modules error

Solusi:
- Set env di cPanel
- Restart App

---

### 🔴 Error JWT_SECRET is not set

Penyebab:
- Environment variable tidak ada

Solusi:
1. Tambahkan di cPanel Environment Variables
2. Restart App

---

### 🔴 SQLITE_ERROR no such table

Penyebab:
- Database belum migrate

Solusi:
```
npm run migrate
npm run seed
```
atau upload database.sqlite dari lokal

---

### 🔴 Frontend Blank / 404

Cek folder:
```
apps/backend/public
```

Solusi:
- Upload build frontend
- Restart App

---

### 🔴 Error CloudLinux node_modules

Penyebab:
- node_modules di root

Solusi:
```
rm -rf node_modules
```
Lalu Run NPM Install di UI

---

### 🔴 Scheduler Error Loop

Solusi sementara:
Set env:
```
START_SCHEDULER=false
```

---

## 10. Operational Tips

- Jangan build di server jika tidak perlu
- Simpan backup database sebelum update
- Gunakan secret yang kuat
- Gunakan logs untuk monitoring
- Deploy via dist only (build lokal)

---

## 11. Deployment Workflow Ideal

1. Pull code
2. Build lokal
3. Run migration lokal
4. Upload dist + database
5. Restart app
6. Verify logs

---

---

## 12. Diagram Arsitektur Sistem

Gambaran komponen utama dan aliran request:

```
[ User Browser ]
        │ HTTPS
        ▼
[ Web Server / cPanel Proxy ]
        │
        ▼
[ Node.js App (Express) ]
        │                ┌──────────────────────┐
        │                │  Scheduler (Jobs)    │
        │                └──────────┬───────────┘
        │                           │
        │                           ▼
        │                  [ SQLite Database ]
        │
        ├── Serve Static → /apps/backend/public (React build)
        │
        └── API Routes → /api/* (Auth, Pegawai, Cuti, dll)
```

Komponen penting:
- Reverse proxy cPanel mengarahkan request ke Node runtime
- Express melayani API dan file statis
- Scheduler menjalankan task terjadwal
- SQLite menyimpan data aplikasi

---

## 13. Prosedur Backup

### Backup Database

Disarankan backup sebelum deploy atau perubahan besar.

```
cd /home/u1478266/sdm/apps/backend
cp database.sqlite database.sqlite.bak.$(date +%F_%H-%M)
```

### Backup Aplikasi (dist)

```
cd /home/u1478266/sdm/apps/backend
zip -r backup-dist-$(date +%F).zip dist public package.json
```

Simpan backup di lokasi aman atau download ke lokal.

---

## 14. Prosedur Rollback

Jika deploy gagal atau aplikasi error:

### Rollback Database

```
cp database.sqlite.bak.<tanggal> database.sqlite
```

Restart App.

### Rollback Aplikasi

Extract backup dist sebelumnya:

```
unzip backup-dist-YYYY-MM-DD.zip -d /home/u1478266/sdm/apps/backend/
```

Restart App via cPanel.

---

## 15. Monitoring Checklist

Periksa secara berkala:

- Log error
```
tail -n 50 stderr.log
```

- Status process
```
ps aux | grep node
```

- Disk usage
```
df -h
```

- Database size
```
ls -lh database.sqlite
```

---

## 16. Security Checklist

- Gunakan JWT_SECRET kuat
- Jangan commit .env ke repo
- Batasi permission file database (664)
- Gunakan HTTPS
- Backup rutin
- Validasi input API

---

## 17. CI/CD Flow Sederhana (Manual)

```
Developer Push Code
        │
        ▼
Build Lokal
        │
        ▼
Run Migration
        │
        ▼
Upload dist + DB
        │
        ▼
Restart App
        │
        ▼
Verify Logs
```

---

## 18. Recovery Plan (Worst Case)

Jika server crash total:

1. Restore backup dist
2. Restore database backup
3. Set env variables
4. Restart Node app
5. Verify endpoint

---

Dokumen ini sekarang mencakup seluruh lifecycle deployment dan operasi aplikasi.

END

