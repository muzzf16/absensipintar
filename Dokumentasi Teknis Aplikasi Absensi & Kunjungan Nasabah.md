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

---------------------
Panduan Deployment AbsensiPintar ke Alibaba Cloud VPS (Ubuntu)
Panduan ini akan membantu Anda men-deploy aplikasi React (Frontend) dan Node.js/Express (Backend) ke VPS Alibaba Cloud menggunakan Nginx sebagai reverse proxy.

1. Persiapan VPS (Alibaba Cloud ECS)
Buat Instance ECS:

Pilih Operating System: Ubuntu 22.04 LTS atau 24.04 LTS.
Instance Type: Minimal 1GB RAM (t5/t6 burstable untuk free tier biasanya ok, tapi disarankan aktifkan SWAP).
Security Group: Buka port 22 (SSH), 80 (HTTP), dan 443 (HTTPS).
Login SSH:

ssh root@<IP_PUBLIC_VPS>
2. Setup Lingkungan Server
Jalankan perintah berikut di terminal VPS Anda.

A. Update & Install Tools Dasar
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl nginx build-essential
B. Install Node.js (via NVM)
Aplikasi ini menggunakan Node.js (disarankan v18 atau v20).

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v # Verifikasi instalasi
C. Install PM2 (Process Manager)
Untuk menjalankan backend di background.

npm install -g pm2
D. Setup Swap Memory (PENTING untuk VPS Kecil)
Agar proses build tidak crash karena kehabisan RAM (terutama saat npm run build).

sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
3. Deployment Aplikasi
A. Clone Repository
cd /var/www
sudo mkdir absensipintar
sudo chown -R $USER:$USER absensipintar
git clone https://github.com/muzzf16/absensipintar.git .
B. Setup Backend
cd backend
# Install dependencies
npm install
# Setup Environment Variables
nano .env
# Paste isi .env lokal Anda, ubah DATABASE_URL jika perlu.
# Contoh:
# PORT=5000
# DATABASE_URL="file:./prod.db"
# JWT_SECRET=rahasia_super_aman
# Setup Database (Prisma)
npx prisma migrate deploy
npx prisma generate
node prisma/seed.js # Jika ingin data dummy awal
# Jalankan dengan PM2
pm2 start src/server.js --name "absensi-backend"
pm2 save
pm2 startup
C. Setup Frontend
cd ../frontend
# Install dependencies
npm install
# Build untuk Production
npm run build
# Hasil build akan ada di folder 'dist'
4. Konfigurasi Nginx
Kita akan menggunakan Nginx untuk melayani Frontend (file statis) dan meneruskan request API ke Backend.

Buat Config Nginx:

sudo nano /etc/nginx/sites-available/absensipintar
Isi Config: Ganti your_domain_or_ip dengan IP Public VPS atau Domain Anda.

server {
    listen 80;
    server_name your_domain_or_ip;
    root /var/www/absensipintar/frontend/dist;
    index index.html;
    # Frontend: Serve React App
    location / {
        try_files $uri $uri/ /index.html;
    }
    # Backend: Reverse Proxy ke Node.js
    location /api/ {
        proxy_pass http://localhost:5000; # Pastikan port sama dengan .env backend
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static Files Caching (Optional)
    location /uploads/ {
        alias /var/www/absensipintar/backend/uploads/;
    }
}
Aktifkan Config:

sudo ln -s /etc/nginx/sites-available/absensipintar /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default # Hapus default
sudo nginx -t # Test config
sudo systemctl restart nginx
5. Mengakses Aplikasi
Buka browser dan akses http://<IP_PUBLIC_VPS>. Aplikasi Anda seharusnya sudah berjalan!

6. (Opsional) Setup Domain & HTTPS (SSL)
Jika Anda memiliki domain (misal: app.perusahaan.com):

Arahkan A Record domain ke IP Public VPS di panel DNS provider domain Anda.
Install Certbot di VPS:
sudo apt install -y certbot python3-certbot-nginx
Request SSL:
sudo certbot --nginx -d app.perusahaan.com
Certbot akan otomatis mengupdate config Nginx Anda untuk HTTPS.
7. Bisakah Developing Langsung di Cloud? (Remote Development)
Ya, Anda bisa melakukan developing langsung di VPS (Cloud), namun ada dua pendekatan utama:

Opsi A: VS Code Remote - SSH (Disarankan untuk "Dev Box")
Anda bisa menghubungkan VS Code di laptop Anda langsung ke file di VPS. Rasanya seperti coding di lokal, tapi code sebenarnya ada di cloud.

Cara Setup:

Install Extension Remote - SSH di VS Code.
Klik ikon hijau di pojok kiri bawah VS Code -> Connect to Host.
Masukkan: root@<IP_PUBLIC_VPS>.
VS Code akan membuka window baru yang terhubung ke VPS. Anda bisa buka folder /var/www/absensipintar dan edit file langsung.
Penting: Setiap perubahan file akan langsung efektif (setelah restart server/rebuild).
Opsi B: Git Workflow (Disarankan untuk "Production")
Untuk aplikasi yang sedang dipakai user (Production), JANGAN edit langsung di Cloud.

Develop di Laptop (Local).
Push ke GitHub (git push).
Pull di VPS (git pull dan restart PM2).
Kenapa? Agar jika ada error saat coding, user di live server tidak terganggu. Gunakan Opsi A hanya jika VPS ini khusus untuk testing/development, bukan server utama.

