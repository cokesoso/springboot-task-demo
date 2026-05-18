const TOKEN_KEY = 'demo_token';
const EMAIL_KEY = 'demo_email';

let tasks = [];
let editingTaskId = null;

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setAuth(token, email) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, email);
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

async function parseError(res) {
  try {
    const data = await res.json();
    return data.message || `请求失败 (${res.status})`;
  } catch {
    return (await res.text()) || `请求失败 (${res.status})`;
  }
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(path, { ...options, headers });
  if (res.status === 401 || res.status === 403) {
    clearAuth();
    showApp(false);
    showToast('登录已过期，请重新登录', 'error');
    throw new Error('Unauthorized');
  }
  return res;
}

function showApp(loggedIn) {
  document.getElementById('authSection').hidden = loggedIn;
  document.getElementById('appSection').hidden = !loggedIn;
  if (loggedIn) {
    document.getElementById('userEmail').textContent = localStorage.getItem(EMAIL_KEY) || '';
  }
}

function resetTaskForm() {
  editingTaskId = null;
  document.getElementById('taskId').value = '';
  document.getElementById('taskForm').reset();
  document.getElementById('taskFormTitle').innerHTML = '<span>➕</span> 新建任务';
  document.getElementById('taskSubmitBtn').textContent = '创建任务';
  document.getElementById('cancelEditBtn').hidden = true;
}

function startEditTask(task) {
  editingTaskId = task.id;
  document.getElementById('taskId').value = task.id;
  document.getElementById('taskTitle').value = task.title || '';
  document.getElementById('taskDescription').value = task.description || '';
  document.getElementById('taskDueDate').value = task.dueDate || '';
  document.getElementById('taskFormTitle').innerHTML = '<span>✏️</span> 编辑任务';
  document.getElementById('taskSubmitBtn').textContent = '保存修改';
  document.getElementById('cancelEditBtn').hidden = false;
  document.querySelector('.task-form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function handleAuth(path, email, password, successMsg) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    showToast(await parseError(res), 'error');
    return;
  }
  const data = await res.json();
  setAuth(data.token, data.email);
  showApp(true);
  showToast(successMsg, 'success');
  resetTaskForm();
  await loadTasks();
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  try {
    await handleAuth('/api/auth/register', email, password, '注册成功，已自动登录');
    e.target.reset();
  } catch {
    showToast('网络错误，请确认后端与 MongoDB 已启动', 'error');
  }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  try {
    await handleAuth('/api/auth/login', email, password, '登录成功');
    e.target.reset();
  } catch {
    showToast('网络错误，请确认后端与 MongoDB 已启动', 'error');
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  clearAuth();
  tasks = [];
  showApp(false);
  resetTaskForm();
  showToast('已退出登录', 'info');
});

document.getElementById('cancelEditBtn').addEventListener('click', resetTaskForm);

document.getElementById('taskForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();
  const dueDate = document.getElementById('taskDueDate').value || null;

  if (!title) {
    showToast('请填写任务标题', 'error');
    return;
  }

  const body = { title, description: description || null, dueDate };

  try {
    const isEdit = Boolean(editingTaskId);
    const res = await api(isEdit ? `/api/tasks/${editingTaskId}` : '/api/tasks', {
      method: isEdit ? 'PUT' : 'POST',
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      showToast(await parseError(res), 'error');
      return;
    }
    showToast(isEdit ? '任务已更新' : '任务已创建', 'success');
    resetTaskForm();
    await loadTasks();
  } catch (err) {
    if (err.message !== 'Unauthorized') {
      showToast('操作失败，请稍后重试', 'error');
    }
  }
});

async function toggleComplete(task) {
  try {
    const res = await api(`/api/tasks/${task.id}`, {
      method: 'PUT',
      body: JSON.stringify({ completed: !task.completed }),
    });
    if (!res.ok) {
      showToast(await parseError(res), 'error');
      return;
    }
    showToast(task.completed ? '已标记为未完成' : '已标记为完成', 'success');
    await loadTasks();
  } catch (err) {
    if (err.message !== 'Unauthorized') {
      showToast('更新状态失败', 'error');
    }
  }
}

async function deleteTask(taskId) {
  if (!confirm('确定删除该任务吗？')) return;
  try {
    const res = await api(`/api/tasks/${taskId}`, { method: 'DELETE' });
    if (res.status !== 204 && !res.ok) {
      showToast(await parseError(res), 'error');
      return;
    }
    showToast('任务已删除', 'success');
    if (editingTaskId === taskId) resetTaskForm();
    await loadTasks();
  } catch (err) {
    if (err.message !== 'Unauthorized') {
      showToast('删除失败', 'error');
    }
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function getFilteredTasks() {
  const filter = document.getElementById('statusFilter').value;
  if (filter === 'pending') return tasks.filter((t) => !t.completed);
  if (filter === 'completed') return tasks.filter((t) => t.completed);
  return tasks;
}

function renderTasks() {
  const list = document.getElementById('taskList');
  const empty = document.getElementById('emptyState');
  const filtered = getFilteredTasks();

  list.innerHTML = '';
  if (!filtered.length) {
    empty.hidden = false;
    empty.textContent = tasks.length ? '当前筛选下暂无任务' : '暂无任务，创建一条吧';
    return;
  }

  empty.hidden = true;
  filtered.forEach((task) => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.innerHTML = `
      <div class="task-main">
        <div class="task-title-row">
          <h3>${escapeHtml(task.title)}</h3>
          <span class="badge ${task.completed ? 'badge-done' : 'badge-pending'}">
            ${task.completed ? '已完成' : '未完成'}
          </span>
        </div>
        ${task.description ? `<p class="task-desc">${escapeHtml(task.description)}</p>` : ''}
        <p class="task-meta">截止日期：${task.dueDate || '未设置'}</p>
      </div>
      <div class="task-actions">
        <button type="button" class="btn btn-secondary btn-sm" data-action="toggle">${task.completed ? '标为未完成' : '标为完成'}</button>
        <button type="button" class="btn btn-secondary btn-sm" data-action="edit">编辑</button>
        <button type="button" class="btn btn-danger btn-sm" data-action="delete">删除</button>
      </div>
    `;

    li.querySelector('[data-action="toggle"]').addEventListener('click', () => toggleComplete(task));
    li.querySelector('[data-action="edit"]').addEventListener('click', () => startEditTask(task));
    li.querySelector('[data-action="delete"]').addEventListener('click', () => deleteTask(task.id));
    list.appendChild(li);
  });
}

async function loadTasks() {
  try {
    const res = await api('/api/tasks');
    if (!res.ok) {
      showToast(await parseError(res), 'error');
      return;
    }
    tasks = await res.json();
    renderTasks();
  } catch (err) {
    if (err.message !== 'Unauthorized') {
      showToast('加载任务失败', 'error');
    }
  }
}

document.getElementById('refreshBtn').addEventListener('click', loadTasks);
document.getElementById('statusFilter').addEventListener('change', renderTasks);

if (getToken()) {
  showApp(true);
  loadTasks();
} else {
  showApp(false);
}
