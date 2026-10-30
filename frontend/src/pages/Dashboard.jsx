import { useEffect, useState, useCallback, useMemo } from 'react';
import api, { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import TaskForm from '../components/TaskForm.jsx';
import TaskItem from '../components/TaskItem.jsx';
import Loader from '../components/Loader.jsx';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.tasks);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create / update / delete update the UI immediately after the API confirms
  const addTask = async (data) => {
    try {
      const res = await api.post('/tasks', data);
      setTasks((prev) => [res.data.task, ...prev]);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  };

  const updateTask = async (id, data) => {
    try {
      const res = await api.put(`/tasks/${id}`, data);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data.task : t)));
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw new Error(message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  };

  const stats = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      progress: tasks.filter((t) => t.status === 'in-progress').length,
      done: tasks.filter((t) => t.status === 'completed').length,
    }),
    [tasks]
  );

  const visible = tasks.filter(
    (t) =>
      (!statusFilter || t.status === statusFilter) &&
      t.title.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="dashboard">
      <h1>Your Tasks</h1>
      <p className="muted">Welcome, {user.name}. Here is what is on your plate.</p>

      <div className="stats">
        <div className="stat">
          <strong>{stats.total}</strong>
          <span>Total</span>
        </div>
        <div className="stat">
          <strong>{stats.todo}</strong>
          <span>To do</span>
        </div>
        <div className="stat">
          <strong>{stats.progress}</strong>
          <span>In progress</span>
        </div>
        <div className="stat">
          <strong>{stats.done}</strong>
          <span>Completed</span>
        </div>
      </div>

      <section className="card">
        <h2>Add a new task</h2>
        <TaskForm onSubmit={addTask} />
      </section>

      <section className="card">
        <div className="toolbar">
          <input
            className="search"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search tasks"
          />
          <div className="filters">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                className={`chip ${statusFilter === f.value ? 'chip-active' : ''}`}
                onClick={() => setStatusFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}{' '}
            <button className="link-btn" onClick={fetchTasks}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <Loader text="Loading your tasks..." />
        ) : tasks.length === 0 ? (
          <div className="empty">
            <p className="empty-icon">📝</p>
            <p>No tasks yet. Add your first task above!</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="empty">
            <p>No tasks match your search or filter.</p>
          </div>
        ) : (
          <ul className="task-list">
            {visible.map((task) => (
              <TaskItem key={task._id} task={task} onUpdate={updateTask} onDelete={deleteTask} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
