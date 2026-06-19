<?php
class Auth {
    static function getToken(): ?string {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!$header && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }
        if (preg_match('/Bearer\s+(.+)/i', $header, $m)) return trim($m[1]);
        return null;
    }

    static function getUser(): ?array {
        $token = self::getToken();
        if (!$token) return null;
        $model = new UserModel();
        $user = $model->findByToken($token);
        if (!$user) return null;
        return $model->attachTeamInfo($user);
    }

    static function require(): array {
        $user = self::getUser();
        if (!$user) Response::unauthorized('Token tidak valid atau sudah kedaluwarsa');
        return $user;
    }

    static function requireRole(array $roles): array {
        $user = self::require();
        if (!in_array($user['nama_role'], $roles)) Response::forbidden('Akses ditolak untuk peran ' . $user['nama_role']);
        return $user;
    }

    static function generateToken(): string {
        return bin2hex(random_bytes(32));
    }
}
