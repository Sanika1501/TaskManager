import { useState } from "react";
import TaskForm from "./TaskForm.jsx";
import { taskService, getErrorMessage } from "../services/api.js";

export default function TaskItem({ task, onUpdate, onDelete, onError }) {
  const [editing, setEditing] = useState(false);
  const [editTask, setEditTask] = useState(task);
  const [busy, setBusy] = useState(false);

  const isCompleted = task.completed === true || task.status === "completed";
  const created = task.createdAt
    ? new Date(task.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  // Fetch the latest version of the task (GET /tasks/:id) before editing
  const startEdit = async () => {
    setBusy(true);
    try {
      const fresh = await taskService.getById(task._id);
      setEditTask(fresh);
      setEditing(true);
    } catch (err) {
      onError(getErrorMessage(err, "Could not load task"));
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async (values) => {
    await onUpdate(task._id, values, "Task updated successfully");
    setEditing(false);
  };

  const toggle = async () => {
    setBusy(true);
    try {
      await onUpdate(
        task._id,
        { completed: !isCompleted },
        isCompleted ? "Task marked as pending" : "Task completed 🎉"
      );
    } catch {
      /* handled in parent */
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this task?")) return;
    setBusy(true);
    try {
      await onDelete(task._id);
    } catch {
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <div className="task-card editing">
        <TaskForm
          initialValues={editTask}
          onSubmit={saveEdit}
          onCancel={() => setEditing(false)}
          submitLabel="Save Changes"
          showCompleted
        />
      </div>
    );
  }

  return (
    <div className={`task-card ${isCompleted ? "done" : ""}`}>
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`badge ${isCompleted ? "badge-success" : "badge-warning"}`}>
          {isCompleted ? "Completed" : "Pending"}
        </span>
      </div>
      {task.description && <p className="task-desc">{task.description}</p>}
      <small className="task-date">Created: {created}</small>
      <div className="task-actions">
        <button
          className={`btn btn-sm ${isCompleted ? "btn-warning" : "btn-success"}`}
          onClick={toggle}
          disabled={busy}
        >
          {isCompleted ? "Mark Pending" : "Complete"}
        </button>
        <button className="btn btn-sm btn-outline" onClick={startEdit} disabled={busy}>
          Edit
        </button>
        <button className="btn btn-sm btn-danger" onClick={remove} disabled={busy}>
          Delete
        </button>
      </div>
    </div>
  );
}
