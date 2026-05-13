<?php
/**
 * TaskFlow Root Router
 * Routes API requests to backend, frontend requests to frontend/index.html
 */

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Route API requests to backend
if (preg_match('/^\/api\//', $requestUri)) {
    require __DIR__ . '/backend/api/index.php';
    return true;
}

// Route static files from frontend
if (preg_match('/\.(js|css|html|json|png|jpg|gif|svg|woff|woff2|ttf)$/i', $requestUri)) {
    return false; // Let web server serve static files
}

// Serve frontend for everything else
require __DIR__ . '/frontend/index.html';
