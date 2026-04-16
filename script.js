// ── State ──────────────────────────────────────────────
const state = {
	title: 'Redesign the onboarding flow',
	description: 'Update the user onboarding screens to align with the new design system. Includes updated copy, revised step order, and new illustration assets from the brand team. The goal is to reduce drop-off during sign-up by simplifying the first three steps and making the value proposition clearer upfront.',
	priority: 'High',
	status: 'In Progress',
	dueDate: new Date('2026-04-17T23:59:00'),
	expanded: false,
};

const COLLAPSE_THRESHOLD = 120; // chars before description is collapsed by default

// ── DOM refs ────────────────────────────────────────────
const card = document.getElementById('todo-card');
const viewMode = document.getElementById('view-mode');
const editMode = document.getElementById('edit-mode');

const titleEl = document.getElementById('todo-title');
const descriptionEl = document.getElementById('todo-description');
const priorityBadge = document.getElementById('priority-badge');
const priorityIndicator = document.getElementById('priority-indicator');
const statusBadge = document.getElementById('status-badge');
const dueDateDisplay = document.getElementById('due-date-display');
const timeRemainingEl = document.getElementById('time-remaining');
const overdueIndicator = document.getElementById('overdue-indicator');
const statusControl = document.getElementById('status-control');
const checkbox = document.getElementById('todo-complete');
const collapsible = document.getElementById('collapsible-section');
const expandToggle = document.getElementById('expand-toggle');

const editBtn = document.getElementById('edit-btn');
const deleteBtn = document.getElementById('delete-btn');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');

const editTitleInput = document.getElementById('edit-title');
const editDescInput = document.getElementById('edit-description');
const editPrioritySelect = document.getElementById('edit-priority');
const editDueDateInput = document.getElementById('edit-due-date');

// ── Helpers ─────────────────────────────────────────────
function friendlyRemaining(ms) {
	const s = Math.round(ms / 1000);
	const abs = Math.abs(s);
	const past = s < 0;

	if (abs < 60) return past ? 'Overdue by seconds' : 'Due now!';
	if (abs < 3600) { const m = Math.round(abs / 60); return past ? `Overdue by ${m} minute${m > 1 ? 's' : ''}` : `Due in ${m} minute${m > 1 ? 's' : ''}`; }
	if (abs < 86400) { const h = Math.round(abs / 3600); return past ? `Overdue by ${h} hour${h > 1 ? 's' : ''}` : `Due in ${h} hour${h > 1 ? 's' : ''}`; }
	if (abs < 172800) return past ? 'Overdue by 1 day' : 'Due tomorrow';
	const d = Math.round(abs / 86400);
	return past ? `Overdue by ${d} days` : `Due in ${d} days`;
}

