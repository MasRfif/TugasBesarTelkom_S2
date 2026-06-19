<?php
class AuthController {
    private UserModel $users;

    public function __construct() { $this->users = new UserModel(); }

    function login(): void {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $email = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';
        if (!$email || !$password) Response::error('Email dan password wajib diisi');

        $user = $this->users->findByEmail($email);
        if (!$user || !password_verify($password, $user['password'])) Response::error('Email atau password salah', 401);

        $token = Auth::generateToken();
        $this->users->setToken((int)$user['id_user'], $token);
        $user['api_token'] = $token;
        $user['token'] = $token;
        unset($user['password']);
        $user = $this->users->attachTeamInfo($user);

        Response::success(['user' => $user], 'Berhasil masuk');
    }

    function register(): void {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $nama_awal  = trim($body['nama_awal'] ?? '');
        $nama_akhir = trim($body['nama_akhir'] ?? '');
        $email      = trim($body['email'] ?? '');
        $password   = $body['password'] ?? '';
        $role       = $body['role'] ?? 'USER';
        $id_desa    = (int)($body['id_desa'] ?? 1);

        if (!$nama_awal || !$email || !$password) Response::error('Nama, email, dan password wajib diisi');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) Response::error('Format email tidak valid');
        if (strlen($password) < 6) Response::error('Password minimal 6 karakter');
        if ($this->users->findByEmail($email)) Response::error('Email sudah terdaftar');

        if (!in_array($role, ['USER', 'PENYELENGGARA'])) $role = 'USER';
        $id_role = $this->users->roleId($role);
        if (!$id_role) Response::error('Peran tidak ditemukan di database');

        $created = $this->users->create([
            'id_role' => $id_role,
            'role' => $role,
            'id_desa' => $id_desa,
            'nama_awal' => $nama_awal,
            'nama_akhir' => $nama_akhir,
            'email' => $email,
            'password' => $password,
            'alamat' => $body['alamat'] ?? '',
            'rt' => $body['rt'] ?? '',
            'rw' => $body['rw'] ?? '',
        ]);

        $user = [
            'id_user' => $created['id_user'],
            'nama_awal' => $nama_awal,
            'nama_akhir' => $nama_akhir,
            'email' => $email,
            'nama_role' => $role,
            'id_desa' => $id_desa,
            'api_token' => $created['api_token'],
            'token' => $created['api_token'],
        ];
        Response::success(['user' => $user], 'Registrasi berhasil', 201);
    }

    function me(): void {
        $user = Auth::require();
        $user['token'] = $user['api_token'] ?? null;
        unset($user['password']);
        Response::success($user);
    }

    function logout(): void {
        $user = Auth::require();
        $this->users->setToken((int)$user['id_user'], null);
        Response::success(null, 'Berhasil keluar');
    }
}
