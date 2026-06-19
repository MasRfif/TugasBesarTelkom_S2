# The Village

The Village adalah aplikasi acara desa berbasis React + PHP native MVC. Tampilan ada di React, sedangkan server memakai struktur Model dan Controller karena view sudah ditangani React.

## Isi folder

- `UI/` — tampilan React/Vite.
- `server/` — API PHP native MVC.
- `server/app/models/` — query database.
- `server/app/controllers/` — penghubung request API ke model.
- `server/database/the_village.sql` — database yang bisa langsung di-import ke phpMyAdmin.

## Cara menjalankan

1. Salin folder `TheVillage` ke `C:/xampp/htdocs/TheVillage`.
2. Buka phpMyAdmin, lalu import `server/database/the_village.sql`.
3. Pastikan nama database di `server/config/database.php` adalah `the_village`.
4. Jalankan UI:

```bash
cd C:/xampp/htdocs/TheVillage/UI
npm install
npm run dev
```

5. Buka `http://localhost:5173`.

## Akun demo

- `admin@village.test / password`
- `organizer@village.test / password`
- `user@village.test / password`

## Catatan perubahan

- Nama web sudah menjadi **The Village**.
- Data kategori, kota, acara, tiket, metode pembayaran, FAQ, transaksi, dan peta mengambil dari database.
- Dropdown kota sudah memakai komponen custom bergaya floating card.
- Navbar HP memakai floating card dengan animasi.
- Acara mendatang di halaman beranda scroll ke kanan/kiri.
- Daftar acara di HP dibatasi tampilan awalnya dan diberi efek fade.
