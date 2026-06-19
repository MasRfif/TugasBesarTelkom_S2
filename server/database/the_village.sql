-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 06, 2026 at 09:42 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `the_village`
--

-- --------------------------------------------------------

--
-- Table structure for table `auto_validation_rules`
--

CREATE TABLE `auto_validation_rules` (
  `id_rule` int(11) NOT NULL,
  `nama_rule` varchar(150) NOT NULL,
  `kategori_aman` varchar(120) DEFAULT NULL,
  `max_peserta` int(11) NOT NULL DEFAULT 0,
  `wajib_lokasi_valid` tinyint(1) NOT NULL DEFAULT 1,
  `status_rule` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auto_validation_rules`
--

INSERT INTO `auto_validation_rules` (`id_rule`, `nama_rule`, `kategori_aman`, `max_peserta`, `wajib_lokasi_valid`, `status_rule`) VALUES
(1, 'Rule Pengajian Aman', 'Pengajian', 300, 1, 'ACTIVE'),
(2, 'Rule 17 Agustus Aman', 'Acara 17 Agustus', 500, 1, 'ACTIVE'),
(3, 'Rule Kerja Bakti Aman', 'Kerja Bakti', 200, 1, 'ACTIVE'),
(4, 'Rule Bazar UMKM Aman', 'Bazar UMKM', 400, 1, 'ACTIVE');

-- --------------------------------------------------------

--
-- Table structure for table `cctv`
--

CREATE TABLE `cctv` (
  `id_cctv` int(11) NOT NULL,
  `id_event` int(11) NOT NULL,
  `url_stream` varchar(255) NOT NULL,
  `lokasi_cctv` varchar(160) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cctv`
--

INSERT INTO `cctv` (`id_cctv`, `id_event`, `url_stream`, `lokasi_cctv`) VALUES
(1, 1, 'https://example.com/stream/lapangan', 'Pintu masuk lapangan'),
(2, 1, 'https://example.com/stream/panggung', 'Area panggung');

-- --------------------------------------------------------

--
-- Table structure for table `desa`
--

CREATE TABLE `desa` (
  `id_desa` int(11) NOT NULL,
  `nama_desa` varchar(120) NOT NULL,
  `kecamatan` varchar(120) NOT NULL,
  `kabupaten` varchar(120) NOT NULL,
  `provinsi` varchar(120) NOT NULL,
  `alamat_desa` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `desa`
--

INSERT INTO `desa` (`id_desa`, `nama_desa`, `kecamatan`, `kabupaten`, `provinsi`, `alamat_desa`) VALUES
(1, 'Desa Sukamaju', 'Cibiru', 'Bandung', 'Jawa Barat', 'Jl. Raya Sukamaju No. 1'),
(2, 'Desa Mekarsari', 'Bojongsoang', 'Bandung', 'Jawa Barat', 'Jl. Melati Desa Mekarsari'),
(3, 'Desa Citrajaya', 'Setu', 'Bekasi', 'Jawa Barat', 'Jl. Desa Citrajaya');

-- --------------------------------------------------------

--
-- Table structure for table `detail_transaksi`
--

CREATE TABLE `detail_transaksi` (
  `id_detail` int(11) NOT NULL,
  `id_transaksi` int(11) NOT NULL,
  `id_tiket` int(11) DEFAULT NULL,
  `id_produk` int(11) DEFAULT NULL,
  `jumlah` int(11) NOT NULL DEFAULT 1,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `detail_transaksi`
--

INSERT INTO `detail_transaksi` (`id_detail`, `id_transaksi`, `id_tiket`, `id_produk`, `jumlah`, `subtotal`) VALUES
(1, 1, 5, NULL, 1, 10000.00),
(2, 2, 5, NULL, 2, 20000.00),
(3, 3, 4, NULL, 1, 0.00),
(4, 4, 2, NULL, 1, 75000.00),
(5, 5, 6, NULL, 2, 0.00),
(6, 6, 6, NULL, 8, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `dompet`
--

CREATE TABLE `dompet` (
  `id_dompet` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `saldo` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status_dompet` enum('ACTIVE','INACTIVE','BLOCKED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `dompet`
--

INSERT INTO `dompet` (`id_dompet`, `id_user`, `saldo`, `status_dompet`, `created_at`) VALUES
(1, 2, 0.00, 'ACTIVE', '2026-06-02 10:11:29'),
(2, 5, 0.00, 'ACTIVE', '2026-06-02 10:20:56');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id_event` int(11) NOT NULL,
  `id_desa` int(11) NOT NULL,
  `id_category` int(11) NOT NULL,
  `id_lokasi` int(11) NOT NULL,
  `nama_event` varchar(180) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `jenis_event` enum('GRATIS','BERBAYAR') NOT NULL DEFAULT 'GRATIS',
  `status_event` enum('DRAFT','PENDING','APPROVED','AUTO_APPROVED','REJECTED','PUBLISHED','SELESAI') NOT NULL DEFAULT 'DRAFT',
  `visibility_type` enum('PUBLIC','DESA_ONLY','RT_RW_ONLY') NOT NULL DEFAULT 'PUBLIC',
  `target_rt` varchar(10) DEFAULT NULL,
  `target_rw` varchar(10) DEFAULT NULL,
  `max_peserta` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id_event`, `id_desa`, `id_category`, `id_lokasi`, `nama_event`, `deskripsi`, `tanggal_mulai`, `tanggal_selesai`, `jenis_event`, `status_event`, `visibility_type`, `target_rt`, `target_rw`, `max_peserta`, `created_at`) VALUES
(1, 1, 2, 1, 'Festival 17 Agustus Desa', 'Perayaan kemerdekaan dengan lomba warga, bazar UMKM, dan panggung hiburan.', '2026-08-17', '2026-08-17', 'BERBAYAR', 'PUBLISHED', 'PUBLIC', NULL, NULL, 500, '2026-06-02 10:11:29'),
(2, 1, 1, 2, 'Pengajian Akbar Jumat Berkah', 'Pengajian warga desa dengan penceramah lokal dan konsumsi bersama.', '2026-06-14', '2026-06-14', 'GRATIS', 'PUBLISHED', 'DESA_ONLY', NULL, NULL, 300, '2026-06-02 10:11:29'),
(3, 1, 3, 3, 'Kerja Bakti RW 02', 'Kegiatan bersih lingkungan dan penataan taman warga.', '2026-06-21', '2026-06-21', 'GRATIS', 'PUBLISHED', 'RT_RW_ONLY', NULL, NULL, 200, '2026-06-02 10:11:29'),
(4, 1, 5, 1, 'Bazar UMKM Desa', 'Bazar produk makanan, pakaian, dan kerajinan warga.', '2026-07-05', '2026-07-05', 'BERBAYAR', 'PUBLISHED', 'PUBLIC', NULL, NULL, 400, '2026-06-02 10:11:29'),
(5, 1, 2, 1, 'Test', 'ini addalah Test Event', '2026-06-02', '2026-06-05', 'GRATIS', 'PUBLISHED', 'PUBLIC', NULL, NULL, 100, '2026-06-02 10:21:38'),
(6, 1, 4, 1, 'test 2', 'test', '2026-06-18', '2026-06-20', 'GRATIS', 'REJECTED', 'PUBLIC', NULL, NULL, 100, '2026-06-02 10:59:10'),
(7, 1, 5, 1, 'test bayar', 'BAYARRR', '2026-07-31', '2026-08-01', 'BERBAYAR', 'PENDING', 'PUBLIC', NULL, NULL, 100, '2026-06-02 13:14:49'),
(8, 1, 10, 1, 'test approve', 'BAYARRR', '2026-07-31', '2026-08-01', 'BERBAYAR', 'PUBLISHED', 'PUBLIC', NULL, NULL, 100, '2026-06-02 13:15:30');

-- --------------------------------------------------------

--
-- Table structure for table `event_categories`
--

CREATE TABLE `event_categories` (
  `id_category` int(11) NOT NULL,
  `nama_category` varchar(120) NOT NULL,
  `deskripsi_category` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_categories`
--

INSERT INTO `event_categories` (`id_category`, `nama_category`, `deskripsi_category`) VALUES
(1, 'Pengajian', 'Kegiatan keagamaan warga'),
(2, 'Acara 17 Agustus', 'Kegiatan kemerdekaan'),
(3, 'Kerja Bakti', 'Kegiatan kebersihan desa'),
(4, 'Posyandu', 'Kesehatan warga'),
(5, 'Bazar UMKM', 'Pasar produk warga'),
(6, 'Rapat RT/RW', 'Rapat warga'),
(7, 'Musyawarah Desa', 'Forum desa'),
(8, 'Lomba Desa', 'Kompetisi warga'),
(9, 'Karang Taruna', 'Kegiatan pemuda'),
(10, 'Festival Desa', 'Perayaan budaya desa');

-- --------------------------------------------------------

--
-- Table structure for table `event_images`
--

CREATE TABLE `event_images` (
  `id_event_image` int(11) NOT NULL,
  `id_event` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_images`
--

INSERT INTO `event_images` (`id_event_image`, `id_event`, `image_url`) VALUES
(1, 1, '/assets/17 agus.jpg'),
(2, 2, '/assets/pengajian.avif'),
(3, 3, '/assets/gotong royong.jpg'),
(4, 4, '/assets/jalan sehat.jpg'),
(5, 5, '/assets/17 agus.jpg'),
(6, 6, '/assets/17 agus.jpg'),
(7, 7, '/assets/17 agus.jpg'),
(8, 8, '/assets/17 agus.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `event_organizers`
--

CREATE TABLE `event_organizers` (
  `id_event_organizer` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_event` int(11) NOT NULL,
  `role_event` enum('OWNER','TICKET_ADMIN','PAYMENT_ADMIN','TRAFFIC_ADMIN','CONTENT_ADMIN','VIEWER') NOT NULL DEFAULT 'OWNER',
  `status_member` enum('ACTIVE','INACTIVE','INVITED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_organizers`
--

INSERT INTO `event_organizers` (`id_event_organizer`, `id_user`, `id_event`, `role_event`, `status_member`, `created_at`) VALUES
(1, 2, 1, 'OWNER', 'ACTIVE', '2026-06-02 10:11:29'),
(2, 2, 2, 'OWNER', 'ACTIVE', '2026-06-02 10:11:29'),
(3, 2, 3, 'OWNER', 'ACTIVE', '2026-06-02 10:11:29'),
(4, 2, 4, 'OWNER', 'ACTIVE', '2026-06-02 10:11:29'),
(5, 5, 5, 'OWNER', 'ACTIVE', '2026-06-02 10:21:38'),
(6, 5, 6, 'OWNER', 'ACTIVE', '2026-06-02 10:59:10'),
(7, 6, 6, 'TICKET_ADMIN', 'ACTIVE', '2026-06-02 11:01:27'),
(8, 5, 7, 'OWNER', 'ACTIVE', '2026-06-02 13:14:49'),
(9, 5, 8, 'OWNER', 'ACTIVE', '2026-06-02 13:15:30');

-- --------------------------------------------------------

--
-- Table structure for table `event_verifications`
--

CREATE TABLE `event_verifications` (
  `id_verif` int(11) NOT NULL,
  `id_event` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `id_rule` int(11) DEFAULT NULL,
  `status_verif` enum('PENDING','APPROVED','AUTO_APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `tipe_verif` enum('ADMIN_BG','SYSTEM_AUTO') NOT NULL DEFAULT 'ADMIN_BG',
  `alasan` text DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_verifications`
--

INSERT INTO `event_verifications` (`id_verif`, `id_event`, `id_user`, `id_rule`, `status_verif`, `tipe_verif`, `alasan`, `verified_at`, `created_at`) VALUES
(1, 1, 3, 2, 'APPROVED', 'ADMIN_BG', 'Event memenuhi syarat', '2026-06-02 17:11:29', '2026-06-02 10:11:29'),
(2, 2, 4, 1, 'AUTO_APPROVED', 'SYSTEM_AUTO', 'Aman sesuai rule otomatis', '2026-06-02 17:11:29', '2026-06-02 10:11:29'),
(3, 3, 4, 3, 'AUTO_APPROVED', 'SYSTEM_AUTO', 'Aman sesuai rule otomatis', '2026-06-02 17:11:29', '2026-06-02 10:11:29'),
(4, 4, NULL, 4, 'PENDING', 'ADMIN_BG', 'Menunggu review', NULL, '2026-06-02 10:11:29'),
(5, 5, NULL, 1, 'PENDING', 'ADMIN_BG', 'Menunggu verifikasi admin', NULL, '2026-06-02 10:21:38'),
(6, 5, 3, 1, 'APPROVED', 'ADMIN_BG', 'APPROVED', '2026-06-02 17:28:08', '2026-06-02 10:28:08'),
(7, 4, 3, 1, 'APPROVED', 'ADMIN_BG', 'APPROVED', '2026-06-02 17:28:10', '2026-06-02 10:28:10'),
(8, 6, NULL, 1, 'PENDING', 'ADMIN_BG', 'Menunggu verifikasi admin', NULL, '2026-06-02 10:59:10'),
(9, 6, 3, 1, 'REJECTED', 'ADMIN_BG', 'REJECTED', '2026-06-02 17:59:40', '2026-06-02 10:59:40'),
(10, 7, NULL, 1, 'PENDING', 'ADMIN_BG', 'Menunggu verifikasi admin', NULL, '2026-06-02 13:14:49'),
(11, 8, NULL, 1, 'PENDING', 'ADMIN_BG', 'Menunggu verifikasi admin', NULL, '2026-06-02 13:15:30'),
(12, 8, 3, 1, 'APPROVED', 'ADMIN_BG', NULL, '2026-06-03 06:09:31', '2026-06-02 23:09:31');

-- --------------------------------------------------------

--
-- Table structure for table `faq`
--

CREATE TABLE `faq` (
  `id_faq` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `pertanyaan` text NOT NULL,
  `jawaban` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faq`
--

INSERT INTO `faq` (`id_faq`, `id_user`, `pertanyaan`, `jawaban`, `created_at`) VALUES
(1, 3, 'Apakah bisa bayar di tempat?', 'Bisa, pilih metode Bayar di Tempat saat checkout.', '2026-06-02 10:11:29'),
(2, 3, 'Apakah event gratis tetap punya tiket?', 'Ya, event gratis tetap menerbitkan tiket dengan harga 0.', '2026-06-02 10:11:29'),
(3, 3, 'Siapa yang memverifikasi event?', 'Event diverifikasi Admin BG atau dapat divalidasi otomatis oleh sistem.', '2026-06-02 10:11:29'),
(4, 6, 'Min tanya min Test', 'yaudah nih jawab', '2026-06-02 10:57:53');

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id_feedback` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_event` int(11) NOT NULL,
  `text` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`id_feedback`, `id_user`, `id_event`, `text`, `created_at`) VALUES
(1, 1, 1, 'Eventnya menarik dan informasinya jelas.', '2026-06-02 10:11:29'),
(2, 1, 2, 'Pengajian mudah ditemukan lewat map.', '2026-06-02 10:11:29');

-- --------------------------------------------------------

--
-- Table structure for table `kategori_tiket`
--

CREATE TABLE `kategori_tiket` (
  `id_kategori_tiket` int(11) NOT NULL,
  `nama_kategori` varchar(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kategori_tiket`
--

INSERT INTO `kategori_tiket` (`id_kategori_tiket`, `nama_kategori`) VALUES
(4, 'Donasi'),
(1, 'Gratis'),
(2, 'Reguler'),
(6, 'Umum'),
(3, 'VIP'),
(5, 'Warga Desa');

-- --------------------------------------------------------

--
-- Table structure for table `laporan_event`
--

CREATE TABLE `laporan_event` (
  `id_laporan` int(11) NOT NULL,
  `id_event` int(11) NOT NULL,
  `jumlah_peserta` int(11) NOT NULL DEFAULT 0,
  `jumlah_tiket_terjual` int(11) NOT NULL DEFAULT 0,
  `total_pendapatan` decimal(12,2) NOT NULL DEFAULT 0.00,
  `catatan_laporan` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `laporan_event`
--

INSERT INTO `laporan_event` (`id_laporan`, `id_event`, `jumlah_peserta`, `jumlah_tiket_terjual`, `total_pendapatan`, `catatan_laporan`, `created_at`) VALUES
(1, 1, 0, 0, 0.00, 'Laporan awal event', '2026-06-02 10:11:29'),
(2, 2, 0, 0, 0.00, 'Laporan awal pengajian', '2026-06-02 10:11:29');

-- --------------------------------------------------------

--
-- Table structure for table `lokasi_pin`
--

CREATE TABLE `lokasi_pin` (
  `id_lokasi` int(11) NOT NULL,
  `nama_tempat` varchar(160) NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `alamat` text DEFAULT NULL,
  `icon` varchar(80) DEFAULT NULL,
  `map_popup_title` varchar(160) DEFAULT NULL,
  `map_popup_desc` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lokasi_pin`
--

INSERT INTO `lokasi_pin` (`id_lokasi`, `nama_tempat`, `latitude`, `longitude`, `alamat`, `icon`, `map_popup_title`, `map_popup_desc`) VALUES
(1, 'Lapangan Desa Sukamaju', -6.9174640, 107.6191230, 'Lapangan utama Desa Sukamaju', 'pin-event', 'Event di Lapangan Desa', 'Kegiatan utama berada di area lapangan desa.'),
(2, 'Balai Desa Sukamaju', -6.9181110, 107.6202220, 'Balai Desa Sukamaju', 'pin-balai', 'Balai Desa', 'Lokasi acara administratif dan musyawarah.'),
(3, 'Aula RW 02', -6.9169870, 107.6210000, 'Aula RW 02 Sukamaju', 'pin-aula', 'Aula RW 02', 'Lokasi acara warga RW 02.');

-- --------------------------------------------------------

--
-- Table structure for table `organizer_profiles`
--

CREATE TABLE `organizer_profiles` (
  `id_organizer_profile` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `nama_bank` varchar(120) DEFAULT NULL,
  `no_rekening` varchar(80) DEFAULT NULL,
  `nama_pemilik_rekening` varchar(160) DEFAULT NULL,
  `status_profile` enum('DRAFT','VERIFIED','REJECTED') NOT NULL DEFAULT 'DRAFT'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `organizer_profiles`
--

INSERT INTO `organizer_profiles` (`id_organizer_profile`, `id_user`, `nama_bank`, `no_rekening`, `nama_pemilik_rekening`, `status_profile`) VALUES
(1, 2, 'BCA', '1234567890', 'Rafi Organizer', 'VERIFIED'),
(2, 5, NULL, NULL, NULL, 'DRAFT');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id_payment` int(11) NOT NULL,
  `id_transaksi` int(11) NOT NULL,
  `id_payment_method` int(11) NOT NULL,
  `tanggal_payment` datetime DEFAULT current_timestamp(),
  `jumlah_bayar` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status_payment` enum('PENDING','PAID','FAILED','EXPIRED','COD_PENDING','COD_PAID') NOT NULL DEFAULT 'PENDING',
  `bukti_bayar` varchar(255) DEFAULT NULL,
  `kode_pembayaran` varchar(80) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id_payment`, `id_transaksi`, `id_payment_method`, `tanggal_payment`, `jumlah_bayar`, `status_payment`, `bukti_bayar`, `kode_pembayaran`) VALUES
(1, 1, 1, '2026-06-02 18:05:20', 10000.00, 'PENDING', NULL, 'PAY-BD47F1BA'),
(2, 2, 1, '2026-06-02 18:22:06', 20000.00, 'PENDING', NULL, 'PAY-BE1031BE'),
(3, 3, 1, '2026-06-02 18:29:09', 0.00, 'PAID', NULL, 'PAY-9D7CD3AE'),
(4, 4, 1, '2026-06-02 19:36:21', 75000.00, 'PENDING', NULL, 'PAY-AE34B0CB'),
(5, 5, 2, '2026-06-02 20:16:06', 0.00, 'PAID', NULL, 'PAY-392F6741'),
(6, 6, 1, '2026-06-02 20:16:11', 0.00, 'PAID', NULL, 'PAY-7203D4BD');

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id_payment_method` int(11) NOT NULL,
  `nama_metode` varchar(120) NOT NULL,
  `tipe_metode` enum('MBANKING','QRIS','COD') NOT NULL,
  `status_metode` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`id_payment_method`, `nama_metode`, `tipe_metode`, `status_metode`) VALUES
(1, 'QRIS', 'QRIS', 'ACTIVE'),
(2, 'BCA Mobile Banking', 'MBANKING', 'ACTIVE'),
(3, 'Bayar di Tempat', 'COD', 'ACTIVE'),
(4, 'Mandiri Mobile Banking', 'MBANKING', 'ACTIVE');

-- --------------------------------------------------------

--
-- Table structure for table `produk_event`
--

CREATE TABLE `produk_event` (
  `id_produk` int(11) NOT NULL,
  `id_event` int(11) NOT NULL,
  `nama_produk` varchar(160) NOT NULL,
  `harga_produk` decimal(12,2) NOT NULL DEFAULT 0.00,
  `stok` int(11) NOT NULL DEFAULT 0,
  `deskripsi` text DEFAULT NULL,
  `gambar_produk` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `produk_event`
--

INSERT INTO `produk_event` (`id_produk`, `id_event`, `nama_produk`, `harga_produk`, `stok`, `deskripsi`, `gambar_produk`) VALUES
(1, 1, 'Kaos 17 Agustus', 65000.00, 100, 'Kaos edisi kemerdekaan', '/assets/17 agus.jpg'),
(2, 1, 'Kupon Makanan', 15000.00, 200, 'Kupon jajanan bazar', '/assets/dangdut.jpg'),
(3, 4, 'Paket UMKM', 30000.00, 150, 'Produk campuran UMKM desa', '/assets/pengertian-seni-rupa-murni-beserta-contohnya.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id_rating` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_event` int(11) NOT NULL,
  `rate` tinyint(4) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ratings`
--

INSERT INTO `ratings` (`id_rating`, `id_user`, `id_event`, `rate`, `created_at`) VALUES
(1, 1, 1, 5, '2026-06-02 10:11:29'),
(2, 1, 2, 5, '2026-06-02 10:11:29');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id_role` int(11) NOT NULL,
  `nama_role` enum('USER','PENYELENGGARA','ADMIN_BG','ADMIN_SYSTEM') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id_role`, `nama_role`) VALUES
(1, 'USER'),
(2, 'PENYELENGGARA'),
(3, 'ADMIN_BG'),
(4, 'ADMIN_SYSTEM');

-- --------------------------------------------------------

--
-- Table structure for table `statistik`
--

CREATE TABLE `statistik` (
  `id_stats` int(11) NOT NULL,
  `id_event` int(11) NOT NULL,
  `view_count` int(11) NOT NULL DEFAULT 0,
  `like_count` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `statistik`
--

INSERT INTO `statistik` (`id_stats`, `id_event`, `view_count`, `like_count`) VALUES
(1, 1, 250, 80),
(2, 2, 120, 40),
(3, 3, 90, 22),
(4, 4, 35, 10),
(5, 5, 0, 0),
(6, 6, 0, 0),
(7, 7, 0, 0),
(8, 8, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `tiket`
--

CREATE TABLE `tiket` (
  `id_tiket` int(11) NOT NULL,
  `id_event` int(11) NOT NULL,
  `id_kategori_tiket` int(11) NOT NULL,
  `nama_tiket` varchar(120) NOT NULL,
  `harga_tiket` decimal(12,2) NOT NULL DEFAULT 0.00,
  `jenis_tiket` enum('GRATIS','BERBAYAR','DONASI') NOT NULL DEFAULT 'GRATIS',
  `qty` int(11) NOT NULL DEFAULT 0,
  `tanggal_exp` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tiket`
--

INSERT INTO `tiket` (`id_tiket`, `id_event`, `id_kategori_tiket`, `nama_tiket`, `harga_tiket`, `jenis_tiket`, `qty`, `tanggal_exp`) VALUES
(1, 1, 2, 'Reguler Festival', 25000.00, 'BERBAYAR', 250, '2026-08-17'),
(2, 1, 3, 'VIP Festival', 75000.00, 'BERBAYAR', 49, '2026-08-17'),
(3, 2, 1, 'Tiket Pengajian Gratis', 0.00, 'GRATIS', 300, '2026-06-14'),
(4, 3, 1, 'Tiket Kerja Bakti', 0.00, 'GRATIS', 199, '2026-06-21'),
(5, 4, 6, 'Tiket Bazar Umum', 10000.00, 'BERBAYAR', 397, '2026-07-05'),
(6, 5, 1, 'Reguler', 0.00, 'GRATIS', 90, '2026-06-05'),
(7, 6, 1, 'Reguler', 0.00, 'GRATIS', 67, '2026-06-20'),
(8, 7, 1, 'Reguler', 50000.00, 'BERBAYAR', 100, '2026-08-01'),
(9, 8, 1, 'Reguler', 50003.00, 'BERBAYAR', 100, '2026-08-01');

-- --------------------------------------------------------

--
-- Table structure for table `tiket_user`
--

CREATE TABLE `tiket_user` (
  `id_tiket_user` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_tiket` int(11) NOT NULL,
  `id_transaksi` int(11) NOT NULL,
  `kode_tiket` varchar(120) NOT NULL,
  `qr_code` varchar(255) DEFAULT NULL,
  `status_tiket` enum('BELUM_BAYAR','BAYAR_DI_TEMPAT','VALID','USED','CANCELLED') NOT NULL DEFAULT 'BELUM_BAYAR',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tiket_user`
--

INSERT INTO `tiket_user` (`id_tiket_user`, `id_user`, `id_tiket`, `id_transaksi`, `kode_tiket`, `qr_code`, `status_tiket`, `created_at`) VALUES
(1, 6, 5, 1, 'TV-65E32A06-1', 'TV-65E32A06-1', 'BELUM_BAYAR', '2026-06-02 11:05:20'),
(2, 8, 5, 2, 'TV-1871675C-1', 'TV-1871675C-1', 'BELUM_BAYAR', '2026-06-02 11:22:06'),
(3, 8, 5, 2, 'TV-1871675C-2', 'TV-1871675C-2', 'BELUM_BAYAR', '2026-06-02 11:22:06'),
(4, 8, 4, 3, 'TV-08AE1484-1', 'TV-08AE1484-1', 'VALID', '2026-06-02 11:29:09'),
(5, 5, 2, 4, 'TV-582C43B2-1', 'TV-582C43B2-1', 'BELUM_BAYAR', '2026-06-02 12:36:21'),
(6, 8, 6, 5, 'TV-9CB95C01-1', 'TV-9CB95C01-1', 'VALID', '2026-06-02 13:16:06'),
(7, 8, 6, 5, 'TV-9CB95C01-2', 'TV-9CB95C01-2', 'VALID', '2026-06-02 13:16:06'),
(8, 8, 6, 6, 'TV-8C6F6217-1', 'TV-8C6F6217-1', 'VALID', '2026-06-02 13:16:11'),
(9, 8, 6, 6, 'TV-8C6F6217-2', 'TV-8C6F6217-2', 'VALID', '2026-06-02 13:16:11'),
(10, 8, 6, 6, 'TV-8C6F6217-3', 'TV-8C6F6217-3', 'VALID', '2026-06-02 13:16:11'),
(11, 8, 6, 6, 'TV-8C6F6217-4', 'TV-8C6F6217-4', 'VALID', '2026-06-02 13:16:11'),
(12, 8, 6, 6, 'TV-8C6F6217-5', 'TV-8C6F6217-5', 'VALID', '2026-06-02 13:16:11'),
(13, 8, 6, 6, 'TV-8C6F6217-6', 'TV-8C6F6217-6', 'VALID', '2026-06-02 13:16:11'),
(14, 8, 6, 6, 'TV-8C6F6217-7', 'TV-8C6F6217-7', 'VALID', '2026-06-02 13:16:11'),
(15, 8, 6, 6, 'TV-8C6F6217-8', 'TV-8C6F6217-8', 'VALID', '2026-06-02 13:16:11');

-- --------------------------------------------------------

--
-- Table structure for table `transaksi`
--

CREATE TABLE `transaksi` (
  `id_transaksi` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `tanggal_transaksi` datetime NOT NULL DEFAULT current_timestamp(),
  `status_pembayaran` enum('PENDING','PAID','FAILED','EXPIRED','COD_PENDING','COD_PAID','GRATIS') NOT NULL DEFAULT 'PENDING',
  `diskon` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_harga` decimal(12,2) NOT NULL DEFAULT 0.00,
  `is_paid` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transaksi`
--

INSERT INTO `transaksi` (`id_transaksi`, `id_user`, `tanggal_transaksi`, `status_pembayaran`, `diskon`, `total_harga`, `is_paid`) VALUES
(1, 6, '2026-06-02 18:05:20', 'PENDING', 0.00, 10000.00, 0),
(2, 8, '2026-06-02 18:22:06', 'PENDING', 0.00, 20000.00, 0),
(3, 8, '2026-06-02 18:29:09', 'GRATIS', 0.00, 0.00, 1),
(4, 5, '2026-06-02 19:36:21', 'PENDING', 0.00, 75000.00, 0),
(5, 8, '2026-06-02 20:16:06', 'GRATIS', 0.00, 0.00, 1),
(6, 8, '2026-06-02 20:16:11', 'GRATIS', 0.00, 0.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `id_role` int(11) NOT NULL,
  `id_desa` int(11) NOT NULL,
  `nama_awal` varchar(80) NOT NULL,
  `nama_akhir` varchar(80) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `alamat` text DEFAULT NULL,
  `rt` varchar(10) DEFAULT NULL,
  `rw` varchar(10) DEFAULT NULL,
  `api_token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_user`, `id_role`, `id_desa`, `nama_awal`, `nama_akhir`, `email`, `password`, `alamat`, `rt`, `rw`, `api_token`, `created_at`) VALUES
(1, 1, 1, 'Naufal', 'User', 'user@village.test', '$2y$12$zySAOu97luo8jDEIwAklye013TElYjql7SI66.qUDbnF8GjkoizHG', 'Jl. Warga 1', '01', '02', NULL, '2026-06-02 10:11:29'),
(2, 2, 1, 'Rafi', 'Organizer', 'organizer@village.test', '$2y$12$zySAOu97luo8jDEIwAklye013TElYjql7SI66.qUDbnF8GjkoizHG', 'Jl. Panitia 2', '02', '02', NULL, '2026-06-02 10:11:29'),
(3, 3, 1, 'Admin', 'BG', 'admin@village.test', '$2y$12$zySAOu97luo8jDEIwAklye013TElYjql7SI66.qUDbnF8GjkoizHG', 'Kantor Admin', '00', '00', 'ec26fd68127a0be43ecc17e30d3dd606c09caeaef00b76f71ceb81af0a1027ef', '2026-06-02 10:11:29'),
(4, 4, 1, 'System', 'Admin', 'system@village.test', '$2y$12$zySAOu97luo8jDEIwAklye013TElYjql7SI66.qUDbnF8GjkoizHG', 'Server', '00', '00', NULL, '2026-06-02 10:11:29'),
(5, 2, 1, 'Naufal', 'Rafif', 'odri.naufal@gmail.com', '$2y$10$IY9fL6iC/zQ1wLnNJyao..CjsW0PDineskVZSrf2bvFoXIjiK9sAy', '', '', '', '8e8f36f09b3d84ce164f49a886d090093c2515664a2617101b6b6a7542ff9019', '2026-06-02 10:20:56'),
(6, 1, 1, 'odri', 'rafif', 'user@gmail.com', '$2y$10$DQPKQyE/ogKETB5ihYb3rO5J/yXO0EePVJQxEeDQOttMf81hRKbgO', '', '', '', 'e7ecae978386028b8cb94d3fe80cdbdbe70067e3bac008c92e755b9ba204e4f5', '2026-06-02 10:56:57'),
(8, 1, 1, 'remi', 'akhi', 'user@test.test', '$2y$10$aaCbk/QSrcdPQP8N1ymVTeLUYxNslDQ0pW.JGeZxYtaeGLBd5nNKO', '', '', '', '3e8689e8102eb6c2ae6ccbc00716916386f196080c7bb2d0344f0a973da97cb9', '2026-06-02 11:21:37');

-- --------------------------------------------------------

--
-- Table structure for table `user_phones`
--

CREATE TABLE `user_phones` (
  `id_user_phone` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `no_hp` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_phones`
--

INSERT INTO `user_phones` (`id_user_phone`, `id_user`, `no_hp`) VALUES
(1, 1, '081111111111'),
(2, 2, '082222222222'),
(3, 3, '083333333333');

-- --------------------------------------------------------

--
-- Table structure for table `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
  `id_wallet_transaction` int(11) NOT NULL,
  `id_dompet` int(11) NOT NULL,
  `id_payment` int(11) DEFAULT NULL,
  `tipe_transaksi` enum('INCOME','WITHDRAW','REFUND') NOT NULL,
  `jumlah` decimal(12,2) NOT NULL DEFAULT 0.00,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auto_validation_rules`
--
ALTER TABLE `auto_validation_rules`
  ADD PRIMARY KEY (`id_rule`);

--
-- Indexes for table `cctv`
--
ALTER TABLE `cctv`
  ADD PRIMARY KEY (`id_cctv`),
  ADD KEY `fk_cctv_events` (`id_event`);

--
-- Indexes for table `desa`
--
ALTER TABLE `desa`
  ADD PRIMARY KEY (`id_desa`);

--
-- Indexes for table `detail_transaksi`
--
ALTER TABLE `detail_transaksi`
  ADD PRIMARY KEY (`id_detail`),
  ADD KEY `fk_detail_transaksi_transaksi` (`id_transaksi`),
  ADD KEY `fk_detail_transaksi_tiket` (`id_tiket`),
  ADD KEY `fk_detail_transaksi_produk` (`id_produk`);

--
-- Indexes for table `dompet`
--
ALTER TABLE `dompet`
  ADD PRIMARY KEY (`id_dompet`),
  ADD UNIQUE KEY `id_user` (`id_user`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id_event`),
  ADD KEY `fk_events_desa` (`id_desa`),
  ADD KEY `fk_events_category` (`id_category`),
  ADD KEY `fk_events_lokasi` (`id_lokasi`);

--
-- Indexes for table `event_categories`
--
ALTER TABLE `event_categories`
  ADD PRIMARY KEY (`id_category`),
  ADD UNIQUE KEY `nama_category` (`nama_category`);

--
-- Indexes for table `event_images`
--
ALTER TABLE `event_images`
  ADD PRIMARY KEY (`id_event_image`),
  ADD KEY `fk_event_images_events` (`id_event`);

--
-- Indexes for table `event_organizers`
--
ALTER TABLE `event_organizers`
  ADD PRIMARY KEY (`id_event_organizer`),
  ADD UNIQUE KEY `unique_event_member` (`id_user`,`id_event`),
  ADD KEY `fk_event_organizers_events` (`id_event`);

--
-- Indexes for table `event_verifications`
--
ALTER TABLE `event_verifications`
  ADD PRIMARY KEY (`id_verif`),
  ADD KEY `fk_event_verif_events` (`id_event`),
  ADD KEY `fk_event_verif_users` (`id_user`),
  ADD KEY `fk_event_verif_rules` (`id_rule`);

--
-- Indexes for table `faq`
--
ALTER TABLE `faq`
  ADD PRIMARY KEY (`id_faq`),
  ADD KEY `fk_faq_users` (`id_user`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id_feedback`),
  ADD KEY `fk_feedback_users` (`id_user`),
  ADD KEY `fk_feedback_events` (`id_event`);

--
-- Indexes for table `kategori_tiket`
--
ALTER TABLE `kategori_tiket`
  ADD PRIMARY KEY (`id_kategori_tiket`),
  ADD UNIQUE KEY `nama_kategori` (`nama_kategori`);

--
-- Indexes for table `laporan_event`
--
ALTER TABLE `laporan_event`
  ADD PRIMARY KEY (`id_laporan`),
  ADD KEY `fk_laporan_event_events` (`id_event`);

--
-- Indexes for table `lokasi_pin`
--
ALTER TABLE `lokasi_pin`
  ADD PRIMARY KEY (`id_lokasi`);

--
-- Indexes for table `organizer_profiles`
--
ALTER TABLE `organizer_profiles`
  ADD PRIMARY KEY (`id_organizer_profile`),
  ADD UNIQUE KEY `id_user` (`id_user`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id_payment`),
  ADD UNIQUE KEY `id_transaksi` (`id_transaksi`),
  ADD UNIQUE KEY `kode_pembayaran` (`kode_pembayaran`),
  ADD KEY `fk_payments_method` (`id_payment_method`);

--
-- Indexes for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`id_payment_method`);

--
-- Indexes for table `produk_event`
--
ALTER TABLE `produk_event`
  ADD PRIMARY KEY (`id_produk`),
  ADD KEY `fk_produk_event_events` (`id_event`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id_rating`),
  ADD UNIQUE KEY `unique_user_event_rating` (`id_user`,`id_event`),
  ADD KEY `fk_ratings_events` (`id_event`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_role`),
  ADD UNIQUE KEY `nama_role` (`nama_role`);

--
-- Indexes for table `statistik`
--
ALTER TABLE `statistik`
  ADD PRIMARY KEY (`id_stats`),
  ADD UNIQUE KEY `id_event` (`id_event`);

--
-- Indexes for table `tiket`
--
ALTER TABLE `tiket`
  ADD PRIMARY KEY (`id_tiket`),
  ADD KEY `fk_tiket_events` (`id_event`),
  ADD KEY `fk_tiket_kategori` (`id_kategori_tiket`);

--
-- Indexes for table `tiket_user`
--
ALTER TABLE `tiket_user`
  ADD PRIMARY KEY (`id_tiket_user`),
  ADD UNIQUE KEY `kode_tiket` (`kode_tiket`),
  ADD KEY `fk_tiket_user_users` (`id_user`),
  ADD KEY `fk_tiket_user_tiket` (`id_tiket`),
  ADD KEY `fk_tiket_user_transaksi` (`id_transaksi`);

--
-- Indexes for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD PRIMARY KEY (`id_transaksi`),
  ADD KEY `fk_transaksi_users` (`id_user`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `api_token` (`api_token`),
  ADD KEY `fk_users_roles` (`id_role`),
  ADD KEY `fk_users_desa` (`id_desa`);

--
-- Indexes for table `user_phones`
--
ALTER TABLE `user_phones`
  ADD PRIMARY KEY (`id_user_phone`),
  ADD KEY `fk_user_phones_users` (`id_user`);

--
-- Indexes for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD PRIMARY KEY (`id_wallet_transaction`),
  ADD UNIQUE KEY `id_payment` (`id_payment`),
  ADD KEY `fk_wallet_dompet` (`id_dompet`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `auto_validation_rules`
--
ALTER TABLE `auto_validation_rules`
  MODIFY `id_rule` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `cctv`
--
ALTER TABLE `cctv`
  MODIFY `id_cctv` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `desa`
--
ALTER TABLE `desa`
  MODIFY `id_desa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `detail_transaksi`
--
ALTER TABLE `detail_transaksi`
  MODIFY `id_detail` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `dompet`
--
ALTER TABLE `dompet`
  MODIFY `id_dompet` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id_event` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `event_categories`
--
ALTER TABLE `event_categories`
  MODIFY `id_category` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `event_images`
--
ALTER TABLE `event_images`
  MODIFY `id_event_image` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `event_organizers`
--
ALTER TABLE `event_organizers`
  MODIFY `id_event_organizer` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `event_verifications`
--
ALTER TABLE `event_verifications`
  MODIFY `id_verif` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `faq`
--
ALTER TABLE `faq`
  MODIFY `id_faq` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `id_feedback` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `kategori_tiket`
--
ALTER TABLE `kategori_tiket`
  MODIFY `id_kategori_tiket` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `laporan_event`
--
ALTER TABLE `laporan_event`
  MODIFY `id_laporan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `lokasi_pin`
--
ALTER TABLE `lokasi_pin`
  MODIFY `id_lokasi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `organizer_profiles`
--
ALTER TABLE `organizer_profiles`
  MODIFY `id_organizer_profile` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id_payment` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id_payment_method` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `produk_event`
--
ALTER TABLE `produk_event`
  MODIFY `id_produk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id_rating` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id_role` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `statistik`
--
ALTER TABLE `statistik`
  MODIFY `id_stats` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tiket`
--
ALTER TABLE `tiket`
  MODIFY `id_tiket` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `tiket_user`
--
ALTER TABLE `tiket_user`
  MODIFY `id_tiket_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `transaksi`
--
ALTER TABLE `transaksi`
  MODIFY `id_transaksi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `user_phones`
--
ALTER TABLE `user_phones`
  MODIFY `id_user_phone` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  MODIFY `id_wallet_transaction` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cctv`
--
ALTER TABLE `cctv`
  ADD CONSTRAINT `fk_cctv_events` FOREIGN KEY (`id_event`) REFERENCES `events` (`id_event`) ON DELETE CASCADE;

--
-- Constraints for table `detail_transaksi`
--
ALTER TABLE `detail_transaksi`
  ADD CONSTRAINT `fk_detail_transaksi_produk` FOREIGN KEY (`id_produk`) REFERENCES `produk_event` (`id_produk`),
  ADD CONSTRAINT `fk_detail_transaksi_tiket` FOREIGN KEY (`id_tiket`) REFERENCES `tiket` (`id_tiket`),
  ADD CONSTRAINT `fk_detail_transaksi_transaksi` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi` (`id_transaksi`) ON DELETE CASCADE;

--
-- Constraints for table `dompet`
--
ALTER TABLE `dompet`
  ADD CONSTRAINT `fk_dompet_users` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `fk_events_category` FOREIGN KEY (`id_category`) REFERENCES `event_categories` (`id_category`),
  ADD CONSTRAINT `fk_events_desa` FOREIGN KEY (`id_desa`) REFERENCES `desa` (`id_desa`),
  ADD CONSTRAINT `fk_events_lokasi` FOREIGN KEY (`id_lokasi`) REFERENCES `lokasi_pin` (`id_lokasi`);

--
-- Constraints for table `event_images`
--
ALTER TABLE `event_images`
  ADD CONSTRAINT `fk_event_images_events` FOREIGN KEY (`id_event`) REFERENCES `events` (`id_event`) ON DELETE CASCADE;

--
-- Constraints for table `event_organizers`
--
ALTER TABLE `event_organizers`
  ADD CONSTRAINT `fk_event_organizers_events` FOREIGN KEY (`id_event`) REFERENCES `events` (`id_event`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_event_organizers_users` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `event_verifications`
--
ALTER TABLE `event_verifications`
  ADD CONSTRAINT `fk_event_verif_events` FOREIGN KEY (`id_event`) REFERENCES `events` (`id_event`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_event_verif_rules` FOREIGN KEY (`id_rule`) REFERENCES `auto_validation_rules` (`id_rule`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_event_verif_users` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL;

--
-- Constraints for table `faq`
--
ALTER TABLE `faq`
  ADD CONSTRAINT `fk_faq_users` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL;

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `fk_feedback_events` FOREIGN KEY (`id_event`) REFERENCES `events` (`id_event`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_feedback_users` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `laporan_event`
--
ALTER TABLE `laporan_event`
  ADD CONSTRAINT `fk_laporan_event_events` FOREIGN KEY (`id_event`) REFERENCES `events` (`id_event`) ON DELETE CASCADE;

--
-- Constraints for table `organizer_profiles`
--
ALTER TABLE `organizer_profiles`
  ADD CONSTRAINT `fk_organizer_profiles_users` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_method` FOREIGN KEY (`id_payment_method`) REFERENCES `payment_methods` (`id_payment_method`),
  ADD CONSTRAINT `fk_payments_transaksi` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi` (`id_transaksi`) ON DELETE CASCADE;

--
-- Constraints for table `produk_event`
--
ALTER TABLE `produk_event`
  ADD CONSTRAINT `fk_produk_event_events` FOREIGN KEY (`id_event`) REFERENCES `events` (`id_event`) ON DELETE CASCADE;

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `fk_ratings_events` FOREIGN KEY (`id_event`) REFERENCES `events` (`id_event`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ratings_users` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `statistik`
--
ALTER TABLE `statistik`
  ADD CONSTRAINT `fk_statistik_events` FOREIGN KEY (`id_event`) REFERENCES `events` (`id_event`) ON DELETE CASCADE;

--
-- Constraints for table `tiket`
--
ALTER TABLE `tiket`
  ADD CONSTRAINT `fk_tiket_events` FOREIGN KEY (`id_event`) REFERENCES `events` (`id_event`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tiket_kategori` FOREIGN KEY (`id_kategori_tiket`) REFERENCES `kategori_tiket` (`id_kategori_tiket`);

--
-- Constraints for table `tiket_user`
--
ALTER TABLE `tiket_user`
  ADD CONSTRAINT `fk_tiket_user_tiket` FOREIGN KEY (`id_tiket`) REFERENCES `tiket` (`id_tiket`),
  ADD CONSTRAINT `fk_tiket_user_transaksi` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi` (`id_transaksi`),
  ADD CONSTRAINT `fk_tiket_user_users` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`);

--
-- Constraints for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD CONSTRAINT `fk_transaksi_users` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_desa` FOREIGN KEY (`id_desa`) REFERENCES `desa` (`id_desa`),
  ADD CONSTRAINT `fk_users_roles` FOREIGN KEY (`id_role`) REFERENCES `roles` (`id_role`);

--
-- Constraints for table `user_phones`
--
ALTER TABLE `user_phones`
  ADD CONSTRAINT `fk_user_phones_users` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD CONSTRAINT `fk_wallet_dompet` FOREIGN KEY (`id_dompet`) REFERENCES `dompet` (`id_dompet`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_wallet_payments` FOREIGN KEY (`id_payment`) REFERENCES `payments` (`id_payment`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
-- --------------------------------------------------------
-- Tambahan data agar pilihan kota di UI mengambil data dari database
-- --------------------------------------------------------
INSERT IGNORE INTO `desa` (`id_desa`, `nama_desa`, `kecamatan`, `kabupaten`, `provinsi`, `alamat_desa`) VALUES
(4, 'Desa Menteng Jaya', 'Menteng', 'Jakarta', 'DKI Jakarta', 'Jl. Menteng Raya No. 10'),
(5, 'Desa Bogor Indah', 'Bogor Tengah', 'Bogor', 'Jawa Barat', 'Jl. Pajajaran No. 15'),
(6, 'Desa Tangerang Maju', 'Tangerang', 'Tangerang', 'Banten', 'Jl. Kisamaun No. 20');

INSERT IGNORE INTO `lokasi_pin` (`id_lokasi`, `nama_tempat`, `latitude`, `longitude`, `alamat`, `icon`, `map_popup_title`, `map_popup_desc`) VALUES
(4, 'Balai Warga Menteng Jaya', -6.1944491, 106.8229198, 'Balai warga Menteng Jaya, Jakarta', 'pin-balai', 'Balai Warga Jakarta', 'Lokasi kegiatan warga di Jakarta.'),
(5, 'Taman Bogor Indah', -6.5950380, 106.8166350, 'Area taman warga Bogor Indah', 'pin-event', 'Taman Warga Bogor', 'Lokasi kegiatan luar ruang warga Bogor.'),
(6, 'Aula Tangerang Maju', -6.1783060, 106.6318890, 'Aula warga Tangerang Maju', 'pin-aula', 'Aula Warga Tangerang', 'Lokasi acara warga Tangerang.');

ALTER TABLE `desa` AUTO_INCREMENT = 7;
ALTER TABLE `lokasi_pin` AUTO_INCREMENT = 7;
