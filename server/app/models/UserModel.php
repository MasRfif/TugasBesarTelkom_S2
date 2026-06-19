<?php
class UserModel extends BaseModel {
    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare('SELECT u.*, r.nama_role, d.nama_desa, d.kabupaten
                                    FROM users u
                                    JOIN roles r ON u.id_role = r.id_role
                                    LEFT JOIN desa d ON u.id_desa = d.id_desa
                                    WHERE u.email = ?');
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }

    public function findByToken(string $token): ?array {
        $stmt = $this->db->prepare('SELECT u.*, r.nama_role, d.nama_desa, d.kabupaten
                                    FROM users u
                                    JOIN roles r ON u.id_role = r.id_role
                                    LEFT JOIN desa d ON u.id_desa = d.id_desa
                                    WHERE u.api_token = ?');
        $stmt->execute([$token]);
        return $stmt->fetch() ?: null;
    }

    public function setToken(int $id_user, ?string $token): void {
        $stmt = $this->db->prepare('UPDATE users SET api_token = ? WHERE id_user = ?');
        $stmt->execute([$token, $id_user]);
    }

    public function roleId(string $role): ?int {
        $stmt = $this->db->prepare('SELECT id_role FROM roles WHERE nama_role = ?');
        $stmt->execute([$role]);
        $row = $stmt->fetch();
        return $row ? (int)$row['id_role'] : null;
    }

    public function create(array $data): array {
        $token = Auth::generateToken();
        $stmt = $this->db->prepare('INSERT INTO users (id_role, id_desa, nama_awal, nama_akhir, email, password, alamat, rt, rw, api_token, created_at)
                                    VALUES (?,?,?,?,?,?,?,?,?,?,NOW())');
        $stmt->execute([
            $data['id_role'], $data['id_desa'], $data['nama_awal'], $data['nama_akhir'], $data['email'],
            password_hash($data['password'], PASSWORD_DEFAULT), $data['alamat'] ?? '', $data['rt'] ?? '', $data['rw'] ?? '', $token
        ]);
        $id = (int)$this->db->lastInsertId();

        $this->db->prepare('INSERT IGNORE INTO dompet (id_user, saldo, status_dompet, created_at) VALUES (?,0,"ACTIVE",NOW())')->execute([$id]);
        if (($data['role'] ?? 'USER') === 'PENYELENGGARA') {
            $this->db->prepare('INSERT INTO organizer_profiles (id_user, status_profile) VALUES (?,"DRAFT")')->execute([$id]);
        }

        return ['id_user' => $id, 'api_token' => $token];
    }

    public function attachTeamInfo(array $user): array {
        $stmt = $this->db->prepare('SELECT eo.role_event, eo.id_event, e.nama_event
                                    FROM event_organizers eo
                                    JOIN events e ON eo.id_event = e.id_event
                                    WHERE eo.id_user = ? AND eo.status_member = "ACTIVE"
                                    ORDER BY eo.role_event = "OWNER" DESC, eo.created_at DESC LIMIT 1');
        $stmt->execute([$user['id_user']]);
        $perm = $stmt->fetch();
        if ($perm) {
            $user['team_role'] = $perm['role_event'];
            $user['team_event'] = $perm['id_event'];
            $user['team_event_name'] = $perm['nama_event'];
            $user['can_open_organizer'] = true;
        }
        return $user;
    }

    public function myTickets(int $id_user): array {
        $stmt = $this->db->prepare('SELECT tu.*, t.nama_tiket, t.harga_tiket, kt.nama_kategori, e.nama_event, e.tanggal_mulai,
                                           lp.nama_tempat, d.nama_desa
                                    FROM tiket_user tu
                                    JOIN tiket t ON tu.id_tiket = t.id_tiket
                                    LEFT JOIN kategori_tiket kt ON t.id_kategori_tiket = kt.id_kategori_tiket
                                    JOIN events e ON t.id_event = e.id_event
                                    LEFT JOIN lokasi_pin lp ON e.id_lokasi = lp.id_lokasi
                                    LEFT JOIN desa d ON e.id_desa = d.id_desa
                                    WHERE tu.id_user = ?
                                    ORDER BY tu.created_at DESC');
        $stmt->execute([$id_user]);
        return $stmt->fetchAll();
    }

    public function myTransactions(int $id_user): array {
        $stmt = $this->db->prepare('SELECT tr.*, p.status_payment, p.kode_pembayaran, pm.nama_metode
                                    FROM transaksi tr
                                    LEFT JOIN payments p ON p.id_transaksi = tr.id_transaksi
                                    LEFT JOIN payment_methods pm ON p.id_payment_method = pm.id_payment_method
                                    WHERE tr.id_user = ?
                                    ORDER BY tr.tanggal_transaksi DESC');
        $stmt->execute([$id_user]);
        return $stmt->fetchAll();
    }


    public function transactionDetail(int $id_user, int $id_transaksi): ?array {
        $stmt = $this->db->prepare('SELECT tr.*, p.status_payment, p.kode_pembayaran, p.jumlah_bayar, pm.nama_metode, pm.tipe_metode,
                                           dt.jumlah, dt.subtotal, t.nama_tiket, t.harga_tiket, e.nama_event, e.tanggal_mulai,
                                           CONCAT(u.nama_awal," ",COALESCE(u.nama_akhir,"")) AS nama_user
                                    FROM transaksi tr
                                    LEFT JOIN payments p ON p.id_transaksi = tr.id_transaksi
                                    LEFT JOIN payment_methods pm ON p.id_payment_method = pm.id_payment_method
                                    LEFT JOIN detail_transaksi dt ON dt.id_transaksi = tr.id_transaksi
                                    LEFT JOIN tiket t ON dt.id_tiket = t.id_tiket
                                    LEFT JOIN events e ON t.id_event = e.id_event
                                    LEFT JOIN users u ON tr.id_user = u.id_user
                                    WHERE tr.id_user = ? AND tr.id_transaksi = ?
                                    LIMIT 1');
        $stmt->execute([$id_user, $id_transaksi]);
        return $stmt->fetch() ?: null;
    }

    public function checkout(int $id_user, int $id_tiket, int $jumlah, int $id_payment_method): array {
        $stmt = $this->db->prepare('SELECT t.*, e.nama_event FROM tiket t JOIN events e ON t.id_event=e.id_event WHERE t.id_tiket=? FOR UPDATE');
        $this->db->beginTransaction();
        try {
            $stmt->execute([$id_tiket]);
            $tiket = $stmt->fetch();
            if (!$tiket) throw new Exception('Tiket tidak ditemukan');
            if ((int)$tiket['qty'] < $jumlah) throw new Exception('Stok tiket tidak cukup');

            $pm = $this->db->prepare('SELECT * FROM payment_methods WHERE id_payment_method=? AND status_metode="ACTIVE"');
            $pm->execute([$id_payment_method]);
            $method = $pm->fetch();
            if (!$method) throw new Exception('Metode pembayaran tidak tersedia');

            $total = (float)$tiket['harga_tiket'] * $jumlah;
            if ($total <= 0) {
                $status_trx = 'GRATIS';
                $status_payment = 'PAID';
                $status_tiket = 'VALID';
                $is_paid = 1;
            } elseif ($method['tipe_metode'] === 'COD') {
                $status_trx = 'COD_PENDING';
                $status_payment = 'COD_PENDING';
                $status_tiket = 'BAYAR_DI_TEMPAT';
                $is_paid = 0;
            } else {
                $status_trx = 'PENDING';
                $status_payment = 'PENDING';
                $status_tiket = 'BELUM_BAYAR';
                $is_paid = 0;
            }

            $this->db->prepare('INSERT INTO transaksi (id_user, tanggal_transaksi, status_pembayaran, diskon, total_harga, is_paid)
                                VALUES (?,NOW(),?,0,?,?)')->execute([$id_user, $status_trx, $total, $is_paid]);
            $id_trx = (int)$this->db->lastInsertId();

            $this->db->prepare('INSERT INTO detail_transaksi (id_transaksi, id_tiket, id_produk, jumlah, subtotal) VALUES (?,?,NULL,?,?)')
                     ->execute([$id_trx, $id_tiket, $jumlah, $total]);

            $kodeBayar = 'PAY-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
            $this->db->prepare('INSERT INTO payments (id_transaksi, id_payment_method, tanggal_payment, jumlah_bayar, status_payment, kode_pembayaran)
                                VALUES (?,?,NOW(),?,?,?)')->execute([$id_trx, $id_payment_method, $total, $status_payment, $kodeBayar]);

            $prefix = 'TV-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
            for ($i=1; $i <= $jumlah; $i++) {
                $kodeTiket = $prefix . '-' . $i;
                $this->db->prepare('INSERT INTO tiket_user (id_user, id_tiket, id_transaksi, kode_tiket, qr_code, status_tiket, created_at)
                                    VALUES (?,?,?,?,?,?,NOW())')->execute([$id_user, $id_tiket, $id_trx, $kodeTiket, $kodeTiket, $status_tiket]);
            }
            $this->db->prepare('UPDATE tiket SET qty = qty - ? WHERE id_tiket = ?')->execute([$jumlah, $id_tiket]);

            $this->db->commit();
            return ['id_transaksi' => $id_trx, 'status_pembayaran' => $status_trx, 'kode_pembayaran' => $kodeBayar];
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
