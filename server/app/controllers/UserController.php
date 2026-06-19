<?php
class UserController {
    private UserModel $users;
    public function __construct() { $this->users = new UserModel(); }

    function profile(): void {
        $user = Auth::require();
        unset($user['password']);
        Response::success($user);
    }

    function myTickets(): void {
        $user = Auth::require();
        Response::success($this->users->myTickets((int)$user['id_user']));
    }

    function myTransactions(): void {
        $user = Auth::require();
        Response::success($this->users->myTransactions((int)$user['id_user']));
    }


    function transactionDetail(int $id_transaksi): void {
        $user = Auth::require();
        $row = $this->users->transactionDetail((int)$user['id_user'], $id_transaksi);
        if (!$row) Response::error('Transaksi tidak ditemukan', 404);
        Response::success($row);
    }

    function checkout(): void {
        $user  = Auth::require();
        $body  = json_decode(file_get_contents('php://input'), true) ?? [];
        $id_tiket = (int)($body['id_tiket'] ?? 0);
        $jumlah = max(1, (int)($body['jumlah'] ?? 1));
        $id_payment_method = (int)($body['id_payment_method'] ?? 1);
        if (!$id_tiket) Response::error('Tiket tidak valid');
        try {
            $res = $this->users->checkout((int)$user['id_user'], $id_tiket, $jumlah, $id_payment_method);
            Response::success($res, 'Pesanan berhasil dibuat', 201);
        } catch (Exception $e) {
            Response::error('Gagal memasan: ' . $e->getMessage(), 500);
        }
    }
}
