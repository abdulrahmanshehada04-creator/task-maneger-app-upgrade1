// DOM Elements
const newTaskInput = document.getElementById('newTaskInput');
const noteInput = document.getElementById('noteInput');
const dueDateInput = document.getElementById('dueDateInput');
const addBtn = document.getElementById('addBtn');
const calendarGrid = document.getElementById('calendarGrid');
const tasksList = document.getElementById('tasksList');
const selectedDateLabel = document.getElementById('selectedDateLabel');
const darkModeToggle = document.getElementById('darkModeToggle');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const errorDiv = document.getElementById('error');
const regErrorDiv = document.getElementById('regError');

// Current user
let currentUser = localStorage.getItem('currentUser') || null;

// Load users
function loadUsers() {
  const usersJSON = localStorage.getItem('users');
  return usersJSON ? JSON.parse(usersJSON) : [];
}

// Save users
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

// Load tasks
function loadTasks() {
  const tasksJSON = localStorage.getItem(`tasks_${currentUser}`);
  return tasksJSON ? JSON.parse(tasksJSON) : [];
}

// Save tasks
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

    if (day.toDateString() === today.toDateString()) {
      cell.classList.add('today');
    }

    const tasks = loadTasks();
    const dayTasks = tasks.filter(t => t.dueDate === dateString);

    if (dayTasks.length > 0) {
      const dot = document.createElement('div');
      dot.className = 'task-dot';
      cell.appendChild(dot);
    }

    // Add click event to show tasks below
    cell.addEventListener('click', () => {
      selectedDateLabel.textContent = `Tasks for ${formatDate(dateString)}`;
      renderTasksForDate(dateString);
    });

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

// Format date (e.g., "Aug 15, 2025")
function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[parseInt(month) - 1];
  return `${monthName} ${day}, ${year}`;
}

// Render tasks for selected date
function renderTasksForDate(dateString) {
  const tasks = loadTasks();
  const filteredTasks = tasks.filter(t => t.dueDate === dateString);

  tasksList.innerHTML = '';

  if (filteredTasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-message';
    empty.textContent = 'No tasks for this date.';
    tasksList.appendChild(empty);
    return;
  }

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.isCompleted ? 'completed' : ''} ${new Date(task.dueDate) < new Date() ? 'past' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.isCompleted;
    checkbox.classList.add('done-checkbox');
    checkbox.addEventListener('change', () => toggleComplete(task.id));

    const titleSpan = document.createElement('span');
    titleSpan.className = 'task-text';
    titleSpan.textContent = task.title;

    const noteSpan = document.createElement('span');
    noteSpan.className = 'note';
    noteSpan.textContent = task.note ? `Note: ${task.note}` : '';

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = '✏️';
    editBtn.addEventListener('click', () => editTask(task.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(titleSpan);
    li.appendChild(noteSpan);
    li.appendChild(actionsDiv);

    tasksList.appendChild(li);
  });
}

// Toggle completion
function toggleComplete(id) {
  const tasks = loadTasks();
  const updatedTasks = tasks.map(task =>
    task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
  );
  saveTasks(updatedTasks);
  renderCalendar(); // Re-render calendar to update status colors
  const selectedDate = tasksList.querySelector('.task-item')?.parentElement?.parentElement?.parentElement?.querySelector('#selectedDateLabel')?.textContent;
  if (selectedDate) {
    const dateStr = selectedDate.replace('Tasks for ', '');
    const match = dateStr.match(/(\w+) (\d+), (\d+)/);
    if (match) {
      const monthMap = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
      const month = monthMap[match[1]];
      const day = match[2];
      const year = match[3];
      const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      renderTasksForDate(dateString);
    }
  }
}

// Edit task
function editTask(id) {
  const tasks = loadTasks();
  const task = tasks.find(t => t.id === id);
  const newTitle = prompt('Edit task:', task.title);
  if (newTitle !== null && newTitle.trim() !== '') {
    task.title = newTitle.trim();
    saveTasks(tasks);
    renderCalendar();
    renderTasksForDate(task.dueDate);
  }
}

// Delete task
function deleteTask(id) {
  const tasks = loadTasks();
  const filteredTasks = tasks.filter(task => task.id !== id);
  saveTasks(filteredTasks);
  renderCalendar();
  const selectedDate = tasksList.querySelector('.task-item')?.parentElement?.parentElement?.parentElement?.querySelector('#selectedDateLabel')?.textContent;
  if (selectedDate) {
    const dateStr = selectedDate.replace('Tasks for ', '');
    const match = dateStr.match(/(\w+) (\d+), (\d+)/);
    if (match) {
      const monthMap = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
      const month = monthMap[match[1]];
      const day = match[2];
      const year = match[3];
      const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      renderTasksForDate(dateString);
    }
  }
}

// Add new task
addBtn.addEventListener('click', () => {
  const title = newTaskInput.value.trim();
  const note = noteInput.value.trim();
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
    note,
    dueDate,
    isCompleted: false
  };

  const tasks = loadTasks();
  tasks.push(newTask);
  saveTasks(tasks);
  renderCalendar();

  newTaskInput.value = '';
  noteInput.value = '';
  dueDateInput.value = '';
});

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
  }

  if (document.body.classList.contains('dark-mode')) {
    darkModeToggle.textContent = '☀️ Light Mode';
  } else {
    darkModeToggle.textContent = '🌙 Dark Mode';
  }
});
