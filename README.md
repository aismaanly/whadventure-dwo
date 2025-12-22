# 🚀 AdventureWorks Data Warehouse & OLAP Dashboard

Final Project Pengembangan Data Warehouse dan OLAP  
Program Studi Sistem Informasi – UPN "Veteran" Jawa Timur

---

## 📖 Gambaran Umum
Proyek ini merupakan **Final Project mata kuliah Data Warehouse dan OLAP** yang berfokus pada pembangunan **Data Warehouse AdventureWorks** serta implementasi **analisis OLAP dan dashboard** pada domain **Sales dan Production**.
Sistem ini dirancang untuk mendukung **analisis data historis secara multidimensi**, sehingga mampu membantu proses pengambilan keputusan berbasis data melalui laporan dan eksplorasi OLAP.

---

## 🎯 Tujuan Proyek
- Membangun skema **Data Warehouse AdventureWorks**
- Mengimplementasikan **OLAP Cube** menggunakan Mondrian
- Menyediakan aplikasi web untuk eksplorasi data Sales dan Production
- Mendukung analisis data historis secara cepat dan terstruktur

---

## 👥 Tim Pengembang  
**Kelompok 4 – Kelas C**

| Nama | NIM |
|------|-----|
| Najoan Rizki Pradana | 22082010056 |
| Shania Chairunnisa Santoso | 22082010062 |
| Salsabila Putri Azzahra | 22082010079 |
| Aisma Nurlaili | 22082010083 |

---

## 🛠️ Teknologi yang Digunakan
- **Next.js** – Frontend Framework (React)
- **Node.js** – JavaScript Runtime
- **MySQL** – Database Server  
- **Apache (XAMPP)** – Web Server  
- **Apache Tomcat** – Application Server  
- **Mondrian** – OLAP Engine  
- **phpMyAdmin** – Database Management  

---

## 🚀 Fitur Utama
- **Integrated ETL:** Skema data yang optimal hasil transformasi dari sistem operasional ke sistem warehouse. 
- **Drill-down Analytics:** Kemampuan melihat detail data dari level kategori hingga level produk spesifik.
- **OLAP Dashboard:** Visualisasi interaktif untuk data penjualan dan produksi.

---

## ⚙️ Panduan Instalasi & Konfigurasi

### 1️⃣ Persiapan Lingkungan dan Konfigurasi Database
1. Pastikan sudah terinstall **XAMPP**
2. Pastikan modul **Apache**, **MySQL**, dan **Tomcat** tersedia
3. Gunakan **phpMyAdmin** untuk pengelolaan database
4. Jalankan Apache dan MySQL melalui XAMPP Control Panel
5. Akses phpMyAdmin melalui:
```
http://localhost/phpmyadmin
```
6. Buat database baru dengan nama `whadventure`
7. Import file `whadventure.sql` (tersedia pada folder **olap_database/database**)

### 2️⃣ Konfigurasi Mondrian OLAP
1. Salin file `mondrian.war` ke:
```
xampp/tomcat/webapps
```
2. Salin file `mysql-connector-java-5.1.4-bin.jar` ke dalam:
```
xampp/tomcat/webapps/mondrian/WEB-INF/lib
```
3. Salin seluruh file dari `olap_database/mondrian-files/WEB-INF/queries` ke `xampp/tomcat/webapps/mondrian/WEB-INF/queries`
4. Salin seluruh file dari `olap_database/mondrian-files/mondrian` ke `xampp/tomcat/webapps/mondrian`

---

### 3️⃣ Konfigurasi Backend (API endpoint)
1. Masuk ke direktori back-end
```
cd back-end
```
2. Buat file .env dan sesuaikan kredensial database Anda:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=whadventure
```
3. Jalankan perintah:
```
npm install
node index.js
```

### 4️⃣ Menjalankan Dashboard
1. Masuk ke direktori front-end (Next.js).
```
cd front-end
```
2. Buat file .env
```
NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_OLAP_SALES_URL=http://localhost:8080/mondrian/testpage.jsp?query=factsales
NEXT_PUBLIC_OLAP_PRODUCTION_URL=http://localhost:8080/mondrian/testpage.jsp?query=factproduction
```
3. Jalankan perintah:
```
npm install
npm run dev
```
4. Akses aplikasi melalui browser di `http://localhost:3000`
5. Informasi Login
  - Username: Admin
  - Password: admin123 











