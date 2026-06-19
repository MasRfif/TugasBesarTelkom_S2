<?php
class AuthMiddleware {
    static function handle(): array { return Auth::require(); }
    static function admin(): array { return Auth::requireRole(['ADMIN_BG', 'ADMIN_SYSTEM']); }
    static function organizer(): array {
        $user = Auth::require();
        if (in_array($user['nama_role'], ['PENYELENGGARA', 'ADMIN_BG', 'ADMIN_SYSTEM']) || !empty($user['can_open_organizer'])) return $user;
        Response::forbidden('Akses penyelenggara ditolak');
    }
}
