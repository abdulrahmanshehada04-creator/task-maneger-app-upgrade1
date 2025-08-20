// DOM Elements
const newTaskInput = document.getElementById('newTaskInput');
const dueDateInput = document.getElementById('dueDateInput');
const addBtn = document.getElementById('addBtn');
const calendarGrid = document.getElementById('calendarGrid');
const darkModeToggle = document.getElementById('darkModeToggle');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const errorDiv = document.getElementById('error');
const regErrorDiv = document.getElementById('regError');

// Current user
let currentUser = localStorage.getItem('currentUser') || null;

// Load users from localStorage
function loadUsers() {
  const usersJSON = localStorage.getItem('users');
  return usersJSON ? JSON.parse(usersJSON) : [];
}

// Save users to localStorage
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

// Load tasks for current user
function loadTasks() {
  const tasksJSON = localStorage.getItem(`tasks_${currentUser}`);
  return tasksJSON ? JSON.parse(tasksJSON) : [];
}

// Save tasks for current user
function saveTasks(tasks) {
  localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(tasks));
}

// Render calendar
function renderCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const calendarDays = [];

  for (let i = 0; i < 42; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    calendarDays.push(day);
  }

  calendarGrid.innerHTML = '';

  // Header row
  const headerRow = document.createElement('div');
  headerRow.className = 'calendar-row';
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  days.forEach(day => {
    const cell = document.createElement('div');
    cell.className = 'calendar-cell header';
    cell.textContent = day;
    headerRow.appendChild(cell);
  });
  calendarGrid.appendChild(headerRow);

  // Days grid
  let weekRow = document.createElement('div');
  weekRow.className = 'calendar-row';

  calendarDays.forEach((day, index) => {
    const cell = document.createElement('div');
    cell.className = 'calendar-cell';

    const dayNum = day.getDate();
    const monthNum = day.getMonth();
    const yearNum = day.getFullYear();

    const dateString = `${yearNum}-${(monthNum + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;

    cell.textContent = dayNum;

    // Highlight today
    if (day.toDateString() === today.toDateString()) {
      cell.classList.add('today');
    }

    // Get tasks for this date
    const tasks = loadTasks();
    const dayTasks = tasks.filter(t => t.dueDate === dateString);

    if (dayTasks.length > 0) {
      const dot = document.createElement('div');
      dot.className = 'task-dot';
      cell.appendChild(dot);
    }

    weekRow.appendChild(cell);

    if ((index + 1) % 7 === 0) {
      calendarGrid.appendChild(weekRow);
      weekRow = document.createElement('div');
      weekRow.className = 'calendar-row';
    }
  });

  if (weekRow.children.length > 0) {
    calendarGrid.appendChild(weekRow);
  }
}

// Add new task
addBtn.addEventListener('click', () => {
  const title = newTaskInput.value.trim();
  const dueDate = dueDateInput.value;

  if (!title) {
    alert('Please enter a task!');
    return;
  }

  if (!dueDate) {
    alert('Please set a due date!');
    return;
  }

  const newTask = {
    id: Date.now(),
    title,
    dueDate,
    isCompleted: false
  };

  const tasks = loadTasks();
  tasks.push(newTask);
  saveTasks(tasks);
  renderCalendar();
  renderTasks();

  newTaskInput.value = '';
  dueDateInput.value = '';
});

// Toggle completion
function toggleComplete(id) {
  const tasks = loadTasks();
  const updatedTasks = tasks.map(task =>
    task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
  );
  saveTasks(updatedTasks);
  renderCalendar();
  renderTasks();
}

// Delete task
function deleteTask(id) {
  const tasks = loadTasks();
  const filteredTasks = tasks.filter(task => task.id !== id);
  saveTasks(filteredTasks);
  renderCalendar();
  renderTasks();
}

// Render tasks list
function renderTasks() {
  const tasks = loadTasks();
  const taskList = document.querySelector('.task-list ul');
  if (!taskList) return;

  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.innerHTML = '<li class="empty">No tasks yet.</li>';
    return;
  }

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.isCompleted ? 'completed' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.isCompleted;
    checkbox.addEventListener('change', () => toggleComplete(task.id));

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.title;

    const dueSpan = document.createElement('span');
    dueSpan.className = 'due-date';
    dueSpan.textContent = task.dueDate;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(dueSpan);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);
  });
}

// Dark mode toggle
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  darkModeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
});

// Login Form
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  const users = loadUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    currentUser = username;
    localStorage.setItem('currentUser', username);
    window.location.href = 'index.html';
  } else {
    errorDiv.textContent = 'Invalid username or password.';
    setTimeout(() => errorDiv.textContent = '', 3000);
  }
});

// Register Form
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value.trim();

  if (username === '' || password === '') {
    regErrorDiv.textContent = 'Please fill all fields.';
    setTimeout(() => regErrorDiv.textContent = '', 3000);
    return;
  }

  const users = loadUsers();
  const existingUser = users.find(u => u.username === username);

  if (existingUser) {
    regErrorDiv.textContent = 'Username already exists.';
    setTimeout(() => regErrorDiv.textContent = '', 3000);
    return;
  }

  users.push({ username, password });
  saveUsers(users);

  alert('Account created successfully! You can now log in.');
  window.location.href = 'login.html';
});

// Check login status on load
window.addEventListener('load', () => {
  currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    window.location.href = 'login.html';
  } else {
    renderCalendar();
    renderTasks();
  }

  if (document.body.classList.contains('dark-mode')) {
    darkModeToggle.textContent = '☀️ Light Mode';
  } else {
    darkModeToggle.textContent = '🌙 Dark Mode';
  }
});
