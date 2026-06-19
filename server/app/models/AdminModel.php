<?php
class AdminModel extends BaseModel {
    private function eventSelect(string $where = ''): string {
        return 'SELECT e.*, ec.nama_category, d.nama_desa, d.kabupaten, lp.nama_tempat,
                       COALESCE((SELECT image_url FROM event_images ei WHERE ei.id_event=e.id_event ORDER BY id_event_image ASC LIMIT 1), "/assets/image.png") AS url_image
                FROM events e
                LEFT JOIN event_categories ec ON e.id_category=ec.id_category
                LEFT JOIN desa d ON e.id_desa=d.id_desa
                LEFT JOIN lokasi_pin lp ON e.id_lokasi=lp.id_lokasi ' . $where . ' ORDER BY e.created_at DESC';
    }

    public function stats(): array {
        return [
            'total_users' => (int)$this->db->query('SELECT COUNT(*) FROM users')->fetchColumn(),
            'total_events' => (int)$this->db->query('SELECT COUNT(*) FROM events')->fetchColumn(),
            'pending_events' => (int)$this->db->query('SELECT COUNT(*) FROM events WHERE status_event="PENDING"')->fetchColumn(),
            'organizers' => (int)$this->db->query('SELECT COUNT(*) FROM users u JOIN roles r ON u.id_role=r.id_role WHERE r.nama_role="PENYELENGGARA"')->fetchColumn(),
            'total_transactions' => (int)$this->db->query('SELECT COUNT(*) FROM transaksi')->fetchColumn(),
        ];
    }

    public function events(): array { return $this->db->query($this->eventSelect())->fetchAll(); }
    public function pendingEvents(): array { return $this->db->query($this->eventSelect('WHERE e.status_event="PENDING"'))->fetchAll(); }

    public function verifyEvent(int $id_event, int $id_admin, string $status, ?string $alasan = null): void {
        $new = $status === 'APPROVED' ? 'PUBLISHED' : 'REJECTED';
        $this->db->beginTransaction();
        try {
            $this->db->prepare('UPDATE events SET status_event=? WHERE id_event=?')->execute([$new, $id_event]);
            $this->db->prepare('INSERT INTO event_verifications (id_event, id_user, id_rule, status_verif, tipe_verif, alasan, verified_at, created_at)
                                VALUES (?,?,NULL,?,"ADMIN_BG",?,NOW(),NOW())')->execute([$id_event, $id_admin, $status, $alasan ?: $status]);
            $this->db->commit();
        } catch (Exception $e) { $this->db->rollBack(); throw $e; }
    }

    public function users(): array {
        return $this->db->query('SELECT u.id_user, u.nama_awal, u.nama_akhir, u.email, u.created_at, r.nama_role, d.nama_desa, d.kabupaten
                                 FROM users u JOIN roles r ON u.id_role=r.id_role LEFT JOIN desa d ON u.id_desa=d.id_desa
                                 ORDER BY u.created_at DESC')->fetchAll();
    }

    public function transactions(): array {
        return $this->db->query('SELECT tr.*, u.nama_awal, u.nama_akhir, p.status_payment, p.kode_pembayaran, pm.nama_metode
                                 FROM transaksi tr
                                 JOIN users u ON tr.id_user=u.id_user
                                 LEFT JOIN payments p ON p.id_transaksi=tr.id_transaksi
                                 LEFT JOIN payment_methods pm ON p.id_payment_method=pm.id_payment_method
                                 ORDER BY tr.tanggal_transaksi DESC LIMIT 100')->fetchAll();
    }

    public function cctv(): array {
        return $this->db->query('SELECT c.*, e.nama_event FROM cctv c LEFT JOIN events e ON c.id_event=e.id_event ORDER BY c.id_cctv DESC')->fetchAll();
    }

    public function faqPending(): array {
        return $this->db->query('SELECT f.*, u.nama_awal, u.nama_akhir FROM faq f LEFT JOIN users u ON f.id_user=u.id_user WHERE f.jawaban IS NULL OR TRIM(f.jawaban)="" ORDER BY f.created_at ASC')->fetchAll();
    }

    public function answerFaq(int $id_faq, string $jawaban): void {
        $this->db->prepare('UPDATE faq SET jawaban=? WHERE id_faq=?')->execute([$jawaban, $id_faq]);
    }

    public function geoStats(): array {
        return $this->db->query('SELECT d.kabupaten, d.nama_desa, COUNT(e.id_event) AS total_event, COUNT(DISTINCT u.id_user) AS total_user
                                 FROM desa d
                                 LEFT JOIN events e ON d.id_desa=e.id_desa
                                 LEFT JOIN users u ON d.id_desa=u.id_desa
                                 GROUP BY d.id_desa
                                 ORDER BY total_event DESC, d.kabupaten ASC')->fetchAll();
    }
}
