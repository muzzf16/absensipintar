# 📘 Dokumentasi Teknis Aplikasi Absensi & Kunjungan Nasabah

---

## 1️⃣ Sequence Diagram

### 🔐 Login & Absensi Masuk
```mermaid
sequenceDiagram
    participant U as User
    participant A as App
    participant S as Server
    participant DB as Database

    U->>A: Login
    A->>S: POST /auth/login
    S->>DB: Validasi user
    DB-->>S: OK
    S-->>A: Token
    U->>A: Absen Masuk
    A->>S: POST /attendance/checkin
    S->>DB: Simpan absensi
    DB-->>S: Success
📍 Kunjungan Nasabah + Approval
mermaid
Salin kode
sequenceDiagram
    participant K as Karyawan
    participant A as App
    participant S as Server
    participant DB as Database
    participant SP as Supervisor

    K->>A: Input Kunjungan
    A->>A: Validasi GPS & Radius
    A->>S: POST /visits
    S->>DB: Simpan (Pending)

    SP->>A: Review Kunjungan
    A->>S: POST /visits/{id}/approve
    S->>DB: Update status
2️⃣ API Contract (REST)
🔐 Authentication
Method	Endpoint	Deskripsi
POST	/auth/login	Login user
POST	/auth/logout	Logout

👤 User
Method	Endpoint
GET	/users
POST	/users
PUT	/users/{id}

⏱️ Absensi
Method	Endpoint	Keterangan
POST	/attendance/checkin	Absen masuk
POST	/attendance/checkout	Absen pulang
GET	/attendance/me	Riwayat user

🏢 Nasabah
Method	Endpoint
GET	/customers
POST	/customers

📍 Kunjungan
Method	Endpoint	Keterangan
POST	/visits	Input kunjungan
GET	/visits	List (admin/supervisor)
POST	/visits/{id}/approve	Approval
POST	/visits/{id}/reject	Rejection

📄 Laporan
Method	Endpoint
GET	/reports/csv
GET	/reports/pdf

3️⃣ Struktur Database SQL
sql
Salin kode
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password TEXT,
  role ENUM('admin','supervisor','karyawan')
);

CREATE TABLE attendances (
  id UUID PRIMARY KEY,
  user_id UUID,
  attendance_date DATE,
  check_in TIMESTAMP,
  check_out TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE customers (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7)
);

CREATE TABLE visits (
  id UUID PRIMARY KEY,
  user_id UUID,
  customer_id UUID,
  attendance_id UUID,
  visit_time TIMESTAMP,
  purpose TEXT,
  notes TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  photo_url TEXT,
  status ENUM('pending','approved','rejected'),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (attendance_id) REFERENCES attendances(id)
);

CREATE TABLE approvals (
  id UUID PRIMARY KEY,
  visit_id UUID,
  approver_id UUID,
  status ENUM('approved','rejected'),
  note TEXT,
  approved_at TIMESTAMP,
  FOREIGN KEY (visit_id) REFERENCES visits(id),
  FOREIGN KEY (approver_id) REFERENCES users(id)
);
4️⃣ User Story & Acceptance Criteria
🧑‍🔧 Karyawan
User Story:
Sebagai karyawan, saya ingin melakukan absensi dan mencatat kunjungan nasabah agar aktivitas kerja saya terdokumentasi.

Acceptance Criteria:

Bisa absen masuk & pulang

Tidak bisa kunjungan tanpa absen

GPS wajib aktif

Bisa submit tanpa foto

🧑‍💼 Supervisor
User Story:
Sebagai supervisor, saya ingin mereview dan menyetujui kunjungan tim agar laporan valid.

Acceptance Criteria:

Bisa lihat lokasi & foto

Bisa approve / reject

Bisa beri catatan

👨‍💼 Admin
User Story:
Sebagai admin, saya ingin mendapatkan laporan resmi agar mudah melakukan audit.

Acceptance Criteria:

Bisa export PDF & CSV

Hanya data approved

Bisa filter periode & user