document.documentElement.classList.add('js');

// ---------- Mobile nav ----------
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');

toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});

// ---------- Task state ----------
const STORAGE_KEY = 'studynest-tasks';
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const errorEl = document.getElementById('form-error');
const list = document.getElementById('task-list');
const emptyEl = document.getElementById('empty');
const countEl = document.getElementById('count');
const chips = document.querySelectorAll('.chip');

let tasks = load();
let filter = 'all';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch { /* storage unavailable: app still works for this session */ }
}

function render() {
  const visible = tasks.filter((t) =>
    filter === 'all' ? true : filter === 'done' ? t.done : !t.done
  );

  list.replaceChildren(...visible.map(buildItem));
  emptyEl.hidden = visible.length > 0;

  const left = tasks.filter((t) => !t.done).length;
  countEl.textContent = `${left} ${left === 1 ? 'task' : 'tasks'} left`;
}

function buildItem(task) {
  const li = document.createElement('li');
  li.className = 'task' + (task.done ? ' done' : '');

  const label = document.createElement('label');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = task.done;
  box.addEventListener('change', () => {
    task.done = box.checked;
    save();
    render();
  });

  const text = document.createElement('span');
  text.textContent = task.text;          // textContent avoids HTML injection
  label.append(box, text);

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'delete';
  del.textContent = 'Delete';
  del.setAttribute('aria-label', `Delete task: ${task.text}`);
  del.addEventListener('click', () => {
    tasks = tasks.filter((t) => t.id !== task.id);
    save();
    render();
  });

  li.append(label, del);
  return li;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = input.value.trim();
  if (!value) {
    errorEl.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
    return;
  }
  errorEl.hidden = true;
  input.removeAttribute('aria-invalid');
  tasks.push({ id: Date.now(), text: value, done: false });
  input.value = '';
  save();
  render();
});

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    filter = chip.dataset.filter;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    render();
  });
});

render();