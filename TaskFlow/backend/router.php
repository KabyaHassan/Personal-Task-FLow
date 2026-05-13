<?php
// CORS Headers - RESTRICTED to specific domains
$allowed_origins = [
    'http://localhost:5173',                    // Local development
    'https://kabyahassan.42web.io',             // InfinityFree production
    'https://www.kabyahassan.42web.io',         // With www prefix
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Only set CORS header if origin is whitelisted
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    // Default to production domain
    header('Access-Control-Allow-Origin: https://kabyahassan.42web.io');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (preg_match('/^\/api\//', $requestUri)) {
    require __DIR__ . '/api/index.php';
    return true;
}

return false;
