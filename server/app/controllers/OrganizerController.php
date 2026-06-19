<?php
class OrganizerController {
    private OrganizerModel $org;
    public function __construct() { $this->org = new OrganizerModel(); }

    private function getOrganizer(): array { return AuthMiddleware::organizer(); }

    private function canCreateOrOwn(array $user): bool {
        return in_array($user['nama_role'] ?? '', ['PENYELENGGARA', 'ADMIN_BG', 'ADMIN_SYSTEM']) || (($user['team_role'] ?? '') === 'OWNER');
    }


    private function requestBody(): array {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

        if (stripos($contentType, 'multipart/form-data') !== false || !empty($_POST)) {
            $body = $_POST;
        } else {
            $body = json_decode(file_get_contents('php://input'), true) ?? [];
        }

        if (isset($body['extra_tickets']) && is_string($body['extra_tickets'])) {
            $decoded = json_decode($body['extra_tickets'], true);
            $body['extra_tickets'] = is_array($decoded) ? $decoded : [];
        }

        $uploadedImage = $this->uploadEventImage($_FILES['event_image'] ?? null);
        if ($uploadedImage) {
            $body['url_image'] = $uploadedImage;
        }

        return $body;
    }

    private function uploadEventImage(?array $file): ?string {
        if (!$file || !isset($file['tmp_name']) || $file['error'] === UPLOAD_ERR_NO_FILE) {
            return null;
        }

        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Gagal menerima file gambar');
        }

        $allowedTypes = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'image/avif' => 'avif',
        ];

        $mime = mime_content_type($file['tmp_name']);
        if (!isset($allowedTypes[$mime])) {
            throw new Exception('Format gambar harus JPG, PNG, WEBP, atau AVIF');
        }

        if (($file['size'] ?? 0) > 2 * 1024 * 1024) {
            throw new Exception('Ukuran gambar maksimal 2MB');
        }

        $uploadDir = __DIR__ . '/../../public/uploads/events/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileName = 'event_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $allowedTypes[$mime];
        $targetPath = $uploadDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new Exception('Gagal menyimpan gambar ke server');
        }

        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $scriptDir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');

        return $scheme . '://' . $host . $scriptDir . '/uploads/events/' . $fileName;
    }

    function dashboardStats(): void {
        $user = $this->getOrganizer();
        Response::success($this->org->stats((int)$user['id_user']));
    }

    function events(): void {
        $user = $this->getOrganizer();
        Response::success($this->org->events((int)$user['id_user']));
    }

    function createEvent(): void {
        $user = $this->getOrganizer();
        if (!$this->canCreateOrOwn($user)) Response::forbidden('Hanya pemilik/ketua penyelenggara yang boleh membuat acara baru');
        $body = $this->requestBody();
        foreach (['nama_event', 'id_category', 'tanggal_mulai'] as $field) {
            if (empty($body[$field])) Response::error('Field ' . $field . ' wajib diisi');
        }
        try {
            $id = $this->org->createEvent((int)$user['id_user'], $body);
            Response::success(['id_event' => $id], 'Acara berhasil dibuat dan menunggu persetujuan admin', 201);
        } catch (Exception $e) { Response::error('Gagal membuat acara: ' . $e->getMessage(), 500); }
    }

    function updateEvent(int $id): void {
        $user = $this->getOrganizer();
        $body = $this->requestBody();
        try {
            $this->org->updateEvent((int)$user['id_user'], $id, $body);
            Response::success(null, 'Acara berhasil diperbarui dan kembali menunggu persetujuan');
        } catch (Exception $e) { Response::error($e->getMessage(), 403); }
    }

    function deleteEvent(int $id): void {
        $user = $this->getOrganizer();
        try {
            $this->org->deleteEvent((int)$user['id_user'], $id);
            Response::success(null, 'Acara berhasil dihapus');
        } catch (Exception $e) { Response::error($e->getMessage(), 403); }
    }

    function payments(): void { $user = $this->getOrganizer(); Response::success($this->org->payments((int)$user['id_user'])); }
    function team(): void { $user = $this->getOrganizer(); Response::success($this->org->team((int)$user['id_user'])); }

    function addTeam(): void {
        $user = $this->getOrganizer();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $email = trim($body['email'] ?? '');
        $id_event = (int)($body['id_event'] ?? 0);
        $role_event = $body['role_event'] ?? 'VIEWER';
        if (!$email || !$id_event) Response::error('Email dan acara wajib diisi');
        try {
            $this->org->addTeam((int)$user['id_user'], $email, $id_event, $role_event);
            Response::success(null, 'Anggota tim berhasil ditambahkan', 201);
        } catch (Exception $e) { Response::error($e->getMessage(), 400); }
    }

    function updateTeam(int $id): void {
        $user = $this->getOrganizer();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $this->org->updateTeam((int)$user['id_user'], $id, $body['role_event'] ?? 'VIEWER');
        Response::success(null, 'Jobdesk berhasil diperbarui');
    }

    function deleteTeam(int $id): void {
        $user = $this->getOrganizer();
        $this->org->deleteTeam((int)$user['id_user'], $id);
        Response::success(null, 'Anggota tim dihapus');
    }

    function tickets(): void { $user = $this->getOrganizer(); Response::success($this->org->tickets((int)$user['id_user'])); }
    function reports(): void { $user = $this->getOrganizer(); Response::success($this->org->reports((int)$user['id_user'])); }
}
