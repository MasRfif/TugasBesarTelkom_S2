<?php
class EventModel extends BaseModel {
    public function all(array $filter = []): array {
        $sql = 'SELECT e.*, ec.nama_category, d.nama_desa, d.kecamatan, d.kabupaten, d.provinsi,
                       lp.nama_tempat, lp.latitude, lp.longitude, lp.alamat, lp.map_popup_title, lp.map_popup_desc,
                       COALESCE((SELECT ei.image_url FROM event_images ei WHERE ei.id_event=e.id_event ORDER BY ei.id_event_image ASC LIMIT 1), "/assets/image.png") AS url_image,
                       (SELECT MIN(t.harga_tiket) FROM tiket t WHERE t.id_event=e.id_event) AS harga_mulai,
                       COALESCE(s.view_count,0) AS view_count, COALESCE(s.like_count,0) AS like_count,
                       COALESCE((SELECT ROUND(AVG(r.rate), 1) FROM ratings r WHERE r.id_event=e.id_event), 0) AS avg_rating,
                       COALESCE((SELECT COUNT(*) FROM ratings r WHERE r.id_event=e.id_event), 0) AS rating_count
                FROM events e
                LEFT JOIN event_categories ec ON e.id_category = ec.id_category
                LEFT JOIN desa d ON e.id_desa = d.id_desa
                LEFT JOIN lokasi_pin lp ON e.id_lokasi = lp.id_lokasi
                LEFT JOIN statistik s ON e.id_event = s.id_event
                WHERE e.status_event IN ("PUBLISHED","APPROVED","AUTO_APPROVED")';
        $params = [];

        if (!empty($filter['tag']) && $filter['tag'] !== 'Semua') {
            $sql .= ' AND ec.nama_category = ?';
            $params[] = $filter['tag'];
        }
        if (!empty($filter['city']) && $filter['city'] !== 'Semua Kota') {
            $sql .= ' AND d.kabupaten = ?';
            $params[] = $filter['city'];
        }
        if (!empty($filter['q'])) {
            $sql .= ' AND (e.nama_event LIKE ? OR e.deskripsi LIKE ? OR lp.nama_tempat LIKE ? OR d.nama_desa LIKE ? OR d.kabupaten LIKE ?)';
            $like = '%' . $filter['q'] . '%';
            array_push($params, $like, $like, $like, $like, $like);
        }

        $sql .= ' ORDER BY e.tanggal_mulai ASC, e.created_at DESC LIMIT 80';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array {
        $stmt = $this->db->prepare('SELECT e.*, ec.nama_category, d.nama_desa, d.kecamatan, d.kabupaten, d.provinsi,
                                           lp.nama_tempat, lp.latitude, lp.longitude, lp.alamat, lp.map_popup_title, lp.map_popup_desc,
                                           COALESCE((SELECT ei.image_url FROM event_images ei WHERE ei.id_event=e.id_event ORDER BY ei.id_event_image ASC LIMIT 1), "/assets/image.png") AS url_image,
                                           (SELECT MIN(t.harga_tiket) FROM tiket t WHERE t.id_event=e.id_event) AS harga_mulai,
                                           COALESCE(s.view_count,0) AS view_count, COALESCE(s.like_count,0) AS like_count,
                                           COALESCE((SELECT ROUND(AVG(r.rate), 1) FROM ratings r WHERE r.id_event=e.id_event), 0) AS avg_rating,
                                           COALESCE((SELECT COUNT(*) FROM ratings r WHERE r.id_event=e.id_event), 0) AS rating_count,
                                           (SELECT CONCAT(u.nama_awal," ",COALESCE(u.nama_akhir,""))
                                            FROM event_organizers eo JOIN users u ON eo.id_user=u.id_user
                                            WHERE eo.id_event=e.id_event AND eo.role_event="OWNER" LIMIT 1) AS organizer_name
                                    FROM events e
                                    LEFT JOIN event_categories ec ON e.id_category = ec.id_category
                                    LEFT JOIN desa d ON e.id_desa = d.id_desa
                                    LEFT JOIN lokasi_pin lp ON e.id_lokasi = lp.id_lokasi
                                    LEFT JOIN statistik s ON e.id_event = s.id_event
                                    WHERE e.id_event = ?');
        $stmt->execute([$id]);
        $event = $stmt->fetch();
        if (!$event) return null;

        $tickets = $this->db->prepare('SELECT t.*, kt.nama_kategori
                                       FROM tiket t
                                       LEFT JOIN kategori_tiket kt ON t.id_kategori_tiket = kt.id_kategori_tiket
                                       WHERE t.id_event = ? AND t.qty > 0
                                       ORDER BY t.harga_tiket ASC, t.id_tiket ASC');
        $tickets->execute([$id]);
        $event['tickets'] = $tickets->fetchAll();

        $products = $this->db->prepare('SELECT * FROM produk_event WHERE id_event = ? ORDER BY id_produk ASC');
        $products->execute([$id]);
        $event['products'] = $products->fetchAll();

        $images = $this->db->prepare('SELECT * FROM event_images WHERE id_event = ? ORDER BY id_event_image ASC');
        $images->execute([$id]);
        $event['images'] = $images->fetchAll();

        $summary = $this->db->prepare('SELECT COALESCE(ROUND(AVG(rate), 1), 0) AS avg_rating, COUNT(*) AS rating_count
                                       FROM ratings
                                       WHERE id_event = ?');
        $summary->execute([$id]);
        $event['rating_summary'] = $summary->fetch() ?: ['avg_rating' => 0, 'rating_count' => 0];

        $testimonials = $this->db->prepare('SELECT f.id_feedback, f.id_event, f.id_user, f.text, f.created_at,
                                                   CONCAT(u.nama_awal," ",COALESCE(u.nama_akhir,"")) AS nama_user,
                                                   e.nama_event,
                                                   COALESCE(r.rate, 0) AS rate
                                            FROM feedback f
                                            JOIN users u ON f.id_user = u.id_user
                                            JOIN events e ON f.id_event = e.id_event
                                            LEFT JOIN ratings r ON r.id_event = f.id_event AND r.id_user = f.id_user
                                            WHERE f.id_event = ?
                                            ORDER BY f.created_at DESC
                                            LIMIT 8');
        $testimonials->execute([$id]);
        $event['testimonials'] = $testimonials->fetchAll();

        return $event;
    }

    public function latestTestimonials(int $limit = 6): array {
        $summary = $this->db->query('SELECT COALESCE(ROUND(AVG(rate), 1), 0) AS avg_rating, COUNT(*) AS rating_count FROM ratings')->fetch();

        $stmt = $this->db->prepare('SELECT f.id_feedback, f.id_event, f.id_user, f.text, f.created_at,
                                           CONCAT(u.nama_awal," ",COALESCE(u.nama_akhir,"")) AS nama_user,
                                           e.nama_event,
                                           COALESCE(r.rate, 0) AS rate
                                    FROM feedback f
                                    JOIN users u ON f.id_user = u.id_user
                                    JOIN events e ON f.id_event = e.id_event
                                    LEFT JOIN ratings r ON r.id_event = f.id_event AND r.id_user = f.id_user
                                    WHERE e.status_event IN ("PUBLISHED","APPROVED","AUTO_APPROVED")
                                    ORDER BY f.created_at DESC, f.id_feedback DESC
                                    LIMIT ?');
        $stmt->bindValue(1, max(1, min(12, $limit)), PDO::PARAM_INT);
        $stmt->execute();

        return [
            'summary' => $summary ?: ['avg_rating' => 0, 'rating_count' => 0],
            'items' => $stmt->fetchAll(),
        ];
    }

    public function categories(): array {
        return $this->db->query('SELECT * FROM event_categories ORDER BY nama_category ASC')->fetchAll();
    }

    public function cities(): array {
        $rows = $this->db->query('SELECT DISTINCT kabupaten FROM desa WHERE kabupaten IS NOT NULL AND kabupaten <> "" ORDER BY kabupaten ASC')->fetchAll();
        return array_map(fn($r) => ['nama_kota' => $r['kabupaten']], $rows);
    }

    public function locations(): array {
        return $this->db->query('SELECT d.*, COUNT(e.id_event) AS total_event
                                 FROM desa d
                                 LEFT JOIN events e ON d.id_desa = e.id_desa
                                 GROUP BY d.id_desa
                                 ORDER BY d.kabupaten ASC, d.nama_desa ASC')->fetchAll();
    }

    public function paymentMethods(): array {
        return $this->db->query('SELECT * FROM payment_methods WHERE status_metode="ACTIVE" ORDER BY id_payment_method ASC')->fetchAll();
    }
}
