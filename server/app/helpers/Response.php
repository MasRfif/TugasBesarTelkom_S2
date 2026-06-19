<?php
class Response {
    static function json($data, int $code = 200): void {
        http_response_code($code);
        echo json_encode(['status' => $code < 400 ? 'success' : 'error', 'data' => $data]);
        exit;
    }

    static function success($data = null, string $message = 'OK', int $code = 200): void {
        http_response_code($code);
        echo json_encode(['status' => 'success', 'message' => $message, 'data' => $data]);
        exit;
    }

    static function error(string $message = 'Error', int $code = 400): void {
        http_response_code($code);
        echo json_encode(['status' => 'error', 'message' => $message]);
        exit;
    }

    static function notFound(string $message = 'Not found'): void {
        self::error($message, 404);
    }

    static function unauthorized(string $message = 'Unauthorized'): void {
        self::error($message, 401);
    }

    static function forbidden(string $message = 'Forbidden'): void {
        self::error($message, 403);
    }
}
