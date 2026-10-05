import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import TaskForm from "../components/TaskForm.jsx";
import TaskList from "../components/TaskList.jsx";
import { taskService, getErrorMessage } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setTasks(await taskService.getAll());
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load tasks"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = async (values) => {
    try {
      const created = await taskService.create(values);
      setTasks((prev) => [created, ...prev]);
      setError("");
      showSuccess("Task created successfully");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create task"));
      throw err;
    }
  };

  const handleUpdate = async (id, values, message = "Task updated") => {
    try {
      const updated = await taskService.update(id, values);
      setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, ...updated } : t)));
      setError("");
      showSuccess(message);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update task"));
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await taskService.remove(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      setError("");
      showSuccess("Task deleted");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete task"));
      throw err;
    }
  };

  const completedCount = tasks.filter((t) => t.completed === true || t.status === "completed").length;

  return (
    <>
      <Navbar />
      <main className="container">
        <header className="dashboard-header">
          <h1>Hello, {user?.name || "there"} 👋</h1>
          <p>
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} · {completedCount} completed ·{" "}
            {tasks.length - completedCount} pending
          </p>
        </header>

        {success && <div className="alert alert-success">{success}</div>}
        {error && (
          <div className="alert alert-error">
            {error}
            <button className="link-btn" onClick={fetchTasks}>
              Retry
            </button>
          </div>
        )}

        <div className="dashboard-grid">
          <section className="panel">
            <h2>Add New Task</h2>
            <TaskForm onSubmit={handleCreate} submitLabel="Add Task" />
          </section>

          <section className="panel">
            <h2>Your Tasks</h2>
            {loading ? (
              <div className="center-box">
                <div className="spinner" />
                <p>Loading tasks...</p>
              </div>
            ) : (
              <TaskList
                tasks={tasks}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onError={setError}
              />
            )}
          </section>
        </div>
      </main>
    </>
  );
}
