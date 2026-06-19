# The Village — Dokumentasi Singkat

The Village adalah sistem informasi manajemen acara desa. UI dibuat dengan React, sedangkan server memakai PHP native MVC sederhana.

## Struktur utama

```text
TheVillage/
├── UI/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   └── package.json
└── server/
    ├── app/
    │   ├── controllers/
    │   ├── helpers/
    │   ├── middleware/
    │   └── models/
    ├── config/database.php
    ├── database/the_village.sql
    ├── public/index.php
    └── routes/api.php
```

## Alur data

React memanggil endpoint `/api/...`. Vite meneruskan request ke `http://localhost/TheVillage/server/public`. Server membaca route, menjalankan controller, lalu controller memanggil model untuk mengambil atau mengubah data di database `the_village`.

## Endpoint penting

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/events` | Mengambil daftar acara |
| GET | `/api/events/{id}` | Detail acara dan tiket |
| GET | `/api/categories` | Kategori dari database |
| GET | `/api/cities` | Daftar kota dari tabel desa |
| GET | `/api/payment-methods` | Metode pembayaran aktif |
| POST | `/api/login` | Masuk akun |
| POST | `/api/register` | Daftar akun |
| POST | `/api/checkout` | Membuat transaksi tiket |
| GET | `/api/admin/events` | Data acara untuk admin |
| POST | `/api/admin/verify-event` | Setujui atau tolak acara |
| GET | `/api/organizer/events` | Acara milik penyelenggara |
| POST | `/api/organizer/events` | Membuat acara baru |

## Database

File import ada di:

```text
server/database/the_village.sql
```

Database sudah memakai tabel yang sesuai dengan data terbaru: `events`, `event_categories`, `desa`, `lokasi_pin`, `tiket`, `kategori_tiket`, `transaksi`, `detail_transaksi`, `payments`, `payment_methods`, `tiket_user`, `faq`, `cctv`, dan tabel pendukung lain.

Data kota tambahan juga sudah dimasukkan supaya pilihan kota bisa muncul dari database: Bandung, Bekasi, Jakarta, Bogor, dan Tangerang.