function formatDisplayDate(d) {
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function toDatetimeLocal(d) {
	// format: YYYY-MM-DDTHH:MM (local)
	const pad = n => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function priorityClass(p) {
	return { High: 'priority-high', Medium: 'priority-medium', Low: 'priority-low' }[p] || 'priority-low';
}

function priorityIndicatorClass(p) {
	return { High: 'pi-high', Medium: 'pi-medium', Low: 'pi-low' }[p] || 'pi-low';
}

function statusClass(s) {
	return { Pending: 'status-pending', 'In Progress': 'status-in-progress', Done: 'status-done' }[s] || 'status-pending';
}

// ── Render ──────────────────────────────────────────────
function renderView() {
	const isDone = state.status === 'Done';
	const isOverdue = !isDone && state.dueDate < new Date();

	// Title & description
	titleEl.textContent = state.title;
	descriptionEl.textContent = state.description;

	// Priority
	priorityBadge.textContent = state.priority;
	priorityBadge.className = `badge ${priorityClass(state.priority)}`;
	priorityBadge.setAttribute('aria-label', `Priority: ${state.priority}`);
	priorityIndicator.className = `priority-indicator ${priorityIndicatorClass(state.priority)}`;

	// Status badge + control
	statusBadge.textContent = state.status;
	statusBadge.className = `badge ${statusClass(state.status)}`;
	statusBadge.setAttribute('aria-label', `Status: ${state.status}`);
	statusControl.value = state.status;

	// Checkbox
	checkbox.checked = isDone;

	// Done visual
	card.classList.toggle('done', isDone);

	// Due date display
	dueDateDisplay.textContent = `Due ${formatDisplayDate(state.dueDate)}`;
	dueDateDisplay.setAttribute('datetime', state.dueDate.toISOString());

	// Overdue indicator
	card.classList.toggle('overdue-card', isOverdue);
	overdueIndicator.classList.toggle('hidden', !isOverdue);

	// Time remaining
	if (isDone) {
		timeRemainingEl.textContent = 'Completed ✓';
		timeRemainingEl.classList.remove('overdue');
	} else {
		updateTime();
	}

	// Expand/collapse
	setupCollapse();
}

function updateTime() {
	if (state.status === 'Done') return;
	const diff = state.dueDate - Date.now();
	const text = friendlyRemaining(diff);
	timeRemainingEl.textContent = text;
	timeRemainingEl.setAttribute('aria-label', `Time remaining: ${text}`);
	timeRemainingEl.classList.toggle('overdue', diff < 0);
	overdueIndicator.classList.toggle('hidden', diff >= 0);
	card.classList.toggle('overdue-card', diff < 0);
}

// ── Expand / Collapse ───────────────────────────────────
function setupCollapse() {
	const isLong = state.description.length > COLLAPSE_THRESHOLD;
	expandToggle.classList.toggle('hidden', !isLong);

	if (!isLong) {
		collapsible.classList.remove('collapsed');
		collapsible.classList.add('expanded');
		collapsible.setAttribute('aria-hidden', 'false');
		return;
	}

	if (state.expanded) {
		collapsible.classList.remove('collapsed');
		collapsible.classList.add('expanded');
		expandToggle.textContent = 'Show less ▴';
		expandToggle.setAttribute('aria-expanded', 'true');
		collapsible.setAttribute('aria-hidden', 'false');
	} else {
		collapsible.classList.add('collapsed');
		collapsible.classList.remove('expanded');
		expandToggle.textContent = 'Show more ▾';
		expandToggle.setAttribute('aria-expanded', 'false');
		collapsible.setAttribute('aria-hidden', 'true');
	}
}

expandToggle.addEventListener('click', () => {
	state.expanded = !state.expanded;
	setupCollapse();
});

// ── Status Control ──────────────────────────────────────
statusControl.addEventListener('change', () => {
	setStatus(statusControl.value);
});

function setStatus(newStatus) {
	state.status = newStatus;
	renderView();
	if (newStatus === 'Done') {
		card.classList.add('pulse');
		card.addEventListener('animationend', () => card.classList.remove('pulse'), { once: true });
	}
}

// ── Checkbox ────────────────────────────────────────────
checkbox.addEventListener('change', () => {
	if (checkbox.checked) {
		setStatus('Done');
	} else {
		setStatus('Pending');
	}
});

// ── Edit Mode ───────────────────────────────────────────
let snapshot = null; // saved state before editing

function openEditMode() {
	// Snapshot current state
	snapshot = { ...state };

	// Populate form
	editTitleInput.value = state.title;
	editDescInput.value = state.description;
	editPrioritySelect.value = state.priority;
	editDueDateInput.value = toDatetimeLocal(state.dueDate);

	viewMode.classList.add('hidden');
	editMode.classList.remove('hidden');

	// Focus first input
	editTitleInput.focus();
}

function closeEditMode(restore) {
	if (restore && snapshot) {
		Object.assign(state, snapshot);
	}
	snapshot = null;
	editMode.classList.add('hidden');
	viewMode.classList.remove('hidden');
	renderView();
	// Return focus to edit button
	editBtn.focus();
}

function saveEdit() {
	const newTitle = editTitleInput.value.trim();
	const newDesc = editDescInput.value.trim();
	const newDue = new Date(editDueDateInput.value);

	if (!newTitle) { editTitleInput.focus(); return; }
	if (isNaN(newDue.getTime())) { editDueDateInput.focus(); return; }

	state.title = newTitle;
	state.description = newDesc;
	state.priority = editPrioritySelect.value;
	state.dueDate = newDue;
	state.expanded = false; // re-evaluate on render

	closeEditMode(false);
}

editBtn.addEventListener('click', openEditMode);
saveBtn.addEventListener('click', saveEdit);
cancelBtn.addEventListener('click', () => closeEditMode(true));

// Focus trap inside edit form
editMode.addEventListener('keydown', e => {
	if (e.key !== 'Tab') return;
	const focusable = Array.from(editMode.querySelectorAll(
		'input, textarea, select, button:not([disabled])'
	)).filter(el => !el.closest('.hidden'));
	const first = focusable[0];
	const last = focusable[focusable.length - 1];
	if (e.shiftKey && document.activeElement === first) {
		e.preventDefault(); last.focus();
	} else if (!e.shiftKey && document.activeElement === last) {
		e.preventDefault(); first.focus();
	}
});

// Close edit on Escape
editMode.addEventListener('keydown', e => {
	if (e.key === 'Escape') closeEditMode(true);
});

// ── Delete ──────────────────────────────────────────────
deleteBtn.addEventListener('click', () => {
	console.log('delete clicked');
	if (confirm('Delete this task?')) {
		card.style.transition = 'opacity 0.4s, transform 0.4s';
		card.style.opacity = '0';
		card.style.transform = 'scale(0.92) translateY(10px)';
		setTimeout(() => {
			card.style.opacity = '1';
			card.style.transform = '';
		}, 900);
	}
});

// ── Timer ───────────────────────────────────────────────
setInterval(updateTime, 30000);

// ── Init ────────────────────────────────────────────────
renderView();