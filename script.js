// Selecting DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoPriority = document.getElementById('todo-priority');
const todoList = document.getElementById('todo-list');
const completionStats = document.getElementById('completion-stats');
const filterButtons = document.querySelectorAll('.filter-btn');

// State Manager Array (Loads existing tasks or starts clean)
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// Initialize App Setup
document.addEventListener('DOMContentLoaded', () => {
    renderTodos();
    setupFilters();
});

// Create and Add a New Task Array Object
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newTodo = {
        id: Date.now(),
        text: todoInput.value.trim(),
        priority: todoPriority.value,
        completed: false
    };

    todos.push(newTodo);
    saveAndRefresh();
    todoForm.reset();
});

// UI Rendering Engine
function renderTodos() {
    todoList.innerHTML = '';
    
    // Filtering logic configuration
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'pending') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    if(filteredTodos.length === 0) {
        todoList.innerHTML = `<p style="text-align:center; color:rgba(255,255,255,0.3); padding:20px;">No tasks found here.</p>`;
    }

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item priority-${todo.priority} ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="todo-text-wrapper">
                <div class="todo-checkbox" onclick="toggleComplete(${todo.id})">
                    <i class="fa-solid fa-check"></i>
                </div>
                <span class="todo-title">${escapeHTML(todo.text)}</span>
            </div>
            <div class="todo-actions">
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </div>
        `;
        todoList.appendChild(li);
    });

    updateCounters();
}

// Logic: Toggle Done / Pending State
window.toggleComplete = (id) => {
    todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
    saveAndRefresh();
};

// Logic: Remove Task from List
window.deleteTodo = (id) => {
    todos = todos.filter(todo => todo.id !== id);
    saveAndRefresh();
};

// Save states to local machine database storage
function saveAndRefresh() {
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos();
}

// Stats Counter Calculation
function updateCounters() {
    const total = todos.length;
    const completedCount = todos.filter(t => t.completed).length;
    completionStats.textContent = `${completedCount}/${total} Completed`;
}

// Filter Tab Trigger Listeners
function setupFilters() {
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-filter');
            renderTodos();
        });
    });
}

// Prevention helper against input malicious injection scripting hacks
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}