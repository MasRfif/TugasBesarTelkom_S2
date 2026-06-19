<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

define('ROOT', dirname(__DIR__));

require_once ROOT . '/config/database.php';
require_once ROOT . '/app/helpers/Response.php';
require_once ROOT . '/app/models/BaseModel.php';
require_once ROOT . '/app/models/UserModel.php';
require_once ROOT . '/app/models/EventModel.php';
require_once ROOT . '/app/models/AdminModel.php';
require_once ROOT . '/app/models/OrganizerModel.php';
require_once ROOT . '/app/models/FaqModel.php';
require_once ROOT . '/app/helpers/Auth.php';
require_once ROOT . '/app/middleware/AuthMiddleware.php';
require_once ROOT . '/app/controllers/AuthController.php';
require_once ROOT . '/app/controllers/EventController.php';
require_once ROOT . '/app/controllers/UserController.php';
require_once ROOT . '/app/controllers/AdminController.php';
require_once ROOT . '/app/controllers/OrganizerController.php';
require_once ROOT . '/app/controllers/FaqController.php';
require_once ROOT . '/routes/api.php';
