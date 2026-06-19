<?php
class AdminController {
    private AdminModel $admin;
    public function __construct() { $this->admin = new AdminModel(); }

    function dashboardStats(): void { AuthMiddleware::admin(); Response::success($this->admin->stats()); }
    function events(): void { AuthMiddleware::admin(); Response::success($this->admin->events()); }
    function pendingEvents(): void { AuthMiddleware::admin(); Response::success($this->admin->pendingEvents()); }

    function verifyEvent(): void {
        $adminUser = AuthMiddleware::admin();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $id = (int)($body['id_event'] ?? 0);
        $status = $body['status_verif'] ?? '';
        if (!$id || !in_array($status, ['APPROVED', 'REJECTED'])) Response::error('Data verifikasi tidak valid');
        try {
            $this->admin->verifyEvent($id, (int)$adminUser['id_user'], $status, $body['alasan'] ?? null);
            Response::success(null, 'Acara berhasil diverifikasi');
        } catch (Exception $e) { Response::error('Gagal verifikasi: ' . $e->getMessage(), 500); }
    }

    function users(): void { AuthMiddleware::admin(); Response::success($this->admin->users()); }
    function transactions(): void { AuthMiddleware::admin(); Response::success($this->admin->transactions()); }
    function cctv(): void { AuthMiddleware::admin(); Response::success($this->admin->cctv()); }
    function faqPending(): void { AuthMiddleware::admin(); Response::success($this->admin->faqPending()); }

    function faqAnswer(): void {
        AuthMiddleware::admin();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $id = (int)($body['id_faq'] ?? 0);
        $jawaban = trim($body['jawaban'] ?? '');
        if (!$id || !$jawaban) Response::error('Data FAQ belum lengkap');
        $this->admin->answerFaq($id, $jawaban);
        Response::success(null, 'FAQ berhasil dijawab');
    }

    function geoStats(): void { AuthMiddleware::admin(); Response::success($this->admin->geoStats()); }
}
