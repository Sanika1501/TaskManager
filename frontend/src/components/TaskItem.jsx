import { useState } from 'react';
import TaskForm from './TaskForm.jsx';

const STATUS_LABEL = { todo: 'To do', 'in-progress': 'In progress', completed: 'Completed' };

export default function TaskItem({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const done = task.status === 'completed';
  const overdue =
    task.dueDate && !done && new Date(task.dueDate) < new Date(new Date().toDateString());

  const toggleComplete = async () => {
    setBusy(true);
    try {
      await onUpdate(task._id, { status: done ? 'todo' : 'completed' });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setBusy(true);
    try {
      await onDelete(task._id);
    } catch {
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <li className="task-card">
        <TaskForm
          initial={task}
          submitLabel="Save Changes"
          onCancel={() => setEditing(false)}
          onSubmit={async (data) => {
            await onUpdate(task._id, data);
            setEditing(false);
          }}
        />
      </li>
    );
  }

  return (
    <li className={`task-card priority-${task.priority} ${done ? 'is-done' : ''}`}>
      <input
        type="checkbox"
        checked={done}
        onChange={toggleComplete}
        disabled={busy}
        aria-label={`Mark "${task.title}" as ${done ? 'not completed' : 'completed'}`}
      />
      <div className="task-body">
        <h3 className="task-title">{task.title}</h3>
        {task.description && <p className="task-desc">{task.description}</p>}
        <div className="badges">
          <span className={`badge badge-${task.priority}`}>{task.priority} priority</span>
          <span className={`badge badge-status-${task.status}`}>{STATUS_LABEL[task.status]}</span>
          {task.dueDate && (
            <span className={`badge ${overdue ? 'badge-overdue' : 'badge-date'}`}>
              {overdue ? 'Overdue: ' : 'Due: '}
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <div className="task-actions">
        <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)} disabled={busy}>
          Edit
        </button>
        <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={busy}>
          Delete
        </button>
      </div>
    </li>
  );
}
