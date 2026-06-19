<?php
class OrganizerModel extends BaseModel {
    private function ownedEventCondition(): string {
        return 'EXISTS (SELECT 1 FROM event_organizers mine WHERE mine.id_event=e.id_event AND mine.id_user=? AND mine.status_member="ACTIVE")';
    }

    public function hasOrganizerAccess(int $id_user): bool {
        $stmt = $this->db->prepare('SELECT 1 FROM event_organizers WHERE id_user=? AND status_member="ACTIVE" LIMIT 1');
        $stmt->execute([$id_user]);
        return (bool)$stmt->fetchColumn();
    }

    public function stats(int $id_user): array {
        $s1 = $this->db->prepare('SELECT COUNT(*) FROM events e WHERE ' . $this->ownedEventCondition()); $s1->execute([$id_user]);
        $s2 = $this->db->prepare('SELECT COUNT(*) FROM events e WHERE ' . $this->ownedEventCondition() . ' AND e.status_event IN ("PUBLISHED","APPROVED","AUTO_APPROVED")'); $s2->execute([$id_user]);
        $s3 = $this->db->prepare('SELECT COUNT(DISTINCT eo.id_user) FROM event_organizers eo JOIN events e ON eo.id_event=e.id_event WHERE ' . $this->ownedEventCondition() . ' AND eo.status_member="ACTIVE"'); $s3->execute([$id_user]);
        $s4 = $this->db->prepare('SELECT COALESCE(SUM(tr.total_harga),0)
                                  FROM transaksi tr
                                  JOIN detail_transaksi dt ON tr.id_transaksi=dt.id_transaksi
                                  JOIN tiket t ON dt.id_tiket=t.id_tiket
                                  JOIN events e ON t.id_event=e.id_event
                                  WHERE ' . $this->ownedEventCondition() . ' AND tr.status_pembayaran IN ("PAID","GRATIS","COD_PAID")'); $s4->execute([$id_user]);
        return [
            'total_events' => (int)$s1->fetchColumn(),
            'published_events' => (int)$s2->fetchColumn(),
            'team_members' => (int)$s3->fetchColumn(),
            'total_income' => (float)$s4->fetchColumn(),
        ];
    }

    public function events(int $id_user): array {
        $stmt = $this->db->prepare('SELECT e.*, ec.nama_category, d.nama_desa, d.kabupaten, lp.nama_tempat,
                                           COALESCE((SELECT image_url FROM event_images ei WHERE ei.id_event=e.id_event ORDER BY id_event_image ASC LIMIT 1), "/assets/image.png") AS url_image,
                                           (SELECT MIN(harga_tiket) FROM tiket t WHERE t.id_event=e.id_event) AS harga_mulai
                                    FROM events e
                                    LEFT JOIN event_categories ec ON e.id_category=ec.id_category
                                    LEFT JOIN desa d ON e.id_desa=d.id_desa
                                    LEFT JOIN lokasi_pin lp ON e.id_lokasi=lp.id_lokasi
                                    WHERE ' . $this->ownedEventCondition() . '
                                    ORDER BY e.created_at DESC');
        $stmt->execute([$id_user]);
        return $stmt->fetchAll();
    }

    public function isOwner(int $id_user, int $id_event): bool {
        $stmt = $this->db->prepare('SELECT 1 FROM event_organizers WHERE id_user=? AND id_event=? AND role_event="OWNER" AND status_member="ACTIVE" LIMIT 1');
        $stmt->execute([$id_user, $id_event]);
        return (bool)$stmt->fetchColumn();
    }

    public function canEditContent(int $id_user, int $id_event): bool {
        $stmt = $this->db->prepare('SELECT 1 FROM event_organizers WHERE id_user=? AND id_event=? AND role_event IN ("OWNER","CONTENT_ADMIN") AND status_member="ACTIVE" LIMIT 1');
        $stmt->execute([$id_user, $id_event]);
        return (bool)$stmt->fetchColumn();
    }

    public function createEvent(int $id_user, array $body): int {
        $this->db->beginTransaction();
        try {
            $jenis = ($body['jenis_event'] ?? 'GRATIS') === 'BERBAYAR' ? 'BERBAYAR' : 'GRATIS';
            $stmt = $this->db->prepare('INSERT INTO events (id_desa, id_category, id_lokasi, nama_event, deskripsi, tanggal_mulai, tanggal_selesai, jenis_event, status_event, visibility_type, target_rt, target_rw, max_peserta, created_at)
                                        VALUES (?,?,?,?,?,?,?,?,"PENDING",?,?,?, ?, NOW())');
            $stmt->execute([
                (int)($body['id_desa'] ?? 1), (int)($body['id_category'] ?? 1), (int)($body['id_lokasi'] ?? 1), trim($body['nama_event']), $body['deskripsi'] ?? '',
                $body['tanggal_mulai'], $body['tanggal_selesai'] ?? $body['tanggal_mulai'], $jenis, $body['visibility_type'] ?? 'PUBLIC', $body['target_rt'] ?? null, $body['target_rw'] ?? null, (int)($body['max_peserta'] ?? 100)
            ]);
            $id_event = (int)$this->db->lastInsertId();
            $image = trim($body['url_image'] ?? '/assets/image.png');
            if ($image) $this->db->prepare('INSERT INTO event_images (id_event, image_url) VALUES (?,?)')->execute([$id_event, $image]);
            $this->db->prepare('INSERT INTO event_organizers (id_user, id_event, role_event, status_member, created_at) VALUES (?,? ,"OWNER","ACTIVE",NOW())')->execute([$id_user, $id_event]);
            $this->db->prepare('INSERT INTO event_verifications (id_event, id_user, id_rule, status_verif, tipe_verif, alasan, created_at) VALUES (?,NULL,1,"PENDING","ADMIN_BG","Menunggu verifikasi admin",NOW())')->execute([$id_event]);
            $this->db->prepare('INSERT INTO statistik (id_event, view_count, like_count) VALUES (?,0,0)')->execute([$id_event]);
            $this->db->prepare('INSERT INTO laporan_event (id_event, jumlah_peserta, jumlah_tiket_terjual, total_pendapatan, catatan_laporan, created_at) VALUES (?,0,0,0,"Laporan awal event",NOW())')->execute([$id_event]);

            $price = (float)($body['harga_tiket'] ?? 0);
            $idKategoriTiket = $price <= 0 ? 1 : 2;
            $jenisTiket = $price <= 0 ? 'GRATIS' : 'BERBAYAR';
            $this->db->prepare('INSERT INTO tiket (id_event, id_kategori_tiket, nama_tiket, harga_tiket, jenis_tiket, qty, tanggal_exp)
                                VALUES (?,?,?,?,?,?,?)')->execute([$id_event, $idKategoriTiket, $body['nama_tiket'] ?? 'Reguler', $price, $jenisTiket, (int)($body['qty'] ?? 100), $body['tanggal_selesai'] ?? $body['tanggal_mulai']]);
            foreach (($body['extra_tickets'] ?? []) as $t) {
                if (empty($t['nama_tiket'])) continue;
                $p = (float)($t['harga_tiket'] ?? 0);
                $this->db->prepare('INSERT INTO tiket (id_event, id_kategori_tiket, nama_tiket, harga_tiket, jenis_tiket, qty, tanggal_exp)
                                    VALUES (?,?,?,?,?,?,?)')->execute([$id_event, $p <= 0 ? 1 : 2, $t['nama_tiket'], $p, $p <= 0 ? 'GRATIS' : 'BERBAYAR', (int)($t['qty'] ?? 50), $body['tanggal_selesai'] ?? $body['tanggal_mulai']]);
            }
            $this->db->commit();
            return $id_event;
        } catch (Exception $e) { $this->db->rollBack(); throw $e; }
    }

    public function updateEvent(int $id_user, int $id_event, array $body): void {
        if (!$this->canEditContent($id_user, $id_event)) throw new Exception('Kamu tidak punya akses mengedit konten acara ini');
        $this->db->prepare('UPDATE events SET nama_event=?, id_category=?, deskripsi=?, tanggal_mulai=?, tanggal_selesai=?, jenis_event=?, max_peserta=?, id_lokasi=?, id_desa=?, status_event="PENDING" WHERE id_event=?')
                 ->execute([$body['nama_event'], (int)$body['id_category'], $body['deskripsi'] ?? '', $body['tanggal_mulai'], $body['tanggal_selesai'] ?? $body['tanggal_mulai'], $body['jenis_event'] ?? 'GRATIS', (int)($body['max_peserta'] ?? 100), (int)($body['id_lokasi'] ?? 1), (int)($body['id_desa'] ?? 1), $id_event]);
        if (!empty($body['url_image'])) {
            $check = $this->db->prepare('SELECT id_event_image FROM event_images WHERE id_event=? LIMIT 1');
            $check->execute([$id_event]);
            $row = $check->fetch();
            if ($row) $this->db->prepare('UPDATE event_images SET image_url=? WHERE id_event_image=?')->execute([$body['url_image'], $row['id_event_image']]);
            else $this->db->prepare('INSERT INTO event_images (id_event,image_url) VALUES (?,?)')->execute([$id_event, $body['url_image']]);
        }
    }

    public function deleteEvent(int $id_user, int $id_event): void {
        if (!$this->isOwner($id_user, $id_event)) throw new Exception('Kamu bukan pemilik acara ini');
        $this->db->prepare('DELETE FROM events WHERE id_event=?')->execute([$id_event]);
    }

    public function payments(int $id_user): array {
        $stmt = $this->db->prepare('SELECT tr.*, p.id_payment, p.jumlah_bayar, p.status_payment, p.tanggal_payment, p.kode_pembayaran, pm.nama_metode, e.nama_event, u.nama_awal, u.nama_akhir
                                    FROM transaksi tr
                                    JOIN detail_transaksi dt ON tr.id_transaksi=dt.id_transaksi
                                    JOIN tiket t ON dt.id_tiket=t.id_tiket
                                    JOIN events e ON t.id_event=e.id_event
                                    JOIN users u ON tr.id_user=u.id_user
                                    LEFT JOIN payments p ON p.id_transaksi=tr.id_transaksi
                                    LEFT JOIN payment_methods pm ON p.id_payment_method=pm.id_payment_method
                                    WHERE ' . $this->ownedEventCondition() . '
                                    ORDER BY tr.tanggal_transaksi DESC');
        $stmt->execute([$id_user]);
        return $stmt->fetchAll();
    }

    public function team(int $id_user): array {
        $stmt = $this->db->prepare('SELECT eo.*, u.nama_awal, u.nama_akhir, u.email, e.nama_event
                                    FROM event_organizers eo
                                    JOIN users u ON eo.id_user=u.id_user
                                    JOIN events e ON eo.id_event=e.id_event
                                    WHERE ' . $this->ownedEventCondition() . '
                                    ORDER BY eo.created_at DESC');
        $stmt->execute([$id_user]);
        return $stmt->fetchAll();
    }

    public function addTeam(int $id_user, string $email, int $id_event, string $role_event): void {
        if (!$this->isOwner($id_user, $id_event)) throw new Exception('Bukan acara milikmu');
        $u = $this->db->prepare('SELECT id_user FROM users WHERE email=?'); $u->execute([$email]); $target = $u->fetch();
        if (!$target) throw new Exception('Pengguna dengan email tersebut tidak ditemukan');
        $allowed = ['TICKET_ADMIN','PAYMENT_ADMIN','TRAFFIC_ADMIN','CONTENT_ADMIN','VIEWER'];
        if (!in_array($role_event, $allowed)) $role_event = 'VIEWER';
        $this->db->prepare('INSERT INTO event_organizers (id_user,id_event,role_event,status_member,created_at) VALUES (?,?,?,"ACTIVE",NOW())
                            ON DUPLICATE KEY UPDATE role_event=VALUES(role_event), status_member="ACTIVE"')->execute([$target['id_user'], $id_event, $role_event]);
    }

    public function updateTeam(int $id_user, int $id_event_organizer, string $role_event): void {
        $stmt = $this->db->prepare('UPDATE event_organizers eo JOIN events e ON eo.id_event=e.id_event
                                    SET eo.role_event=?
                                    WHERE eo.id_event_organizer=? AND ' . $this->ownedEventCondition());
        $stmt->execute([$role_event, $id_event_organizer, $id_user]);
    }

    public function deleteTeam(int $id_user, int $id_event_organizer): void {
        $stmt = $this->db->prepare('DELETE eo FROM event_organizers eo JOIN events e ON eo.id_event=e.id_event
                                    WHERE eo.id_event_organizer=? AND eo.role_event <> "OWNER" AND ' . $this->ownedEventCondition());
        $stmt->execute([$id_event_organizer, $id_user]);
    }

    public function tickets(int $id_user): array {
        $stmt = $this->db->prepare('SELECT tu.*, t.nama_tiket, e.nama_event, u.nama_awal, u.nama_akhir, u.email
                                    FROM tiket_user tu
                                    JOIN tiket t ON tu.id_tiket=t.id_tiket
                                    JOIN events e ON t.id_event=e.id_event
                                    JOIN users u ON tu.id_user=u.id_user
                                    WHERE ' . $this->ownedEventCondition() . '
                                    ORDER BY tu.created_at DESC');
        $stmt->execute([$id_user]);
        return $stmt->fetchAll();
    }

    public function reports(int $id_user): array {
        $stmt = $this->db->prepare('SELECT le.*, e.nama_event
                                    FROM laporan_event le
                                    JOIN events e ON le.id_event=e.id_event
                                    WHERE ' . $this->ownedEventCondition() . '
                                    ORDER BY le.created_at DESC');
        $stmt->execute([$id_user]);
        return $stmt->fetchAll();
    }
}
