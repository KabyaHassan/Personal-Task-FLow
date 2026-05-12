<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Task.php';

$taskModel = new Task($pdo);

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$pathParts = explode('/', trim($requestUri, '/'));

if (count($pathParts) >= 2 && $pathParts[0] === 'api' && $pathParts[1] === 'tasks') {
    $id = isset($pathParts[2]) ? $pathParts[2] : null;
    $action = isset($pathParts[3]) ? $pathParts[3] : null;

    try {
        if ($method === 'GET' && !$id) {
            $tasks = $taskModel->getAll();
            echo json_encode(['success' => true, 'message' => 'Tasks retrieved', 'data' => $tasks]);
            exit;
        }

        if ($method === 'POST' && !$id) {
            $input = json_decode(file_get_contents('php://input'), true);
            $title = isset($input['title']) ? trim($input['title']) : '';
            $description = isset($input['description']) ? $input['description'] : null;
            $due_date = isset($input['due_date']) && !empty(trim($input['due_date'])) ? trim($input['due_date']) : null;

            if (empty($title)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Title is required']);
                exit;
            }

            $newTask = $taskModel->create($title, $description, $due_date);
            http_response_code(201);
            echo json_encode(['success' => true, 'message' => 'Task created successfully', 'data' => $newTask]);
            exit;
        }

        if ($method === 'PUT' && $id) {
            $existingTask = $taskModel->getById($id);
            if (!$existingTask) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Task not found']);
                exit;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            
            $title = array_key_exists('title', $input) ? trim($input['title']) : null;
            if ($title !== null && empty($title)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Title is required']);
                exit;
            }

            $description = array_key_exists('description', $input) ? $input['description'] : null;
            $due_date = array_key_exists('due_date', $input) ? (empty(trim($input['due_date'])) ? null : trim($input['due_date'])) : null;
            $status = array_key_exists('status', $input) ? $input['status'] : null;
            if ($status !== null && !in_array($status, ['pending', 'completed'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid status']);
                exit;
            }

            $updatedTask = $taskModel->update($id, $title, $description, $status, $due_date);
            echo json_encode(['success' => true, 'message' => 'Task updated successfully', 'data' => $updatedTask]);
            exit;
        }

        if ($method === 'PATCH' && $id && $action === 'toggle') {
            $existingTask = $taskModel->getById($id);
            if (!$existingTask) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Task not found']);
                exit;
            }

            $updatedTask = $taskModel->toggle($id);
            echo json_encode(['success' => true, 'message' => 'Task status toggled', 'data' => $updatedTask]);
            exit;
        }

        if ($method === 'DELETE' && $id) {
            $existingTask = $taskModel->getById($id);
            if (!$existingTask) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Task not found']);
                exit;
            }

            $taskModel->delete($id);
            echo json_encode(['success' => true, 'message' => 'Task deleted successfully']);
            exit;
        }

        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Endpoint not found']);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Internal server error', 'error' => $e->getMessage()]);
        exit;
    }
}

http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Endpoint not found']);
exit;
