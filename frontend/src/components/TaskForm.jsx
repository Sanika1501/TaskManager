import { useState } from "react";

export default function TaskForm({
  initialValues = { title: "", description: "", completed: false },
  onSubmit,
  onCancel,
  submitLabel = "Add Task",
  showCompleted = false,
}) {
  const [title, setTitle] = useState(initialValues.title || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [completed, setCompleted] = useState(!!initialValues.completed);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), completed });
      if (!onCancel) {
        // create mode: reset the form
        setTitle("");
        setDescription("");
        setCompleted(false);
      }
    } catch {
      // parent shows the error message
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          maxLength={100}
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add some details (optional)"
        />
      </div>
      {showCompleted && (
        <label className="checkbox">
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
          />
          Mark as completed
        </label>
      )}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
