<?php
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

$uri = preg_replace('#^/TheVillage/server/public#', '', $uri);
$uri = preg_replace('#^/api#', '', $uri);
$uri = rtrim($uri, '/') ?: '/';

$auth   = new AuthController();
$event  = new EventController();
$user   = new UserController();
$admin  = new AdminController();
$org    = new OrganizerController();
$faq    = new FaqController();

if ($uri === '/login'    && $method === 'POST') { $auth->login(); exit; }
if ($uri === '/register' && $method === 'POST') { $auth->register(); exit; }
if ($uri === '/me'       && $method === 'GET')  { $auth->me(); exit; }
if ($uri === '/logout'   && $method === 'POST') { $auth->logout(); exit; }

if ($uri === '/events'     && $method === 'GET') { $event->index(); exit; }
if ($uri === '/categories' && $method === 'GET') { $event->categories(); exit; }
if ($uri === '/cities'     && $method === 'GET') { $event->cities(); exit; }
if ($uri === '/locations'  && $method === 'GET') { $event->locations(); exit; }
if ($uri === '/testimonials' && $method === 'GET') { $event->testimonials(); exit; }
if ($uri === '/payment-methods' && $method === 'GET') { $event->paymentMethods(); exit; }
if (preg_match('#^/events/(\d+)$#', $uri, $m) && $method === 'GET') { $event->show((int)$m[1]); exit; }

if ($uri === '/faq'        && $method === 'GET')  { $faq->index(); exit; }
if ($uri === '/faq-submit' && $method === 'POST') { $faq->submit(); exit; }

if ($uri === '/profile'         && $method === 'GET')  { $user->profile(); exit; }
if ($uri === '/my-tickets'      && $method === 'GET')  { $user->myTickets(); exit; }
if ($uri === '/my-transactions' && $method === 'GET')  { $user->myTransactions(); exit; }
if (preg_match('#^/my-transactions/(\d+)$#', $uri, $m) && $method === 'GET') { $user->transactionDetail((int)$m[1]); exit; }
if ($uri === '/checkout'        && $method === 'POST') { $user->checkout(); exit; }

if ($uri === '/admin/dashboard-stats' && $method === 'GET')  { $admin->dashboardStats(); exit; }
if ($uri === '/admin/events'          && $method === 'GET')  { $admin->events(); exit; }
if ($uri === '/admin/pending-events'  && $method === 'GET')  { $admin->pendingEvents(); exit; }
if ($uri === '/admin/verify-event'    && $method === 'POST') { $admin->verifyEvent(); exit; }
if ($uri === '/admin/users'           && $method === 'GET')  { $admin->users(); exit; }
if ($uri === '/admin/transactions'    && $method === 'GET')  { $admin->transactions(); exit; }
if ($uri === '/admin/cctv'            && $method === 'GET')  { $admin->cctv(); exit; }
if ($uri === '/admin/faq-pending'     && $method === 'GET')  { $admin->faqPending(); exit; }
if ($uri === '/admin/faq-answer'      && $method === 'POST') { $admin->faqAnswer(); exit; }
if ($uri === '/admin/geo-stats'       && $method === 'GET')  { $admin->geoStats(); exit; }

if ($uri === '/organizer/dashboard-stats' && $method === 'GET')  { $org->dashboardStats(); exit; }
if ($uri === '/organizer/events'          && $method === 'GET')  { $org->events(); exit; }
if ($uri === '/organizer/events'          && $method === 'POST') { $org->createEvent(); exit; }
if ($uri === '/organizer/payments'        && $method === 'GET')  { $org->payments(); exit; }
if ($uri === '/organizer/team'            && $method === 'GET')  { $org->team(); exit; }
if ($uri === '/organizer/team'            && $method === 'POST') { $org->addTeam(); exit; }
if ($uri === '/organizer/tickets'         && $method === 'GET')  { $org->tickets(); exit; }
if ($uri === '/organizer/reports'         && $method === 'GET')  { $org->reports(); exit; }
if (preg_match('#^/organizer/events/(\d+)$#', $uri, $m)) {
    if ($method === 'PUT' || $method === 'POST') { $org->updateEvent((int)$m[1]); exit; }
    if ($method === 'DELETE') { $org->deleteEvent((int)$m[1]); exit; }
}
if (preg_match('#^/organizer/team/(\d+)$#', $uri, $m)) {
    if ($method === 'PUT') { $org->updateTeam((int)$m[1]); exit; }
    if ($method === 'DELETE') { $org->deleteTeam((int)$m[1]); exit; }
}

http_response_code(404);
echo json_encode(['status' => 'error', 'message' => "Rute tidak ditemukan: [$method] $uri"]);
