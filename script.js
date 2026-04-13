const DUE = new Date('2026-04-16T18:00:00Z');

const card        = document.querySelector('[data-testid="test-todo-card"]');
const timeEl      = document.getElementById('time-remaining');
const statusBadge = document.getElementById('status-badge');
const checkbox    = document.querySelector('[data-testid="test-todo-complete-toggle"]');
const editBtn     = document.querySelector('[data-testid="test-todo-edit-button"]');
const deleteBtn   = document.querySelector('[data-testid="test-todo-delete-button"]');

function friendlyRemaining(ms) {
  const s   = Math.round(ms / 1000);
  const abs = Math.abs(s);
  const overdue = s < 0;

  if (abs < 60)      return overdue ? 'Overdue by seconds' : 'Due now!';
  if (abs < 3600)    { const m = Math.round(abs / 60);   return overdue ? `Overdue by ${m}m`    : `Due in ${m} min`;  }
  if (abs < 86400)   { const h = Math.round(abs / 3600); return overdue ? `Overdue by ${h}h`    : `Due in ${h} hrs`;  }
  if (abs < 172800)  return overdue ? 'Overdue by 1 day' : 'Due tomorrow';
  const d = Math.round(abs / 86400);
  return overdue ? `Overdue by ${d} days` : `Due in ${d} days`;
}

function updateTime() {
  if (checkbox.checked) return;

  const diff = DUE - Date.now();
  const text = friendlyRemaining(diff);

  timeEl.textContent = text;
  timeEl.setAttribute('aria-label', 'Time remaining: ' + text);

  if (diff < 0) {
    timeEl.classList.add('overdue');
  } else {
    timeEl.classList.remove('overdue');
  }
}

function handleToggle() {
  if (checkbox.checked) {
    card.classList.add('done');
    statusBadge.textContent = 'Done';
    statusBadge.className   = 'status-done';
    statusBadge.setAttribute('aria-label', 'Status: Done');
    timeEl.textContent = 'Completed ✓';
    timeEl.classList.remove('overdue');
    card.classList.add('pulse');
    card.addEventListener('animationend', () => card.classList.remove('pulse'), { once: true });
  } else {
    card.classList.remove('done');
    statusBadge.textContent = 'In Progress';
    statusBadge.className   = 'status-in-progress';
    statusBadge.setAttribute('aria-label', 'Status: In Progress');
    updateTime();
  }
}

function handleEdit() {
  console.log('edit clicked');
  const orig = editBtn.innerHTML;
  editBtn.innerHTML = '✅ Saved!';
  editBtn.disabled  = true;
  setTimeout(() => {
    editBtn.innerHTML = orig;
    editBtn.disabled  = false;
  }, 1200);
}

function handleDelete() {
  console.log('delete clicked');
  if (confirm('Delete this task?')) {
    card.style.transition = 'opacity 0.4s, transform 0.4s';
    card.style.opacity    = '0';
    card.style.transform  = 'scale(0.92) translateY(10px)';
    setTimeout(() => {
      card.style.opacity   = '1';
      card.style.transform = '';
    }, 800);
  }
}

// ── Event Listeners ──
checkbox.addEventListener('change', handleToggle);
editBtn.addEventListener('click', handleEdit);
deleteBtn.addEventListener('click', handleDelete);

// ── Init ──
updateTime();
setInterval(updateTime, 30000);