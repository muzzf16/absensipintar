<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# buatkan markdown file dari semua yang sudah didikusikan diatas

Berikut satu file Markdown yang sudah merangkum semua pembahasan fitur marketing \& prospek untuk aplikasi **Absensi Pintar \& Kunjungan Nasabah**.[^1]

***

```markdown
# 📕 PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Aplikasi Absensi & Kunjungan Nasabah Berbasis Mobile

> Catatan: Dokumen ini menambahkan **Modul Marketing & Prospek** di atas PRD existing aplikasi Absensi & Kunjungan Nasabah berbasis GPS.[file:1]

---

## 1. Ringkasan Produk

### 1.1 Nama Produk
**Absensi Pintar & Kunjungan Nasabah**[file:1]

### 1.2 Deskripsi Singkat
Aplikasi mobile untuk mencatat **absensi karyawan**, **kunjungan nasabah berbasis GPS**, dan **aktivitas marketing produk BPR** (penawaran, prospek, dan realisasi) dengan sistem **approval berjenjang**, **anti fake GPS**, dan **laporan resmi (CSV)**.[file:1][web:4]

### 1.3 Tujuan Produk
- Meningkatkan akurasi absensi lapangan dan validasi kunjungan nasabah.[file:1]  
- Mengubah kunjungan lapangan menjadi aktivitas marketing terukur (cross‑selling dan upselling produk tabungan, deposito, dan kredit BPR).[web:3][web:4][web:21]  
- Menyediakan laporan yang valid, audit‑ready, dan bisa dianalisis sebagai mini‑CRM marketing BPR.[file:1][web:8][web:11]

---

## 2. Latar Belakang & Masalah

### Masalah Saat Ini
- Absensi manual mudah dimanipulasi dan kunjungan sulit diverifikasi.[file:1]  
- Tidak ada validasi lokasi kunjungan dan data marketing produk tidak tercatat secara terstruktur.[file:1][web:4]  
- Laporan kunjungan dan aktivitas marketing tidak standarisasi dan sulit dipakai sebagai bahan keputusan.[file:1][web:59]

### Solusi Produk
- GPS wajib & radius lokasi (100m) dengan penolakan otomatis jika di luar radius.[file:1]  
- Bukti kunjungan (opsional foto) dan approval supervisor/admin untuk setiap kunjungan.[file:1]  
- Layer tambahan **Modul Marketing & Prospek** di atas kunjungan: penawaran produk, status prospek, dan nilai potensial guna mendukung strategi cross selling BPR.[web:3][web:6][web:47]

---

## 3. Target Pengguna

| Persona           | Kebutuhan                                                                      |
|------------------|----------------------------------------------------------------------------------|
| Karyawan Lapangan| Absensi cepat, kunjungan mudah, dan input penawaran produk yang simpel          |
| Supervisor        | Monitoring kunjungan, approval, dan funnel prospek tim                         |
| Admin / Manajemen | Laporan valid untuk audit serta analisis efektivitas marketing & produk BPR    |[file:1][web:59]

---

## 4. Tujuan Bisnis (Business Goals)

- Mengurangi kecurangan absensi dan memastikan kunjungan lapangan benar‑benar terjadi.[file:1]  
- Meningkatkan produktivitas lapangan dengan mengubah kunjungan menjadi aktivitas penawaran produk yang terukur.[web:4][web:21]  
- Menyediakan data funnel marketing (penawaran → prospek → realisasi) untuk pengambilan keputusan produk dan kampanye BPR.[web:8][web:47]

---

## 5. Scope Produk

### 5.1 In‑Scope (Termasuk)
- Absensi masuk & pulang (wajib sebelum kunjungan).[file:1]  
- Kunjungan nasabah berbasis GPS (lokasi wajib, radius 100m).[file:1]  
- Penambahan **Modul Marketing & Prospek** di form kunjungan dan laporan.[file:1][web:47]  
- Google Maps integration (link ke peta di dashboard).[file:1]  
- Role Admin, Supervisor, Karyawan dan export laporan CSV (kunjungan & marketing).[file:1]

### 5.2 Out‑of‑Scope (Tahap Ini)
- Mode offline penuh dan face recognition untuk absensi.[file:1]  
- Payroll & gaji, integrasi ERP eksternal, dan integrasi otomatis ke core banking untuk status realisasi (bisa jadi fase berikutnya).[file:1][web:20]  
- Export PDF (planned) dan Approval UI yang masih next phase untuk penyempurnaan.[file:1]

---

## 6. Fitur Utama

### 6.1 Autentikasi & Role
- Login email & password.[file:1]  
- Role‑based access control (Admin, Supervisor, Karyawan) dan session security.[file:1]

### 6.2 Absensi
- Absen masuk (1x/hari) dan absen pulang dengan timestamp otomatis.[file:1]  
- Syarat wajib: clock in sebelum input kunjungan.[file:1]

### 6.3 Kunjungan Nasabah
- Input data nasabah dan tampilkan alamat nasabah di form.[file:1]  
- GPS lokasi **wajib**, foto kunjungan **opsional**, tanggal & waktu otomatis, dan terhubung dengan absensi hari itu.[file:1]

### 6.4 Validasi Lokasi
- Google Maps marker di dashboard admin dengan radius lokasi 100 meter.[file:1]  
- Penolakan otomatis jika di luar radius dan mekanisme pencegahan fake GPS.[file:1]

### 6.5 Approval Kunjungan
- Status: Pending, Approved, Rejected dengan catatan wajib saat reject.[file:1]  
- Backend logic approval sudah ada; UI approval disempurnakan pada fase berikutnya.[file:1]

### 6.6 Dashboard & Monitoring
- Dashboard Karyawan: riwayat kunjungan grouped by date.[file:1]  
- Dashboard Supervisor: monitoring tim (kunjungan, status, dan prospek).[file:1]  
- Dashboard Admin: global view, filter, dan export.[file:1]

### 6.7 Laporan
- Export CSV (implemented) dan export PDF (planned).[file:1]  
- Filter: periode, user, status, nasabah, produk, dan status prospek.[file:1][web:50]  
- Laporan resmi & audit‑ready.[file:1]

---

## 6.x Modul Marketing & Prospek

### 6.x.1 Tujuan Fitur
- Mencatat aktivitas penawaran produk BPR (tabungan, deposito, kredit, dll.) pada setiap kunjungan nasabah secara terstruktur dan terverifikasi GPS.[file:1][web:4]  
- Menyediakan data funnel marketing (penawaran → prospek → realisasi) per produk, per karyawan, dan per wilayah sebagai dasar evaluasi dan pengambilan keputusan manajemen.[web:8][web:11][web:47]

### 6.x.2 Definisi & Istilah
- **Penawaran Produk**: Aktivitas marketing yang menjelaskan produk BPR kepada nasabah/prospek dalam satu kunjungan.[web:3][web:4]  
- **Prospek**: Nasabah atau calon nasabah yang menunjukkan ketertarikan dan layak untuk di‑follow‑up.[web:17][web:20]  
- **Realisasi**: Penawaran yang berujung pada pembukaan rekening/tabungan/deposito atau pencairan kredit (awal manual, integrasi ke core bisa di fase berikutnya).[web:8][web:14][web:20]

### 6.x.3 Perubahan di Form Kunjungan Nasabah

Form kunjungan ditambah field berikut:

- **Tujuan Kunjungan** (wajib)  
  - Tipe: Dropdown  
  - Opsi:  
    - SERVICE_ONLY  
    - SERVICE_AND_OFFERING  
    - OFFERING_ONLY  

- **Produk yang Ditawarkan** (opsional, wajib jika tujuan mengandung penawaran)  
  - Tipe: Multi‑select / chip.  
  - Contoh opsi:  
    - TAB_UMUM – Tabungan Umum  
    - TAB_BERJANGKA – Tabungan Berjangka  
    - DEP_OS – Deposito  
    - KREDIT_MIKRO – Kredit Mikro  
    - KREDIT_KONSUMTIF – Kredit Konsumtif  
    - OTHER – (free text untuk nama produk).[web:4][web:21]

- **Status Prospek (Overall)** (opsional, wajib jika ada produk)  
  - Tipe: Dropdown  
  - Opsi:  
    - NOT_INTERESTED  
    - INTERESTED  
    - IN_PROGRESS  
    - REALIZED  

- **Nilai Potensial (Overall)**  
  - Tipe: Number (decimal), masking Rupiah.  
  - Deskripsi: estimasi nominal saldo/plafon total prospek.

- **Catatan Marketing**  
  - Tipe: Textarea.  
  - Deskripsi: keberatan nasabah, kebutuhan khusus, rencana produk, dsb.

- **Jadwal Follow‑up**  
  - Tipe: DateTime.  
  - Deskripsi: rencana kunjungan ulang atau kontak lanjutan.

Semua field ini terikat pada:
- Absensi hari itu (wajib clock in).[file:1]  
- Lokasi GPS + radius valid (≤100m dari titik nasabah).[file:1]

### 6.x.4 Struktur Data & Tabel

#### Penambahan kolom di tabel `visits`

| Nama field        | Tipe data      | Wajib | Deskripsi                                               |
|-------------------|----------------|-------|---------------------------------------------------------|
| tujuan_kunjungan  | varchar(50)    | Ya    | SERVICE_ONLY / SERVICE_AND_OFFERING / OFFERING_ONLY     |
| status_prospek    | varchar(30)    | Tidak | NOT_INTERESTED / INTERESTED / IN_PROGRESS / REALIZED    |
| nilai_potensial   | decimal(18,2)  | Tidak | Estimasi nominal total prospek                          |
| catatan_marketing | text           | Tidak | Catatan aktivitas marketing                             |
| jadwal_follow_up  | datetime       | Tidak | Rencana follow‑up                                       |[file:1]

#### Tabel baru `visit_products` (opsional tapi direkomendasikan)

| Field           | Tipe data     | Keterangan                                             |
|-----------------|---------------|--------------------------------------------------------|
| id              | bigint (PK)   | Auto increment                                         |
| visit_id        | bigint (FK)   | Relasi ke `visits`                                    |
| product_code    | varchar(50)   | Kode produk                                           |
| product_name    | varchar(100)  | Nama produk (denormalisasi)                           |
| status_prospek  | varchar(30)   | Status prospek per produk (opsional)                  |
| nilai_potensial | decimal(18,2) | Potensi nominal per produk                            |[web:47]

Struktur ini memungkinkan laporan per kunjungan dan per produk secara fleksibel.[web:47][web:50]

### 6.x.5 Flow & Approval

User flow high level yang diperbarui:

1. User login (Admin/Karyawan).[file:1]  
2. Absen masuk (mandatory).[file:1]  
3. Kunjungan nasabah.  
   - 3.a Input data nasabah.  
   - 3.b Pilih tujuan kunjungan.  
   - 3.c Jika ada penawaran produk → pilih produk, status prospek, nilai potensial, dan jadwal follow‑up.  
4. Validasi GPS & radius (max 100m).[file:1]  
5. Status Pending.[file:1]  
6. Supervisor/Admin approval (cek lokasi & data marketing).[file:1]  
7. Laporan dihasilkan (CSV Export).[file:1]  
8. Absen pulang.[file:1]

Saat approval:
- Supervisor/Admin melihat detail marketing (produk, status prospek, nilai potensial).[file:1]  
- Bisa reject jika data tidak wajar (misalnya lokasi tidak valid atau nilai sangat tidak realistis), untuk menjaga integritas data dan kepatuhan.[file:1][web:10]

### 6.x.6 Laporan & CSV

#### Laporan utama: per kunjungan

Satu baris = satu kunjungan.

Header CSV (contoh):

- `visit_id`  
- `visit_date`  
- `employee_id`  
- `employee_name`  
- `customer_id`  
- `customer_name`  
- `customer_address`  
- `purpose`  
- `gps_latitude`  
- `gps_longitude`  
- `gps_valid`  
- `approval_status`  
- `approval_note`  
- `approval_at`  
- `products_offered` (concat kode: TAB_UMUM;KREDIT_MIKRO)  
- `products_offered_names` (concat nama: Tabungan Umum;Kredit Mikro)  
- `overall_prospect_status`  
- `overall_potential_value`  
- `follow_up_at`  
- `marketing_notes`[file:1][web:46][web:51]

#### Laporan kedua: per produk yang ditawarkan

Satu baris = satu produk per kunjungan (dari `visit_products`).

Header CSV (contoh):

- `visit_id`  
- `visit_date`  
- `employee_id`  
- `customer_id`  
- `product_code`  
- `product_name`  
- `product_prospect_status`  
- `product_potential_value`[web:47][web:54]

Kedua laporan ini mendukung analisis aktivitas lapangan dan performa cross‑selling/upselling produk BPR.[web:47][web:53][web:59]

---

## 7. User Flow (High Level)

User flow global mengikuti PRD utama dengan tambahan logika marketing di langkah kunjungan seperti dijelaskan di 6.x.5.[file:1]

---

## 8. Non‑Functional Requirements

| Aspek       | Requirement                     |
|------------|----------------------------------|
| Performance| Response < 3 detik               |
| Availability| ≥ 99%                           |
| Security   | RBAC, audit trail, data immutable|
| Compliance | ISO 9001, ISO 27001              |
| Scalability| Multi‑user & multi‑tim           |[file:1]

Data marketing ikut dicakup dalam audit trail dan tidak dapat diedit setelah approval untuk mendukung audit dan kepatuhan.[file:1][web:56]

---

## 9. Success Metrics (KPI)

KPI existing + KPI marketing baru:

- ≥ 95% kunjungan tervalidasi GPS.[file:1]  
- 0 manipulasi lokasi terdeteksi.[file:1]  
- Waktu approval < 24 jam.[file:1]  
- 100% laporan dapat diaudit.[file:1]  
- Persentase kunjungan dengan penawaran produk (target contoh: ≥ 60% kunjungan marketing).[web:4][web:21]  
- Konversi kunjungan → prospek (target contoh: ≥ 20%).[web:6][web:10]  
- Konversi prospek → realisasi (target contoh: ≥ 30%).[web:8][web:11]  
- Total nilai pipeline (`nilai_potensial`) vs realisasi per periode.[web:47][web:59]

---

## 10. Risiko & Mitigasi

| Risiko                      | Mitigasi                                  |
|----------------------------|--------------------------------------------|
| GPS tidak akurat           | Radius toleransi 100m                     |
| User menolak izin lokasi   | Blocking fitur kunjungan                   |
| Beban approval tinggi      | Role supervisor & filter di dashboard      |
| Data sensitif              | Logging, access control, dan audit trail   |[file:1]

Tambahan: risiko data marketing tidak konsisten diatasi dengan field wajib dan rule approval supervisor.[file:1][web:56]

---

## 11. API Contract (Ringkasan)

### 11.1 POST `/api/v1/visits`

Mencatat kunjungan + data marketing.

Request (ringkas):

- Data utama: `employee_id`, `visit_date`, `customer_id`, `customer_name`, `customer_address`.  
- Geo: `latitude`, `longitude`, `accuracy`.  
- Kunjungan: `purpose`, foto opsional.  
- Marketing:  
  - `products` (list produk: `product_code`, `product_name`, `prospect_status`, `potential_value`).  
  - `overall_prospect_status`, `overall_potential_value`, `notes`, `follow_up_at`.[web:22][web:24][web:29]

Response sukses (201):

- `visit_id`, `status` = `PENDING`, dan pesan singkat.[file:1]

### 11.2 PATCH `/api/v1/visits/{visit_id}/approval`

Request: `approver_id`, `status` (APPROVED/REJECTED), `note`.[file:1]  
Response: `visit_id`, `status`, `approved_at`.[file:1]

### 11.3 GET `/api/v1/reports/marketing`

Query: `start_date`, `end_date`, `employee_id?`, `product_code?`, `status_prospek?`.[web:51]  
Response: `summary` (aggregat funnel) dan `items` (detail per kunjungan dengan data marketing).[web:22][web:24][web:29]

---

## 12. Rancangan UI (Ringkas)

### 12.1 Mobile – Form Kunjungan + Marketing

- Header: nama & ID nasabah, alamat singkat.[file:1]  
- Section Lokasi: peta mini, indikator radius valid, tombol foto.[file:1][web:70]  
- Section Detail Kunjungan: field tujuan kunjungan + catatan.[file:1]  
- Section Marketing (kondisional):  
  - Multi‑select produk.  
  - Status prospek, nilai potensial, jadwal follow‑up, catatan marketing.[web:69][web:73]  
- Action bar: tombol “Simpan kunjungan”, validasi absensi, GPS, dan radius.[file:1]

### 12.2 Mobile – Riwayat Kunjungan Karyawan

- List grouped by tanggal dengan ikon/badge:  
  - Service saja, ada penawaran, sudah realisasi.[file:1]  
- Detail kunjungan: info produk yang ditawarkan, status prospek, follow‑up, dan link ke peta.[file:1][web:69]

### 12.3 Web Dashboard – Admin/Supervisor

- Filter global: periode, cabang, karyawan, produk.[web:77]  
- Kartu ringkas: total kunjungan valid, kunjungan dengan penawaran, total prospek, total realisasi & nilai.[web:68]  
- Grafik funnel: Penawaran → Prospek → Realisasi.[web:68][web:80]  
- Tabel kunjungan: tanggal, karyawan, nasabah, tujuan, produk (ringkas), status prospek, nilai potensial, status approval, indikator GPS.[file:1]  
- Slide panel detail kunjungan: peta, foto, catatan marketing.[file:1]

### 12.4 Web – Laporan Per Produk

- Tab “Laporan Produk & Prospek”: tabel per produk ditawarkan per kunjungan.[web:47]  
- Grafik bar: prospek & realisasi per produk per periode.[web:47][web:53][web:59]

---

## 13. Catatan Kepatuhan & Audit

- Semua approval kunjungan dan data marketing tercatat di audit trail.[file:1]  
- Data lokasi dan informasi marketing tidak bisa diedit setelah approval.[file:1]  
- Laporan disajikan dalam bentuk immutable (read‑only) untuk keperluan audit internal dan eksternal.[file:1][web:56]

📌 **Dokumen PRD + Modul Marketing & Prospek ini menjadi acuan utama keputusan produk dan pengembangan.**[file:1]
```

<div align="center">⁂</div>

[^1]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/153302360/47736ecc-c053-41bc-b8d2-51752682414e/Product-Requirements-Document.md

