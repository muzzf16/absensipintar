# 📕 PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Aplikasi Absensi & Kunjungan Nasabah Berbasis Mobile

---

## 1. Ringkasan Produk

### 1.1 Nama Produk
**Absensi Pintar & Kunjungan Nasabah**

### 1.2 Deskripsi Singkat
Aplikasi mobile untuk mencatat **absensi karyawan** dan **kunjungan nasabah berbasis GPS** dengan sistem **approval berjenjang (Backend ready)**, **anti fake GPS**, dan **laporan resmi (CSV)**.

### 1.3 Tujuan Produk
- Meningkatkan akurasi absensi lapangan
- Memastikan kunjungan nasabah benar-benar terjadi di lokasi
- Menyediakan laporan yang valid untuk manajemen & audit

---

## 2. Latar Belakang & Masalah

### Masalah Saat Ini
- Absensi manual mudah dimanipulasi
- Kunjungan nasabah sulit diverifikasi
- Tidak ada validasi lokasi
- Laporan tidak terstandarisasi
- Approval tidak terdokumentasi

### Solusi Produk
- GPS wajib & radius lokasi (100m)
- Bukti kunjungan (opsional foto)
- Approval supervisor/admin
- Laporan otomatis & audit trail

---

## 3. Target Pengguna

| Persona | Kebutuhan |
|------|----------|
| Karyawan Lapangan | Absensi cepat & kunjungan mudah |
| Supervisor | Monitoring & approval tim |
| Admin / Manajemen | Laporan valid & audit |

---

## 4. Tujuan Bisnis (Business Goals)

- Mengurangi kecurangan absensi
- Meningkatkan produktivitas lapangan
- Mempermudah audit internal & eksternal
- Mendukung standar ISO (9001 & 27001)

---

## 5. Scope Produk

### 5.1 In-Scope (Termasuk)
- Absensi masuk & pulang
- Syarat Absen: Wajib Clock In sebelum input Kunjungan
- Kunjungan nasabah berbasis GPS
- Google Maps integration (Link ke Peta)
- Radius lokasi (100 meter)
- Role Admin, Supervisor, Karyawan
- Export CSV

### 5.2 Out-of-Scope (Tahap Ini)
- Mode offline penuh
- Face recognition
- Payroll & gaji
- Integrasi ERP eksternal
- Export PDF (Planned)
- Approval UI (Backend Ready, UI Next Phase)

---

## 6. Fitur Utama

### 6.1 Autentikasi & Role
- Login email & password
- Role-based access control
- Session & token security

---

### 6.2 Absensi
- Absen masuk (1x/hari)
- Absen pulang
- Timestamp otomatis
- Syarat wajib sebelum kunjungan

---

### 6.3 Kunjungan Nasabah
- Input data nasabah
- Display Alamat Nasabah di Form
- GPS lokasi **WAJIB**
- Foto **OPSIONAL**
- Tanggal & waktu otomatis
- Terhubung dengan absensi hari itu

---

### 6.4 Validasi Lokasi
- Google Maps marker (Link di Dashboard Admin)
- Radius lokasi (100 meter)
- Penolakan otomatis jika di luar radius
- Mencegah fake GPS

---

### 6.5 Approval Kunjungan
- Status:
  - Pending
  - Approved
  - Rejected
- Catatan wajib saat reject
- (Note: Backend Logic Implemented, Frontend UI Pending)

---

### 6.6 Dashboard & Monitoring
- Dashboard Karyawan (Riwayat Grouped by Date)
- Dashboard Supervisor (tim)
- Dashboard Admin (Global, Filters, Export)

---

### 6.7 Laporan
- Export CSV (Implemented)
- Export PDF (Planned)
- Filter:
  - Periode
  - User
  - Status
  - Nasabah
- Laporan resmi & audit-ready

---

## 7. User Flow (High Level)

1. User login (Admin/Karyawan)
2. Absen masuk (Mandatory)
3. Kunjungan nasabah
4. Validasi GPS & radius (Max 100m)
5. Status Pending
6. Supervisor/Admin approval (Backend)
7. Laporan dihasilkan (CSV Export)
8. Absen pulang

---

## 8. Non-Functional Requirements

| Aspek | Requirement |
|----|------------|
| Performance | Response < 3 detik |
| Availability | ≥ 99% |
| Security | RBAC, audit trail |
| Compliance | ISO 9001, ISO 27001 |
| Scalability | Multi-user & multi-tim |

---

## 9. Success Metrics (KPI)

- ≥ 95% kunjungan tervalidasi GPS
- 0 manipulasi lokasi terdeteksi
- Waktu approval < 24 jam
- 100% laporan dapat diaudit

---

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|-----|---------|
| GPS tidak akurat | Radius toleransi 100m |
| User menolak izin lokasi | Blocking fitur |
| Beban approval | Role Supervisor |
| Data sensitif | Logging & access control |

---

## 11. Milestone Pengembangan

| Tahap | Deliverable | Status |
|----|------------|---|
| Phase 1 | Absensi & login | Done |
| Phase 2 | Kunjungan + GPS | Done |
| Phase 3 | Approval & dashboard | Partial (Admin Dashboard Done, Approval UI Pending) |
| Phase 4 | Laporan & audit | Partial (CSV Done) |
| Phase 5 | Hardening & compliance | Future |

---

## 12. Catatan Kepatuhan & Audit

- Semua approval tercatat
- Data lokasi tidak bisa diedit
- Log aktivitas user tersedia
- Laporan immutable (read-only)

---

## 13. Lampiran
- SRS
- ERD
- Flowchart
- Sequence Diagram
- API Contract
- Test Case & QA Checklist
- ISO Readiness

---

📌 **Dokumen PRD ini menjadi acuan utama keputusan produk dan pengembangan.**
