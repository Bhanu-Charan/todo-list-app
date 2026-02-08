const listEl = document.querySelector('#todo-list');
const formEl = document.querySelector('#todo-form');
const inputEl = document.querySelector('#todo-input');
const remainingEl = document.querySelector('#remaining-count');
const clearCompletedBtn = document.querySelector('#clear-completed');

async function fetchTodos() {
  const res = await fetch('/api/todos');
  const data = await res.json();
  return data.todos;
}

async function addTodo(text) {
  const res = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to add todo.');
  }
  return res.json();
}

async function updateTodo(id, payload) {
  const res = await fetch(`/api/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to update todo.');
  }
  return res.json();
}

async function deleteTodo(id) {
  const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete todo.');
  }
}

function createTodoItem(todo) {
  const li = document.createElement('li');
  li.className = `todo-item${todo.completed ? ' completed' : ''}`;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.completed;
  checkbox.addEventListener('change', async () => {
    await updateTodo(todo.id, { completed: checkbox.checked });
    await refresh();
  });

  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.value = todo.text;
  textInput.className = 'text';
  textInput.addEventListener('change', async () => {
    const next = textInput.value.trim();
    if (!next) {
      textInput.value = todo.text;
      return;
    }
    await updateTodo(todo.id, { text: next });
    await refresh();
  });

  const actions = document.createElement('div');
  actions.className = 'todo-actions';

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', async () => {
    await deleteTodo(todo.id);
    await refresh();
  });

  actions.appendChild(deleteBtn);

  li.appendChild(checkbox);
  li.appendChild(textInput);
  li.appendChild(actions);

  return li;
}

function updateRemaining(todos) {
  const remaining = todos.filter(todo => !todo.completed).length;
  remainingEl.textContent = remaining;
}

async function refresh() {
  const todos = await fetchTodos();
  listEl.innerHTML = '';
  todos.forEach(todo => listEl.appendChild(createTodoItem(todo)));
  updateRemaining(todos);
}

formEl.addEventListener('submit', async event => {
  event.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;
  try {
    await addTodo(text);
    inputEl.value = '';
    await refresh();
  } catch (err) {
    alert(err.message);
  }
});

clearCompletedBtn.addEventListener('click', async () => {
  const todos = await fetchTodos();
  const completed = todos.filter(todo => todo.completed);
  await Promise.all(completed.map(todo => deleteTodo(todo.id)));
  await refresh();
});

refresh();
