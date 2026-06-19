<?php
class FaqController {
    private FaqModel $faqs;
    public function __construct() { $this->faqs = new FaqModel(); }

    function index(): void { Response::success($this->faqs->published()); }

    function submit(): void {
        $user = Auth::require();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $pertanyaan = trim($body['pertanyaan'] ?? '');
        if (!$pertanyaan) Response::error('Pertanyaan tidak boleh kosong');
        $this->faqs->submit((int)$user['id_user'], $pertanyaan);
        Response::success(null, 'Pertanyaan berhasil dikirim', 201);
    }
}
