<?php
class FaqModel extends BaseModel {
    public function published(): array {
        return $this->db->query('SELECT f.id_faq, f.pertanyaan, f.jawaban, f.created_at, u.nama_awal, u.nama_akhir
                                 FROM faq f LEFT JOIN users u ON f.id_user=u.id_user
                                 WHERE f.jawaban IS NOT NULL AND TRIM(f.jawaban) <> ""
                                 ORDER BY f.created_at DESC')->fetchAll();
    }

    public function submit(int $id_user, string $pertanyaan): void {
        $stmt = $this->db->prepare('INSERT INTO faq (id_user, pertanyaan, jawaban, created_at) VALUES (?,?,NULL,NOW())');
        $stmt->execute([$id_user, $pertanyaan]);
    }
}
