const path = require('path');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const frontendPath = path.join(__dirname, '..', 'Frontend');

app.use(cors());
app.use(express.json());
app.use(express.static(frontendPath));

let todos = [
  {
    id: crypto.randomUUID(),
    text: 'Welcome! Add your first task.',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

app.get('/api/todos', (req, res) => {
  res.json({ todos });
});

app.post('/api/todos', (req, res) => {
  const text = String(req.body?.text || '').trim();
  if (!text) {
    return res.status(400).json({ error: 'Text is required.' });
  }
  const todo = {
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  todos.unshift(todo);
  res.status(201).json({ todo });
});

app.patch('/api/todos/:id', (req, res) => {
  const id = req.params.id;
  const todo = todos.find(t => t.id === id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found.' });
  }
  if (typeof req.body?.text === 'string') {
    const nextText = req.body.text.trim();
    if (!nextText) {
      return res.status(400).json({ error: 'Text cannot be empty.' });
    }
    todo.text = nextText;
  }
  if (typeof req.body?.completed === 'boolean') {
    todo.completed = req.body.completed;
  }
  res.json({ todo });
});

app.delete('/api/todos/:id', (req, res) => {
  const id = req.params.id;
  const before = todos.length;
  todos = todos.filter(t => t.id !== id);
  if (todos.length === before) {
    return res.status(404).json({ error: 'Todo not found.' });
  }
  res.status(204).send();
});

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
