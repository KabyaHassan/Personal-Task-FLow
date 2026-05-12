const BASE_URL = '/api';

export const fetchTasks = async () => {
    try {
        const res = await fetch(`${BASE_URL}/tasks`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return { success: false, message: 'Failed to connect. Is the server running?' };
    }
};

export const createTask = async (data) => {
    try {
        const res = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch (error) {
        return { success: false, message: 'Failed to connect. Is the server running?' };
    }
};

export const updateTask = async (id, data) => {
    try {
        const res = await fetch(`${BASE_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch (error) {
        return { success: false, message: 'Failed to connect. Is the server running?' };
    }
};

export const toggleTask = async (id) => {
    try {
        const res = await fetch(`${BASE_URL}/tasks/${id}/toggle`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });
        return await res.json();
    } catch (error) {
        return { success: false, message: 'Failed to connect. Is the server running?' };
    }
};

export const deleteTask = async (id) => {
    try {
        const res = await fetch(`${BASE_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        return await res.json();
    } catch (error) {
        return { success: false, message: 'Failed to connect. Is the server running?' };
    }
};
