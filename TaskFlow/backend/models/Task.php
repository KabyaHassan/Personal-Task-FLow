<?php
class Task {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAll() {
        $stmt = $this->pdo->query("SELECT * FROM tasks ORDER BY created_at DESC");
        return $stmt->fetchAll();
    }

    public function getById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM tasks WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function create($title, $description, $due_date = null) {
        $stmt = $this->pdo->prepare("INSERT INTO tasks (title, description, due_date) VALUES (?, ?, ?)");
        $stmt->execute([$title, $description, $due_date]);
        $id = $this->pdo->lastInsertId();
        return $this->getById($id);
    }

    public function update($id, $title, $description, $status, $due_date = null) {
        $fields = [];
        $params = [];
        
        if ($title !== null) {
            $fields[] = "title = ?";
            $params[] = $title;
        }
        if ($description !== null) {
            $fields[] = "description = ?";
            $params[] = $description;
        }
        if ($status !== null) {
            $fields[] = "status = ?";
            $params[] = $status;
        }
        if ($due_date !== null) {
            $fields[] = "due_date = ?";
            $params[] = $due_date;
        }

        if (empty($fields)) return $this->getById($id);

        $params[] = $id;
        $sql = "UPDATE tasks SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $this->getById($id);
    }

    public function toggle($id) {
        $task = $this->getById($id);
        if (!$task) return null;

        $newStatus = $task['status'] === 'pending' ? 'completed' : 'pending';
        $stmt = $this->pdo->prepare("UPDATE tasks SET status = ? WHERE id = ?");
        $stmt->execute([$newStatus, $id]);
        return $this->getById($id);
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM tasks WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }
}
