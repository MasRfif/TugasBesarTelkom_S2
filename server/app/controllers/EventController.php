<?php
class EventController {
    private EventModel $events;
    public function __construct() { $this->events = new EventModel(); }

    function index(): void {
        Response::success($this->events->all([
            'tag' => $_GET['tag'] ?? '',
            'q' => $_GET['q'] ?? '',
            'city' => $_GET['city'] ?? '',
        ]));
    }

    function show(int $id): void {
        $event = $this->events->find($id);
        if (!$event) Response::notFound('Acara tidak ditemukan');
        Response::success($event);
    }

    function categories(): void { Response::success($this->events->categories()); }
    function cities(): void { Response::success($this->events->cities()); }
    function locations(): void { Response::success($this->events->locations()); }
    function paymentMethods(): void { Response::success($this->events->paymentMethods()); }
    function testimonials(): void { Response::success($this->events->latestTestimonials(6)); }
}

