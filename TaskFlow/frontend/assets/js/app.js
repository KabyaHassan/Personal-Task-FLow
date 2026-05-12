import { fetchTasks, createTask, updateTask, toggleTask, deleteTask } from './api.js';

let tasks = [];
let currentFilter = 'All'; // All, Pending, Completed
let isEditing = null; // null or task object

const appRoot = document.getElementById('app-root');

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const renderApp = () => {
    appRoot.innerHTML = `
        <div class="task-form">
            <form id="create-form">
                <div class="form-group">
                    <label for="task-title">Task Title</label>
                    <input type="text" id="task-title" class="form-control" placeholder="What needs to be done?">
                    <span id="title-error" class="error-message" style="display: none;">Title is required</span>
                </div>
                <div class="form-group">
                    <label for="task-desc">Description (Optional)</label>
                    <textarea id="task-desc" class="form-control" rows="2" placeholder="Add more details..."></textarea>
                </div>
                <div class="form-group">
                    <label for="task-due-date">Due Date (Optional)</label>
                    <input type="date" id="task-due-date" class="form-control">
                </div>
                <button type="submit" class="btn btn-primary" id="add-btn">Add Task</button>
            </form>
        </div>

        <div class="filter-bar">
            <button class="filter-btn ${currentFilter === 'All' ? 'active' : ''}" data-filter="All">All</button>
            <button class="filter-btn ${currentFilter === 'Pending' ? 'active' : ''}" data-filter="Pending">Pending</button>
            <button class="filter-btn ${currentFilter === 'Completed' ? 'active' : ''}" data-filter="Completed">Completed</button>
        </div>

        <div id="task-list-container">
            <div class="loading-container">Loading tasks...</div>
        </div>

        ${isEditing ? renderEditModal() : ''}
    `;

    bindEvents();
    renderTasks();
};

