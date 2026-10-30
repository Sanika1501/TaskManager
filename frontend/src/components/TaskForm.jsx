import { useState } from 'react';

const empty = { title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' };

export default function TaskForm({ initial, onSubmit, onCancel, submitLabel = 'Add Task' }) {
  const [form, setForm] = useState({
    ...empty,
    ...initial,
    dueDate: initial?.dueDate ? initial.dueDate.slice(0, 10) : '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({ ...form, title: form.title.trim() });
      if (!initial) setForm(empty); // clear after creating
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <input
        name="title"
        placeholder="What needs to be done?"
        value={form.title}
        onChange={handleChange}
        maxLength={100}
        aria-label="Task title"
      />
      <textarea
        name="description"
        placeholder="Description (optional)"
        value={form.description}
        onChange={handleChange}
        maxLength={500}
        rows={2}
        aria-label="Task description"
      />

      <div className="form-row">
        <label>
          Priority
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label>
          Status
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label>
          Due date
          <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
        </label>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button className="btn btn-outline" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