const renderEditModal = () => {
    return `
        <div class="edit-modal-overlay" id="edit-overlay">
            <div class="edit-modal">
                <h2>Edit Task</h2>
                <form id="edit-form">
                    <div class="form-group">
                        <label for="edit-title">Task Title</label>
                        <input type="text" id="edit-title" class="form-control" value="${escapeHtml(isEditing.title)}">
                        <span id="edit-title-error" class="error-message" style="display: none;">Title is required</span>
                    </div>
                    <div class="form-group">
                        <label for="edit-desc">Description (Optional)</label>
                        <textarea id="edit-desc" class="form-control" rows="3">${escapeHtml(isEditing.description || '')}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="edit-due-date">Due Date (Optional)</label>
                        <input type="date" id="edit-due-date" class="form-control" value="${isEditing.due_date ? isEditing.due_date : ''}">
                    </div>
                    <div class="edit-actions">
                        <button type="button" class="btn btn-secondary" id="cancel-edit">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="save-edit">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

const escapeHtml = (unsafe) => {
    if (!unsafe) return '';
    return String(unsafe)
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
};

const renderTasks = () => {
    const container = document.getElementById('task-list-container');
    
    let filteredTasks = tasks;
    if (currentFilter === 'Pending') filteredTasks = tasks.filter(t => t.status === 'pending');
    if (currentFilter === 'Completed') filteredTasks = tasks.filter(t => t.status === 'completed');

    if (filteredTasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No tasks yet. Add your first task.</p>
            </div>
        `;
        return;
    }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        container.innerHTML = `
            <div class="task-list">
                ${filteredTasks.map(task => {
                    let isOverdue = false;
                    let dueString = '';
                    if (task.due_date) {
                        const dueDate = new Date(task.due_date);
                        dueString = formatDate(task.due_date);
                        if (task.status === 'pending' && dueDate < today) {
                            isOverdue = true;
                        }
                    }

                    return `
                    <div class="task-card ${task.status === 'completed' ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">
                        <div class="task-checkbox-container">
                            <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.status === 'completed' ? 'checked' : ''}>
                        </div>
                        <div class="task-content">
                            <div class="task-header">
                                <h3 class="task-title">${escapeHtml(task.title)}</h3>
                                <span class="badge ${task.status}">${task.status}</span>
                            </div>
                            ${task.description ? `<p class="task-desc">${escapeHtml(task.description)}</p>` : ''}
                            <div class="task-meta">
                                <span>Created: ${formatDate(task.created_at)}</span>
                                ${dueString ? `<span class="due-date-display ${isOverdue ? 'text-overdue' : ''}">Due: ${dueString}</span>` : ''}
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="btn btn-sm btn-secondary edit-btn" data-id="${task.id}">Edit</button>
                            <button class="btn btn-sm btn-danger delete-btn" data-id="${task.id}">Delete</button>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        `;

    bindTaskEvents();
};

const bindEvents = () => {
    const createForm = document.getElementById('create-form');
    const titleInput = document.getElementById('task-title');
    const titleError = document.getElementById('title-error');
    const filterBtns = document.querySelectorAll('.filter-btn');

    titleInput.addEventListener('input', () => {
        if (titleInput.value.trim() !== '') {
            titleError.style.display = 'none';
        }
    });

    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = titleInput.value.trim();
        const description = document.getElementById('task-desc').value.trim();
        const due_date = document.getElementById('task-due-date').value;

        if (!title) {
            titleError.style.display = 'block';
            return;
        }

        const btn = document.getElementById('add-btn');
        btn.disabled = true;
        btn.textContent = 'Adding...';

        const res = await createTask({ title, description, due_date });
        if (res.success) {
            titleInput.value = '';
            document.getElementById('task-desc').value = '';
            document.getElementById('task-due-date').value = '';
            await loadTasks();
        } else {
            titleError.textContent = res.message || 'Failed to create task';
            titleError.style.display = 'block';
        }

        btn.disabled = false;
        btn.textContent = 'Add Task';
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentFilter = e.target.dataset.filter;
            renderApp(); // Re-render to update active classes and list
        });
    });

    if (isEditing) {
        const editForm = document.getElementById('edit-form');
        const cancelBtn = document.getElementById('cancel-edit');
        const editTitle = document.getElementById('edit-title');
        const editTitleError = document.getElementById('edit-title-error');

        editTitle.addEventListener('input', () => {
            if (editTitle.value.trim() !== '') {
                editTitleError.style.display = 'none';
            }
        });

        cancelBtn.addEventListener('click', () => {
            isEditing = null;
            renderApp();
        });

        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = editTitle.value.trim();
            const description = document.getElementById('edit-desc').value.trim();
            const due_date = document.getElementById('edit-due-date').value;

            if (!title) {
                editTitleError.style.display = 'block';
                return;
            }

            const btn = document.getElementById('save-edit');
            btn.disabled = true;
            btn.textContent = 'Saving...';

            const res = await updateTask(isEditing.id, { title, description, due_date });
            if (res.success) {
                isEditing = null;
                await loadTasks();
            } else {
                editTitleError.textContent = res.message || 'Failed to update task';
                editTitleError.style.display = 'block';
                btn.disabled = false;
                btn.textContent = 'Save Changes';
            }
        });
    }
};

const bindTaskEvents = () => {
    const checkboxes = document.querySelectorAll('.task-checkbox');
    const deleteBtns = document.querySelectorAll('.delete-btn');
    const editBtns = document.querySelectorAll('.edit-btn');

    checkboxes.forEach(cb => {
        cb.addEventListener('change', async (e) => {
            const id = e.target.dataset.id;
            e.target.disabled = true;
            const res = await toggleTask(id);
            if (res.success) {
                await loadTasks();
            } else {
                e.target.disabled = false;
                e.target.checked = !e.target.checked; // Revert visually
                alert('Failed to toggle status');
            }
        });
    });

    deleteBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (window.confirm("Are you sure you want to delete this task?")) {
                const id = e.target.dataset.id;
                e.target.disabled = true;
                e.target.textContent = '...';
                const res = await deleteTask(id);
                if (res.success) {
                    await loadTasks();
                } else {
                    e.target.disabled = false;
                    e.target.textContent = 'Delete';
                    alert('Failed to delete task');
                }
            }
        });
    });

    editBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const task = tasks.find(t => t.id == id);
            if (task) {
                isEditing = task;
                renderApp();
            }
        });
    });
};

const loadTasks = async () => {
    const res = await fetchTasks();
    if (res.success && res.data) {
        tasks = res.data;
        renderApp();
    } else {
        const container = document.getElementById('task-list-container');
        if (container) {
            container.innerHTML = `<div class="error-message" style="text-align: center;">${res.message || 'Failed to load tasks'}</div>`;
        }
    }
};

// Initial load
renderApp();
loadTasks();
